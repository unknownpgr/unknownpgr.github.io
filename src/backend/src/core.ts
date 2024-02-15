import fs from "fs/promises";
import path from "path";
import { OnMemoryPostParser } from "./parser";
import { SitemapStream, streamToPromise } from "sitemap";
import { createGzip } from "zlib";

export interface PostMetadata {
  id: string;
  title: string;
  date: string;
  tags: string[];
}

export interface PostData extends PostMetadata {
  html: string;
  fileMapping: Record<string, Buffer>;
}

export interface PostParserParams {
  files: { [key: string]: Buffer };
}

export interface PostParserResult {
  postData: PostData;
  markdownFilename: string;
  fixedMarkdown: string;
}

export interface PostParser {
  parse(params: PostParserParams): Promise<PostParserResult>;
}

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

export class BlogService {
  // Initialization-related code

  private posts: Record<string, PostData> = {};
  private files: Record<string, Buffer> = {};

  private constructor(
    private postDir: string,
    private postParser: PostParser = new OnMemoryPostParser("/api/files/")
  ) {}

  private async init() {
    // Check if the post directory exists
    try {
      await fs.access(this.postDir);
    } catch {
      throw new Error(`Post directory ${this.postDir} does not exist`);
    }
  }

  public static async create(postDir: string) {
    const service = new BlogService(postDir);
    await service.init();
    return service;
  }

  // Blog-related code
  private async loadPost(postId: string) {
    // Validate postId
    if (
      !postId ||
      typeof postId !== "string" ||
      postId.startsWith("_") ||
      postId.startsWith(".")
    ) {
      throw new Error(`Invalid postId ${postId}`);
    }

    try {
      const postPath = path.join(this.postDir, postId);
      const files = await buildFileMap(postPath, postPath);
      const { postData, markdownFilename, fixedMarkdown } =
        await this.postParser.parse({ files });

      // Update file mapping
      Object.assign(this.files, postData.fileMapping);

      // Update post data
      this.posts[postId] = { ...postData, id: postId };

      // Update markdown
      const markdownPath = path.join(postPath, markdownFilename);
      await fs.writeFile(markdownPath, fixedMarkdown);
    } catch (error) {
      console.error("Failed to load post " + postId);
      console.error(error);
    }
  }

  private async getPostIds(): Promise<string[]> {
    const postIds = await fs.readdir(this.postDir);
    return postIds.filter(
      (postDir) => !postDir.startsWith("_") && !postDir.startsWith(".")
    );
  }

  public clearLoadedPosts() {
    this.posts = {};
  }

  public async getPost(postId: string): Promise<PostData> {
    if (!this.posts[postId]) {
      await this.loadPost(postId);
    } else {
      this.loadPost(postId);
    }
    return this.posts[postId];
  }

  public async getPostMetadata(postId: string): Promise<PostMetadata> {
    const post = await this.getPost(postId);
    const metadata: PostMetadata = {
      id: post.id,
      title: post.title,
      date: post.date,
      tags: post.tags,
    };
    return metadata;
  }

  public async getPostsMetadata(): Promise<PostMetadata[]> {
    const postIds = await this.getPostIds();
    const posts: (PostMetadata | null)[] = await Promise.all(
      postIds.map(async (postDir) => {
        try {
          return await this.getPostMetadata(postDir);
        } catch (err) {
          console.error(err);
          return null;
        }
      })
    );
    return posts
      .filter((post): post is PostMetadata => post !== null)
      .sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }

  public async getFile(fileName: string): Promise<Buffer> {
    const file = this.files[fileName];
    if (!file) throw new Error(`File ${fileName} not found`);
    return file;
  }

  public async getAdjacentPosts(postId: string): Promise<{
    previous: PostMetadata | null;
    next: PostMetadata | null;
  }> {
    const postMetadata = await this.getPostsMetadata();
    const postIds = postMetadata.map((post) => post.id);
    const index = postIds.indexOf(postId);
    const previousId = postIds[index + 1];
    const nextId = postIds[index - 1];
    const previous = previousId ? await this.getPostMetadata(previousId) : null;
    const next = nextId ? await this.getPostMetadata(nextId) : null;
    return { previous, next };
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
          lastmod: (await this.getPost(postId)).date,
        });
      } catch {}
    }
    sitemapStream.end();
    const sitemap = await streamToPromise(pipeline);
    return sitemap;
  }
}
