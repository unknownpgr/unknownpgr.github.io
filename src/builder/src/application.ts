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

function getVersions(post: Post[]): string[] {
  const versions: Set<string> = new Set();
  post.forEach((p) => p.versions.forEach((v) => versions.add(v.version)));
  return Array.from(versions);
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

const HOST = "http://localhost:57303";

export class BlogApplication {
  constructor(
    private readonly blogService: BlogService,
    private readonly postPath: string = "../../posts"
  ) {}

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

  private async getSitemap(posts: Post[]): Promise<Buffer> {
    const sitemapStream = new SitemapStream({
      hostname: HOST,
    });
    sitemapStream.write({ url: `/`, changeFreq: "daily", priority: 1 });
    for (const post of posts) {
      try {
        sitemapStream.write({
          url: `/posts/${post.id}/index.html`,
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

  private async getVersionedMainHtml(
    posts: VersionedPost[],
    version: string
  ): Promise<File> {
    // Load templates
    const mainTemplate = await fs.readFile(__dirname + "/templates/main.html", {
      encoding: "utf-8",
    });
    const head = await fs.readFile(__dirname + "/templates/head.html", {
      encoding: "utf-8",
    });
    const footer = await fs.readFile(__dirname + "/templates/footer.html", {
      encoding: "utf-8",
    });

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

    // Build main html
    const mainHtml = mainTemplate
      .replaceAll("{{head}}", head)
      .replaceAll("{{footer}}", footer)
      .replaceAll("{{postList}}", postListHtml)
      .replaceAll("{{url}}", HOST)
      .replaceAll("{{title}}", "Unknownpgr's Blog");

    return { name: name(version), data: Buffer.from(mainHtml) };
  }

  private async compileVersionedPosts(
    posts: VersionedPost[],
    version: string
  ): Promise<Directory> {
    const postTemplate = await fs.readFile(__dirname + "/templates/post.html", {
      encoding: "utf-8",
    });
    const head = await fs.readFile(__dirname + "/templates/head.html", {
      encoding: "utf-8",
    });
    const footer = await fs.readFile(__dirname + "/templates/footer.html", {
      encoding: "utf-8",
    });

    const postsDir: Directory = {
      name: "posts",
      children: [],
    };
    posts.forEach((post) => {
      const { prev, next } = getAdjacentPosts(posts, post.id);

      const prevTag =
        prev && `<div><a href="${url(prev)}">Prev: ${prev.title}</a></div>`;
      const nextTag =
        next && `<div><a href="${url(next)}">Next: ${next.title}</a></div>`;

      const postHtml = postTemplate
        .replaceAll("{{head}}", head)
        .replaceAll("{{footer}}", footer)
        .replaceAll("{{title}}", post.title)
        .replaceAll("{{date}}", formatDate(post.date))
        .replaceAll("{{content}}", post.html)
        .replaceAll("{{url}}", `${HOST}/posts/${post.id}/index.html`)
        .replaceAll("{{prev}}", prevTag || "")
        .replaceAll("{{next}}", nextTag || "");
      // .replaceAll(/<!--[\s\S]*?-->/g, "")
      // .replaceAll(/\s+/g, " ");
      const postDir: Directory = {
        name: post.id,
        children: [{ name: name(version), data: Buffer.from(postHtml) }],
      };
      postsDir.children.push(postDir);
    });

    return postsDir;
  }

  public async compilePosts(): Promise<void> {
    const output: Directory = {
      name: "output",
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
    {
      const postsDir: Directory = {
        name: "posts",
        children: [],
      };
      posts.forEach((post) => postsDir.children.push(post.files));
      output.children.push(postsDir);
    }

    // Add versioned main html
    const versions = getVersions(posts);
    await Promise.all(
      versions.map(async (version) => {
        // Filter posts by version
        const versionedPosts = posts
          .map((post) => {
            const versionedData = post.versions.find(
              (v) => v.version === version
            );
            if (!versionedData) return null;
            const versionedPost: VersionedPost = {
              id: post.id,
              title: versionedData.title,
              date: post.date,
              html: versionedData.html,
              md: versionedData.md,
              tags: post.tags,
              version,
            };
            return versionedPost;
          })
          .filter((p) => p !== null) as VersionedPost[];

        // Add versioned main html
        const mainHtml = await this.getVersionedMainHtml(
          versionedPosts,
          version
        );
        output.children.push(mainHtml);

        // Compile versioned posts
        const versionedDir = await this.compileVersionedPosts(
          versionedPosts,
          version
        );
        output.children.push(versionedDir);
      })
    );

    const publicFiles = await readDir(__dirname + "/public");
    output.children.push(...publicFiles.children);

    const sitemap = await this.getSitemap(posts);
    output.children.push({ name: "sitemap.xml", data: sitemap });

    const root = path.resolve("../../");
    const outputDir = path.join(root, "output");
    if (await fs.stat(outputDir).catch(() => null)) {
      await Promise.all(
        (
          await fs.readdir(outputDir)
        ).map((child) =>
          fs.rm(path.join(outputDir, child), { recursive: true, force: true })
        )
      );
    }
    await write(output, root);
  }
}
