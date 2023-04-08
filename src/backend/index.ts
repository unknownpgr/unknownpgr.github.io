import fs from "fs/promises";
import path from "path";
import { processPostBody } from "./parser";
import { lockedTask as withLock } from "./sync";

interface Post {
  imageMapping: Record<string, string>;
  title: string;
  date: string;
  category: string;
  html: string;
  name: string;
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

// Read-only, non-pure function
async function parsePost(postName: string): Promise<Omit<Post, "name"> | null> {
  const postDir = path.join("../posts", postName);
  const files = await fs.readdir(postDir);
  const markdownFile = files.find((file) => file.endsWith(".md"));
  if (!markdownFile) return null;

  const markdownPath = path.join(postDir, markdownFile);
  const markdownStr = await fs.readFile(markdownPath, "utf-8");
  const fileMap = await buildFileMap(postDir, postDir);
  const post = await processPostBody(markdownStr, fileMap);
  return post;
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

async function processPost(postName: string): Promise<Post | null> {
  if (!(await isValidPostName(postName))) return null;

  const post = await parsePost(postName);
  if (!post) return null;

  const postDate = post.date;
  const updatedPostName = await normalizePostName(postName, postDate);
  if (!updatedPostName) return null;
  if (updatedPostName !== postName) await fs.rename(postName, updatedPostName);

  if (!post) return null;
  const mapping = post.imageMapping;
  await Promise.all(
    Object.entries(mapping).map(async ([key, value]) => {
      await fs.copyFile(
        path.join("../posts", postName, key),
        path.join("public", value)
      );
    })
  );
  return {
    ...post,
    name: updatedPostName,
  };
}

async function processPosts() {
  const postsDir = "../posts";
  const postDirs = await fs.readdir(postsDir);
  let posts = await Promise.all(
    postDirs.map(async (postName) => {
      const processedPost = await processPost(postName);
      return processedPost;
    })
  );
  let filtered = posts.filter((post) => post !== null) as Post[];
  filtered = filtered.sort((a, b) => {
    if (a.date < b.date) return 1;
    if (a.date > b.date) return -1;
    return 0;
  });
  return filtered;
}

async function getProcessedPosts() {
  return withLock(".lock", async () => {
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
      cache = JSON.parse(await fs.readFile(cachePath, "utf-8")) as Post[];
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err.code !== "ENOENT") throw e;
    }

    if (cache) return cache;

    cache = await processPosts();
    await fs.writeFile(cachePath, JSON.stringify(cache));

    return cache;
  });
}

export async function getPost(postName: string) {
  const posts = await getProcessedPosts();
  return posts.find((post) => post.name === postName);
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
