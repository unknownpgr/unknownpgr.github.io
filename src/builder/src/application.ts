import fs from "fs/promises";
import path from "path";
import { SitemapStream, streamToPromise } from "sitemap";
import {
  BlogService,
  Directory,
  File,
  Post,
  VersionedPost,
} from "./core/model";
import { minify } from "html-minifier";

// File IO

async function readFile(filePath: string): Promise<File> {
  const data = await fs.readFile(filePath);
  const name = path.basename(filePath);
  return { name, data };
}

async function readDir(dirPath: string): Promise<Directory> {
  const children = await fs.readdir(dirPath);
  const files = await Promise.all(
    children.map(async (child) => {
      const childPath = path.join(dirPath, child);
      const stat = await fs.stat(childPath);
      if (stat.isDirectory()) return readDir(childPath);
      return readFile(childPath);
    })
  );
  const name = path.basename(dirPath);
  return { name, children: files };
}

async function write(dir: Directory, root: string): Promise<void> {
  const dirPath = path.join(root, dir.name);
  await fs.mkdir(dirPath, { recursive: true });
  await Promise.all(
    dir.children.map(async (child) => {
      if ("children" in child) {
        return write(child, dirPath);
      }
      const filePath = path.join(dirPath, child.name);
      await fs.writeFile(filePath, child.data);
    })
  );
}

function minifyDir(dir: Directory): void {
  for (const child of dir.children) {
    // Check if child is a directory
    if ("children" in child) {
      minifyDir(child);
      continue;
    }

    // Check if file is html or css
    if (!child.name.endsWith(".html") && !child.name.endsWith(".css")) {
      continue;
    }

    // Minify
    const data = child.data.toString();
    const minified = minify(data, {
      collapseWhitespace: true,
      conservativeCollapse: true,
      removeComments: true,
      minifyCSS: true,
      collapseBooleanAttributes: true,
      collapseInlineTagWhitespace: true,
      minifyJS: true,
    });
    child.data = Buffer.from(minified);
  }
}

// Formatting

function formatDate(date: string, time: boolean = true) {
  const p = (s: number) => s.toString().padStart(2, "0");
  const d = new Date(date);
  const Y = d.getFullYear();
  const M = p(d.getMonth() + 1);
  const D = p(d.getDate());
  if (!time) return `${Y}-${M}-${D}`;

  const h = p(d.getHours());
  const m = p(d.getMinutes());
  const s = p(d.getSeconds());
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}

function createIndexString(
  name: string,
  date: string,
  stringLength: number = 80
) {
  function getWidth(char: string) {
    const code = char.charCodeAt(0);
    // Escape characters like 0xe9(é)
    if (code >= 0x80 && code <= 0x9f) return 1;
    if (code >= 0xa1 && code <= 0xdf) return 1;
    if (code >= 0xe0 && code <= 0xff) return 1;
    // Normal characters
    if (code >= 0x20 && code <= 0x7e) return 1;
    if (code >= 0xff00 && code <= 0xffef) return 2;
    // For emojis, only check the first character.
    if (code == 0xd83d) return 1;
    if (code >= 0xdc00 && code <= 0xdfff) return 0;
    // Escape zero-width characters.
    if (code >= 0x200b && code <= 0x200f) return 0;

    return 2;
  }

  function getLength(str: string) {
    let length = 0;
    for (let i = 0; i < str.length; i++) {
      const width = getWidth(str.charAt(i));
      length += width;
    }
    return length;
  }

  while (getLength(name) > stringLength - 3) {
    name = name.slice(0, -1);
  }
  const nameLength = getLength(name);

  let dots = "  ";
  for (let i = 0; i < stringLength - nameLength; i++) {
    dots += ".";
  }
  dots += "  ";

  return `${name}${dots}${date}`;
}

function getAdjacentPosts(posts: VersionedPost[], id: string) {
  const post = posts.find((p) => p.id === id);
  if (!post) return { prev: null, next: null };
  const index = posts.indexOf(post);
  return {
    prev: index > 0 ? posts[index - 1] : null,
    next: index < posts.length - 1 ? posts[index + 1] : null,
  };
}

function name(version: string | null) {
  if (version === null) return `index.html`;
  if (version == "ko") return `index.html`;
  return `index.${version}.html`;
}

function url(post: VersionedPost) {
  return `/posts/${post.id}/${name(post.version)}`;
}

function expandLanguage(lang: string) {
  if (lang === "ko") return "Korean";
  if (lang === "en") return "English";
  throw new Error(`Unknown language: ${lang}`);
}

function language(target: string, current: string) {
  if (target === current) return `<span>${expandLanguage(target)}</span>`;
  return `<span><a href="./${name(target)}">${expandLanguage(
    target
  )}</a></span>`;
}

export interface BlogTemplate {
  renderMain(data: Record<string, string>): string;
  renderPost(data: Record<string, string>): string;
}

export class BlogApplication {
  private readonly postPath: string;
  private readonly outputPath: string;
  private readonly host: string;

  constructor(
    private readonly blogService: BlogService,
    private readonly template: BlogTemplate,
    {
      postPath = "../../posts",
      outputDir = "../../output",
      host = "https://localhost:8000",
    }
  ) {
    this.postPath = path.resolve(postPath);
    this.outputPath = path.resolve(outputDir);
    this.host = host;
  }

  private async fixPost(postPath: string): Promise<void> {
    const postDir = await readDir(postPath);
    const fixes = this.blogService.fixPost(postDir);
    await Promise.all(
      fixes.map(async (fix) => {
        const filePath = path.join(postPath, ...fix.path);
        await fs.writeFile(filePath, fix.value);
      })
    );
  }

