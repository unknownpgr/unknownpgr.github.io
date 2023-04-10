import fs from "fs/promises";
import path from "path";
import { Post, processPostBody } from "./parser";
import { lockedTask as withLock } from "./sync";

interface NamedPost extends Post {
  name: string;
}

const POSTS_DIR = "../posts";

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

async function normalizePostName(postName: string, postDate: string) {
  let updatedPostName = postName.replace(/^[0-9]{4}-[0-9]{2}-[0-9]{2}-/, "");
  updatedPostName = `${postDate.substring(0, 10)}-${updatedPostName}`
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-");
  return updatedPostName;
}

async function isValidPostName(postName: string) {
  if (postName.startsWith("_") || postName.startsWith(".")) return false;
  return true;
}

async function parsePost(postName: string): Promise<{
  post: Post;
  markdownFile: string;
} | null> {
  const postDir = path.join(POSTS_DIR, postName);
  const files = await fs.readdir(postDir);
  const markdownFile = files.find((file) => file.endsWith(".md"));
  if (!markdownFile) return null;

  const markdownPath = path.join(postDir, markdownFile);
  const markdownStr = await fs.readFile(markdownPath, "utf-8");
  const fileMap = await buildFileMap(postDir, postDir);
  const post = await processPostBody(markdownStr, fileMap);
  return { post, markdownFile };
}

async function processPost(postName: string): Promise<NamedPost | null> {
  if (!(await isValidPostName(postName))) return null;

  const parsedPost = await parsePost(postName);
  if (!parsedPost) return null;

  const { post, markdownFile } = parsedPost;
  const postDate = post.date;
  const updatedPostName = await normalizePostName(postName, postDate);
  if (!updatedPostName) return null;
  if (updatedPostName !== postName) {
    const postPath = path.join(POSTS_DIR, postName);
    const updatedPostPath = path.join(POSTS_DIR, updatedPostName);
    await fs.rename(postPath, updatedPostPath);
  }

  if (!post) return null;

  // Copy images to public folder
  const mapping = post.imageMapping;
  await Promise.all(
    Object.entries(mapping).map(async ([key, value]) => {
      await fs.copyFile(
        path.join(POSTS_DIR, postName, key),
        path.join("public", value)
      );
    })
  );

  // Rewrite post body
  const markdownFilePath = path.join(POSTS_DIR, updatedPostName, markdownFile);
  fs.writeFile(markdownFilePath, post.postStr);

  return {
    ...post,
    name: updatedPostName,
  };
}

async function processPosts() {
  const postsDir = POSTS_DIR;
  const postDirs = await fs.readdir(postsDir);
  let posts = await Promise.all(
    postDirs.map(async (postName) => {
      const processedPost = await processPost(postName);
      return processedPost;
    })
  );
  let filtered = posts.filter((post) => post !== null) as NamedPost[];
  filtered = filtered.sort((a, b) => {
    if (a.date < b.date) return 1;
    if (a.date > b.date) return -1;
    return 0;
  });
  return filtered;
}

async function getProcessedPosts() {
  return withLock(".lock", async () => {
    console.log("Processing posts...");
    const cacheDir = ".cache";
    try {
      await fs.mkdir(cacheDir);
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err.code !== "EEXIST") throw e;
    }

    const cacheFile = "posts.json";
    const cachePath = path.join(cacheDir, cacheFile);
    let cache = null;
    try {
      cache = JSON.parse(await fs.readFile(cachePath, "utf-8")) as NamedPost[];
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err.code !== "ENOENT") throw e;
    }

    if (cache) {
      console.log("Using cached posts...");
      return cache;
    }

    console.log("Generating new cache...");
    cache = await processPosts();
    await fs.writeFile(cachePath, JSON.stringify(cache));

    console.log("Done processing posts.");
    return cache;
  });
}

export async function getPost(postName: string) {
  const posts = await getProcessedPosts();
  return posts.find((post) => post.name === postName) || null;
}

export async function getPostsMetadata() {
  const posts = await getProcessedPosts();
  return posts.map((post) => ({
    name: post.name,
    title: post.title,
    date: post.date,
    category: post.category,
  }));
}
