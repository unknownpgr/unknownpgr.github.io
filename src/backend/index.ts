import fs from "fs/promises";
import yaml from "yaml";
import markdownIt from "markdown-it";
import hljs from "highlight.js";
import katex from "./katex-converter";
import path from "path";
import htmlParser from "node-html-parser";
import crypto from "crypto";
import { ICategory, IPost, IPostMetadata } from "../types";
import { cache } from "./cachedTask";

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

  // Check if formatter is null
  if (!formatter) {
    throw new Error("YAML formatter is null.");
  }

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

async function preprocess(postName: string) {
  // If directory is empty, delete it.
  const files = await fs.readdir(path.join("../posts", postName));
  if (files.length === 0) {
    console.log(`Deleting empty directory ${postName}`);
    await fs.rmdir(path.join("../posts", postName));
    return null;
  }

  // Normalize post name
  const post = await processPost(postName);
  if (!post) return null;

  const { date } = post;
  let newPostName = postName;

  if (!postName.startsWith(date.slice(0, 10))) {
    newPostName = `${date.slice(0, 10)}-${postName}`;
  }
  newPostName = newPostName.replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-");

  if (newPostName === postName) return postName;

  console.log(`Renaming ${postName} to ${newPostName}`);
  // Move post directory
  await fs.rename(
    path.join("../posts", postName),
    path.join("../posts", newPostName)
  );

  return newPostName;
}

export async function getPost(postName: string) {
  const result = await cache(postName, async () => {
    const preprocessedPostName = await preprocess(postName);
    if (!preprocessedPostName) return null;
    return processPost(preprocessedPostName);
  });
  return result;
}

export async function getPostsMetadata(): Promise<{
  postNames: string[];
  posts: IPostMetadata[];
  categories: ICategory[];
}> {
  // Get post names of valid posts
  const postDirectories = (await fs.readdir("../posts")).filter(
    isValidPostName
  );

  // Parse posts
  const postMetadata = (
    (await Promise.all(postDirectories.map(getPost))).filter(
      (post) => !!post
    ) as IPost[]
  ).map((post) => {
    const { html, ...metadata } = post;
    return metadata;
  }) as IPostMetadata[];

  // Sort by date
  const posts = postMetadata.sort((pa, pb) => {
    return +new Date(pb.date) - +new Date(pa.date);
  });

  // Get sorted post name
  const postNames = postMetadata.map((post) => post.name);

  // Get category
  const categoryDict: { [k: string]: number } = {};
  posts.forEach(({ category }) => {
    if (categoryDict[category]) categoryDict[category] += 1;
    else categoryDict[category] = 1;
  });
  const categories = Object.entries(categoryDict).map(
    ([name, postsNumber]) => ({
      name,
      postsNumber,
    })
  );

  return { postNames, posts, categories };
}