  public async fixAllPosts(): Promise<void> {
    const postNames = await fs.readdir(this.postPath);
    await Promise.all(
      postNames.map(async (postName) => {
        if (postName.startsWith(".")) return;
        if (postName.startsWith("_")) return;
        await this.fixPost(path.join(this.postPath, postName));
      })
    );
  }

  private async getSitemap(posts: VersionedPost[]): Promise<Buffer> {
    const sitemapStream = new SitemapStream({
      hostname: this.host,
    });
    sitemapStream.write({ url: `/`, changeFreq: "daily", priority: 1 });
    for (const post of posts) {
      try {
        sitemapStream.write({
          url: url(post),
          changeFreq: "monthly",
          priority: 0.5,
          lastmod: post.date,
        });
      } catch {}
    }
    sitemapStream.end();
    const sitemap = await streamToPromise(sitemapStream);
    return sitemap;
  }

  private compileVersionedMainHtml(
    posts: VersionedPost[],
    version: string,
    availableVersions: string[]
  ): File {
    // Build post list
    const postListHtml = posts
      .sort((a, b) => {
        if (a.date < b.date) return 1;
        if (a.date > b.date) return -1;
        return 0;
      })
      .map((post) => {
        return `<div><a href="${url(post)}">${createIndexString(
          post.title,
          formatDate(post.date, false),
          60
        )}</a></div></br>`;
      })
      .join("");

    // Build version list
    const languageListHtml = availableVersions
      .map((v) => language(v, version))
      .join(", ");

    // Build main html
    const mainHtml = this.template.renderMain({
      head: "",
      footer: "",
      postList: postListHtml,
      languages: languageListHtml,
      url: "/",
      host: this.host,
      title: "Unknownpgr's Blog",
    });
    return { name: name(version), data: Buffer.from(mainHtml) };
  }

  private compileVersionedPosts(posts: VersionedPost[]): Directory {
    const postsDir: Directory = {
      name: "posts",
      children: [],
    };
    posts
      .sort((a, b) => {
        if (a.date < b.date) return 1;
        if (a.date > b.date) return -1;
        return 0;
      })
      .forEach((post) => {
        const languageListHtml = post.availableVersions
          .map((v) => language(v, post.version))
          .join(", ");

        const { prev, next } = getAdjacentPosts(posts, post.id);

        const prevTag =
          prev && `<div><a href="${url(prev)}">Prev: ${prev.title}</a></div>`;
        const nextTag =
          next && `<div><a href="${url(next)}">Next: ${next.title}</a></div>`;

        const postHtml = this.template.renderPost({
          title: post.title,
          date: formatDate(post.date),
          languages: languageListHtml,
          content: post.html,
          url: url(post),
          host: this.host,
          prev: prevTag || "",
          next: nextTag || "",
        });

        const postDir: Directory = {
          name: post.id,
          children: [{ name: name(post.version), data: Buffer.from(postHtml) }],
        };
        postsDir.children.push(postDir);
      });

    return postsDir;
  }

  public async compilePosts(): Promise<void> {
    const output: Directory = {
      name: path.basename(this.outputPath),
      children: [],
    };

    const posts = await Promise.all(
      (
        await fs.readdir(this.postPath)
      )
        .filter((postName) => {
          if (postName.startsWith(".")) return false;
          if (postName.startsWith("_")) return false;
          return true;
        })
        .map(async (postName) => {
          const postDir = await readDir(path.join(this.postPath, postName));
          return this.blogService.parsePost(postDir);
        })
    );

    // Add all non-post files
    const postsDir: Directory = {
      name: "posts",
      children: [],
    };
    posts.forEach((post) => postsDir.children.push(post.files));
    output.children.push(postsDir);

    // Convert posts to versioned posts
    const versionedPosts: VersionedPost[] = posts
      .map(({ id, date, tags, versions }) =>
        versions.map(({ html, md, title, version }) => ({
          id,
          title,
          date,
          tags,
          html,
          md,
          version,
          availableVersions: versions.map((v) => v.version),
        }))
      )
      .flat();

    // Group versioned posts by version
    const versions: Record<string, VersionedPost[]> = {};
    versionedPosts.forEach((post) => {
      if (!versions[post.version]) versions[post.version] = [];
      versions[post.version].push(post);
    });

    // Compile versioned posts
    const availableVersions = Object.keys(versions);
    for (const version in versions) {
      const posts = versions[version];
      const mainHtml = this.compileVersionedMainHtml(
        posts,
        version,
        availableVersions
      );
      const postsDir = this.compileVersionedPosts(posts);
      output.children.push(mainHtml);
      output.children.push(postsDir);
    }

    // Add public files
    const publicFiles = await readDir(__dirname + "/public");
    output.children.push(...publicFiles.children);

    // Add sitemap
    const sitemap = await this.getSitemap(versionedPosts);
    output.children.push({ name: "sitemap.xml", data: sitemap });

    // Delete old output
    if (await fs.stat(this.outputPath).catch(() => null)) {
      const files = await fs.readdir(this.outputPath);
      await Promise.all(
        files.map((child) =>
          fs.rm(path.join(this.outputPath, child), {
            recursive: true,
            force: true,
          })
        )
      );
    }

    // Minify
    minifyDir(output);

    // Write new output
    const root = path.dirname(this.outputPath);
    await write(output, root);
  }
}
