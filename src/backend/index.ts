import fs from "fs/promises";
import yaml from "yaml";
import markdownIt from "markdown-it";
import hljs from "highlight.js";
import katex from "./katex-converter";
import path from "path";
import htmlParser from "node-html-parser";
import crypto from "crypto";
import { ICategory, IPost, IPostMetadata } from "../types";

const markdown = markdownIt({
  html: true,
  langPrefix: "language-",
  linkify: false,
  typographer: false,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (_) {}
    }
    return ""; // use external default escaping
  },
});
markdown.use(katex);

// Find n-th appearance of pattern in string. index starts from 1.
function getNthIndexOf(str: string, pattern: string, n: number) {
  const l = str.length;
  let i = -1;
  while (n-- && i++ < l) {
    i = str.indexOf(pattern, i);
    if (i < 0) break;
  }
  return i;
}

function isValidPostName(str: string) {
  return !(str.startsWith(".") || str.startsWith("_"));
}

function normalizeDateString(date: string) {
  const dateObj = new Date(date);
  if (!date || isNaN(+dateObj)) return new Date().toISOString();
  else return dateObj.toISOString();
}

function normalizeCategory(category: string) {
  return category.replace(/( |\t|_|-)+/g, " ").toLowerCase();
}

// Split post into YAML formatter part and markdown part.
// Pure function
function parseRawPostString(src: string) {
  const splitter = getNthIndexOf(src, "---", 2);
  const formatter = src.slice(0, splitter);
  const md = src.slice(splitter + 3).trim();
  return [formatter, md];
}

// Parse YAML formatter string into json object.
// Automatically correct some data
// Almost pure function except `new Date()` use in code
function parseFormatter(formatterStr: string): {
  title: string;
  category: string;
  date: string;
} {
  const formatter = yaml.parse(formatterStr);

  // Check required properties
  if (!formatter["title"])
    throw new Error("YAML formatter does not contain 'title' attribute.");
  if (!formatter["category"])
    throw new Error("YAML formatter does not contain 'category' attribute.");

  formatter.date = normalizeDateString(formatter.date);
  formatter.category = normalizeCategory(formatter.category);

  return formatter;
}

async function processPost(postName: string): Promise<IPost | null> {
  try {
    console.log("Processing post ", postName);

    const dir = `../posts/${postName}`;
    const files = await fs.readdir(dir);

    // Find markdown file
    let mdFileName = null;
    for (const file of files) {
      if (file.endsWith(".md")) {
        mdFileName = file;
        break;
      }
    }
    if (!mdFileName) return null;

    // Read markdown file
    const mdFilePath = path.join(dir, mdFileName);
    const rawPostStr = (await fs.readFile(mdFilePath)).toString("utf-8");

    // Parse markdown string
    const [yamlStr, markdownStr] = parseRawPostString(rawPostStr);
    const formatter = parseFormatter(yamlStr);

    // Normalize formatter
    const updatedPostStr = `---\n${yaml.stringify(
      formatter
    )}\n---\n\n${markdownStr}`;
    await fs.writeFile(mdFilePath, updatedPostStr);

    // Process image
    try {
      await fs.mkdir("./public/imgs");
    } catch {}
    const _html = markdown.render(markdownStr);
    const dom = htmlParser.parse(_html);
    const imgs = dom.getElementsByTagName("img");
    await Promise.all(
      imgs.map(async (img) => {
        const imageURL = img.getAttribute("src");
        if (!imageURL) {
          img.setAttribute("src", "imgs/404.png");
          return;
        }
        const imagePath = path.join(dir, imageURL);
        const imageFile = await fs.readFile(imagePath);
        const hash = crypto.createHash("md5");
        hash.update(imageFile);
        const digest = hash.digest("hex");
        const newImageFilename = `${digest}${path.extname(imageURL)}`;
        const newImageURL = path.join("/imgs/", newImageFilename);
        const newImagePath = path.join("./public", newImageURL);
        await fs.copyFile(imagePath, newImagePath);
        img.setAttribute("src", newImageURL);
      })
    );
    const html = dom.toString();

    return { ...formatter, html, name: postName };
  } catch (exception) {
    console.error(`[${postName}] ${exception}`);
    return null;
  }
}

async function getCachePath(key: string) {
  const CACHE_DIR = `.cache`;
  try {
    await fs.stat(CACHE_DIR);
  } catch {
    await fs.mkdir(CACHE_DIR);
  }
  const cacheName = crypto.createHash("md5").update(key).digest("hex");
  const cachePath = path.join(CACHE_DIR, cacheName);
  return cachePath;
}

async function readCache<T>(key: string): Promise<T | null> {
  try {
    const cachePath = await getCachePath(key);
    const cacheContent = await fs.readFile(cachePath);
    return JSON.parse(cacheContent.toString("utf-8"));
  } catch {
    return null;
  }
}

async function writeCache<T>(key: string, value: T) {
  const cachePath = await getCachePath(key);
  const cacheContent = Buffer.from(JSON.stringify(value), "utf-8");
  await fs.writeFile(cachePath, cacheContent);
}

async function cache<T>(key: string, onMiss: () => Promise<T>) {
  const cache = await readCache<T>(key);
  if (cache) return cache;
  const content = await onMiss();
  await writeCache<T>(key, content);
  return content;
}

export function getPost(postName: string) {
  return cache(postName, () => processPost(postName));
}

export async function getPostsMetadata(): Promise<{
  postNames: string[];
  posts: IPostMetadata[];
  categories: ICategory[];
}> {
  // Get post names of valid posts
  const _postNames = (await fs.readdir("../posts")).filter(isValidPostName);

  // Parse posts
  const _posts = (
    (await Promise.all(_postNames.map((postName) => getPost(postName)))).filter(
      (post) => post
    ) as IPost[]
  ).map((post) => {
    const { html, ...metadata } = post;
    return metadata;
  }) as IPostMetadata[];

  // Sort by date
  const posts = _posts.sort((pa, pb) => {
    return +new Date(pb.date) - +new Date(pa.date);
  });

  // Get sorted post name
  const postNames = _posts.map((post) => post.name);

  // Get category
  const _categories: { [k: string]: number } = {};
  posts.forEach(({ category }) => {
    if (_categories[category]) _categories[category] += 1;
    else _categories[category] = 1;
  });
  const categories = Object.entries(_categories).map(([name, postsNumber]) => ({
    name,
    postsNumber,
  }));

  return { postNames, posts, categories };
}
