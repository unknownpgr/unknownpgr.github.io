import fs from "fs/promises";
import path from "path";
import { BlogService, Directory, File, Post } from "./core/model";
import { BlogServiceImpl } from "./core/service";
import { OnMemoryPostParser } from "./parser";
import { SitemapStream, streamToPromise } from "sitemap";

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

/**
 * Format date to YYYY-MM-DD HH:MM:SS, with leading zeros
 * @param date ISO 8601 date string
 */
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

class BlogApplication {
  constructor(
    private readonly blogService: BlogService,
    private readonly postPath: string
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
      hostname: "https://unknownpgr.com/",
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

  public async compilePosts(): Promise<void> {
    const HOST = "https://unknownpgr.com";
    console.log("Parsing posts...");
    let start = Date.now();
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
    console.log(`Parsed ${posts.length} posts in ${Date.now() - start}ms`);

    const output: Directory = {
      name: "output",
      children: [],
    };

    const mainTemplate = await fs.readFile(__dirname + "/templates/main.html", {
      encoding: "utf-8",
    });
    const postTemplate = await fs.readFile(__dirname + "/templates/post.html", {
      encoding: "utf-8",
    });
    const head = await fs.readFile(__dirname + "/templates/head.html", {
      encoding: "utf-8",
    });

    const postListHtml = posts
      .sort((a, b) => {
        if (a.date < b.date) return 1;
        if (a.date > b.date) return -1;
        return 0;
      })
      .map((post) => {
        const mainVersion = post.versions.find(
          (v) => v.version === post.mainVersion
        );
        if (!mainVersion) return "";
        return `<div><a href="/posts/${post.id}/index.html">${createIndexString(
          mainVersion.title,
          formatDate(post.date, false),
          60
        )}</a></div></br>`;
      })
      .join("");

    const mainHtml = mainTemplate
      .replaceAll("{{head}}", head)
      .replaceAll("{{postList}}", postListHtml)
      .replaceAll("{{url}}", HOST)
      .replaceAll("{{title}}", "Unknownpgr's Blog");
    output.children.push({ name: "index.html", data: Buffer.from(mainHtml) });

    const postsDir: Directory = {
      name: "posts",
      children: [],
    };
    posts.forEach((post) => {
      const mainVersion = post.versions.find(
        (v) => v.version === post.mainVersion
      );
      if (!mainVersion) return;

      const postHtml = postTemplate
        .replaceAll("{{head}}", head)
        .replaceAll("{{title}}", mainVersion.title)
        .replaceAll("{{date}}", formatDate(post.date))
        .replaceAll("{{content}}", mainVersion.html)
        .replaceAll("{{url}}", `${HOST}/posts/${post.id}/index.html`);
      // .replaceAll(/<!--[\s\S]*?-->/g, "")
      // .replaceAll(/\s+/g, " ");
      const postDir: Directory = {
        name: post.id,
        children: [
          { name: "index.html", data: Buffer.from(postHtml) },
          ...post.files.children,
        ],
      };
      postsDir.children.push(postDir);
    });
    output.children.push(postsDir);

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

const POST_PATH = process.env.POST_PATH || path.join("../../", "posts");

async function main() {
  const parser = new OnMemoryPostParser();
  const blogService = new BlogServiceImpl(parser);
  const app = new BlogApplication(blogService, POST_PATH);
  await app.compilePosts();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
