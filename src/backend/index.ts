import fs from "fs/promises";
import yaml from "yaml";
import markdownIt from "markdown-it";
import hljs from "highlight.js";
import mj3 from "markdown-it-mathjax3";
import path from "path";
import htmlParser from "node-html-parser";
import crypto from "crypto";
import { IPost } from "../types";

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
markdown.use(mj3);

// Find n-th appearence of pattern in string. index starts from 1.
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
  if (!date || isNaN(+dateObj)) return new Date().toUTCString();
  else return dateObj.toUTCString();
}

function normalizeCategory(category: string) {
  return category.replace(/( |\t|_|-)+/g, " ").toLowerCase();
}

// Split post into YAML formatter part and markdown part.
// Pure function
function parseRawPostString(src: string) {
  const splitter = getNthIndexOf(src, "---", 2);
  const formatter = src.slice(0, splitter);
  const md = src.slice(splitter + 3);
  return [formatter, md];
}

// Parse YAML formatter string into json object.
// Automatically correct some data
// Alomost pure function except `new Date()` use in code
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

// Parse raw string and return formatter, html.
// Pure function
function parsePost(rawStr: string) {
  const [yamlStr, markdownStr] = parseRawPostString(rawStr);
  const formatter = parseFormatter(yamlStr);
  const html = markdown.render(markdownStr);
  return { ...formatter, html };
}

async function processPost(postName: string): Promise<IPost | null> {
  try {
    console.log("Processing post ", postName);

    const dir = `../posts/${postName}`;
    const files = await fs.readdir(dir);

    // Find md file
    let mdFileName = null;
    for (const file of files) {
      if (file.endsWith(".md")) {
        mdFileName = file;
        break;
      }
    }
    if (!mdFileName) return null;

    const mdFilePath = path.join(dir, mdFileName);
    const mdText = (await fs.readFile(mdFilePath)).toString("utf-8");
    const post = parsePost(mdText);

    const dom = htmlParser.parse(post.html);
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
    post.html = dom.toString();

    return { ...post, name: postName };
  } catch (exception) {
    console.error(`[${postName}] ${exception}`);
    return null;
  }
}

const postProcessDict: { [key: string]: Promise<IPost | null> | undefined } =
  {};

export function getPost(postName: string) {
  if (!postProcessDict[postName])
    postProcessDict[postName] = processPost(postName);
  return postProcessDict[postName];
}

export async function getPostsMetadata(): Promise<{
  postNames: string[];
  posts: IPost[];
}> {
  const _postNames = (await fs.readdir("../posts")).filter(isValidPostName);
  const _posts = (
    await Promise.all(_postNames.map((postName) => getPost(postName)))
  ).filter((post) => post) as IPost[];
  const posts = _posts.sort((pa, pb) => {
    return +new Date(pb.date) - +new Date(pa.date);
  });
  const postNames = _posts.map((post) => post.name);
  return { postNames, posts };
}
