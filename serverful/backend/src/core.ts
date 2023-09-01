import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { OnMemoryPostParser } from "./parser";

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

export interface PostParser {
  parse(params: PostParserParams): Promise<PostData>;
}

export class BlogService {
  // Initialization-related code

  private cache: Record<
    string,
    { key: string; timestamp: number; post: PostData }
  > = {};

  private fileCache: Record<string, Buffer> = {};

  private constructor(
    private postDir: string,
    private cacheLifetime: number = 1000 * 60 * 60 * 24, // 1 day
    private postParser: PostParser = new OnMemoryPostParser("/api/imgs/")
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
  private async getPost(postId: string): Promise<PostData> {
    // Validate postId
    if (
      !postId ||
      typeof postId !== "string" ||
      postId.startsWith("_") ||
      postId.startsWith(".")
    ) {
      throw new Error(`Invalid postId ${postId}`);
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

    const postPath = path.join(this.postDir, postId);
    const files = await buildFileMap(postPath, postPath);
    const post = await this.postParser.parse({ files });
    return {
      ...post,
      id: postId,
    };
  }

  private async getCachedPost(postId: string): Promise<PostData> {
    const cache = this.cache[postId];
    if (cache) {
      const now = Date.now();
      if (now - cache.timestamp < this.cacheLifetime) {
        return cache.post;
      }
    }

    const hash = crypto.createHash("md5");

    async function hashDirectory(directory: string) {
      const files = await fs.readdir(directory);
      files.sort();
      for (const file of files) {
        const filePath = path.join(directory, file);
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
          await hashDirectory(filePath);
        } else {
          const content = await fs.readFile(filePath);
          hash.update(content);
        }
      }
    }

    const postPath = path.join(this.postDir, postId);
    await hashDirectory(postPath);
    const digest = hash.digest("hex");

    if (cache && cache.key === digest) {
      cache.timestamp = Date.now();
      return cache.post;
    } else {
      const post = await this.getPost(postId);
      this.cache[postId] = {
        key: digest,
        timestamp: Date.now(),
        post,
      };
      Object.assign(this.fileCache, post.fileMapping);
      return post;
    }
  }

  public setCacheLifetime(lifetime: number) {
    this.cacheLifetime = lifetime;
  }

  public async getPostMetadata(): Promise<PostMetadata[]> {
    const postIds = await fs.readdir(this.postDir);
    const posts: (PostMetadata | null)[] = await Promise.all(
      postIds
        .filter(
          (postDir) => !postDir.startsWith("_") && !postDir.startsWith(".")
        )
        .map(async (postDir) => {
          try {
            const post = await this.getCachedPost(postDir);
            const metadata: PostMetadata = {
              id: post.id,
              title: post.title,
              date: post.date,
              tags: post.tags,
            };
            return metadata;
          } catch (err) {
            console.error(err);
            return null;
          }
        })
    );
    return posts.filter((post): post is PostMetadata => post !== null);
  }

  public async getPostData(postId: string): Promise<PostData> {
    return await this.getCachedPost(postId);
  }

  public async getImage(imageName: string): Promise<Buffer> {
    const image = this.fileCache[imageName];
    if (!image) {
      throw new Error(`Image ${imageName} not found`);
    }
    return image;
  }
}
