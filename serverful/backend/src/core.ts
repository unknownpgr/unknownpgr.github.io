import fs from "fs/promises";
import path from "path";
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
  }

  public clearLoadedPosts() {
    this.posts = {};
  }

  public async getPost(postId: string): Promise<PostData> {
    if (!this.posts[postId]) {
      await this.loadPost(postId);
    }
    return this.posts[postId];
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
            const post = await this.getPost(postDir);
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

  public async getImage(imageName: string): Promise<Buffer> {
    const image = this.files[imageName];
    if (!image) {
      throw new Error(`Image ${imageName} not found`);
    }
    return image;
  }
}
