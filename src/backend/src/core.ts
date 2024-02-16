import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { OnMemoryPostParser } from "./parser";
import { SitemapStream, streamToPromise } from "sitemap";
import { createGzip } from "zlib";
import { Post, PostDTO, PostParser, PostSummary } from "./core/model";

async function buildFileMap(
  root: string,
  relative: string
): Promise<{ [key: string]: Buffer }> {
  const fileMap: { [key: string]: Buffer } = {};
  const files = await fs.readdir(root);
  for (const file of files) {
    const filePath = path.join(root, file);
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      const subFileMap = await buildFileMap(filePath, relative);
      Object.assign(fileMap, subFileMap);
    } else {
      const relativePath = path.relative(relative, filePath);
      fileMap[relativePath] = await fs.readFile(filePath);
    }
  }
  return fileMap;
}

async function hashDirectory(dir: string) {
  const files = await fs.readdir(dir);
  const hash = crypto.createHash("md5");
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) hash.update(await hashDirectory(filePath));
    else hash.update(await fs.readFile(filePath));
  }
  return hash.digest("hex");
}

export class BlogService {
  // Initialization-related code

  private posts: Record<string, { cacheKey: string; data: Post }> = {};
  private files: Record<string, Buffer> = {};

  private constructor(
    private postsDir: string,
    private postParser: PostParser = new OnMemoryPostParser("/api/files/")
  ) {}

  private async init() {
    // Check if the post directory exists
    try {
      await fs.access(this.postsDir);
    } catch {
      throw new Error(`Post directory ${this.postsDir} does not exist`);
    }
  }

  public static async create(postDir: string) {
    const service = new BlogService(postDir);
    await service.init();
    return service;
  }

  // Blog-related code
  private static summary(post: Post): PostSummary {
    return {
      id: post.id,
      title: post.title,
      date: post.date,
      tags: post.tags,
    };
  }

  private async getPostIds(): Promise<string[]> {
    const postIds = await fs.readdir(this.postsDir);
    return postIds.filter(
      (postDir) => !postDir.startsWith("_") && !postDir.startsWith(".")
    );
  }

  private async validatePostId(postId: string) {
    if (!postId) throw new Error("postId is required");
    if (typeof postId !== "string") throw new Error("postId must be a string");
    if (postId.startsWith("_")) throw new Error("postId cannot start with _");
    if (postId.startsWith(".")) throw new Error("postId cannot start with .");

    // Check if the post directory exists
    const postPath = path.join(this.postsDir, postId);
    try {
      const stat = await fs.stat(postPath);
      if (!stat.isDirectory()) throw new Error("Post is not a directory");
    } catch {
      throw new Error(`Post ${postId} does not exist`);
    }
  }

  private async loadPost(
    postId: string,
    ignoreCache: boolean = false
  ): Promise<Post> {
    await this.validatePostId(postId);

    // Check cache
    if (!ignoreCache && this.posts[postId]) return this.posts[postId].data;
    const hash = await hashDirectory(this.postsDir);
    if (this.posts[postId]?.cacheKey === hash) return this.posts[postId].data;

    const postPath = path.join(this.postsDir, postId);
    const postFiles = await buildFileMap(postPath, postPath);
    const {
      title,
      date,
      tags,
      html,
      files,
      markdownFilename,
      updatedMarkdown,
    } = await this.postParser.parse({ files: postFiles });

    const post: Post = {
      id: postId,
      title,
      date,
      tags,
      html,
      files,
    };

    // Update file mapping
    Object.assign(this.files, files);

    // Update post data
    this.posts[postId] = {
      cacheKey: hash,
      data: post,
    };

    // Update markdown
    const markdownPath = path.join(postPath, markdownFilename);
    await fs.writeFile(markdownPath, updatedMarkdown);

    return post;
  }

  private async loadPosts(ignoreCache: boolean = false): Promise<Post[]> {
    const ids = await this.getPostIds();
    const posts = await Promise.all(
      ids.map(async (id) => {
        try {
          return await this.loadPost(id, ignoreCache);
        } catch {
          console.error(`Failed to load post ${id}`);
          return null;
        }
      })
    );
    return posts
      .filter((post): post is Post => post !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  private async getAdjacentPosts(postId: string): Promise<{
    previous: PostSummary | null;
    next: PostSummary | null;
  }> {
    const posts = await this.loadPosts();
    const index = posts.findIndex((post) => post.id === postId);
    const previous = index > 0 ? BlogService.summary(posts[index - 1]) : null;
    const next =
      index < posts.length - 1 ? BlogService.summary(posts[index + 1]) : null;
    return {
      previous,
      next,
    };
  }

  public async getPostList(): Promise<PostSummary[]> {
    const postIds = await this.getPostIds();
    const posts: (PostSummary | null)[] = await Promise.all(
      postIds.map(async (postId) => {
        try {
          const post = await this.loadPost(postId);
          return BlogService.summary(post);
        } catch (err) {
          console.error(err);
          return null;
        }
      })
    );
    return posts
      .filter((post): post is PostSummary => post !== null)
      .sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }

  public async getPost(postId: string): Promise<PostDTO> {
    const post = await this.loadPost(postId, true);
    const adjacentPosts = await this.getAdjacentPosts(postId);
    return {
      id: post.id,
      title: post.title,
      date: post.date,
      tags: post.tags,
      html: post.html,
      adjacentPosts,
    };
  }

  public async getFile(fileName: string): Promise<Buffer> {
    const file = this.files[fileName];
    if (!file) throw new Error(`File ${fileName} not found`);
    return file;
  }

  public async getSitemap(): Promise<Buffer> {
    const sitemapStream = new SitemapStream({
      hostname: "https://unknownpgr.com/",
    });
    const pipeline = sitemapStream.pipe(createGzip());
    sitemapStream.write({ url: `/`, changeFreq: "daily", priority: 1 });
    const postIds = await this.getPostIds();
    for (const postId of postIds) {
      try {
        sitemapStream.write({
          url: `/posts/${postId}`,
          changeFreq: "monthly",
          priority: 0.5,
          lastmod: (await this.loadPost(postId)).date,
        });
      } catch {}
    }
    sitemapStream.end();
    const sitemap = await streamToPromise(pipeline);
    return sitemap;
  }
}
