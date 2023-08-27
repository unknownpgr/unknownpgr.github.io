import crypto from "crypto";
import htmlParser from "node-html-parser";
import path from "path";
import yaml from "yaml";
import hljs from "highlight.js";
import katex from "./katex-converter";
import markdownIt from "markdown-it";

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

export interface PostFormatter {
  title: string;
  tags: string[];
  date: string;
}

export interface PostData {
  formatter: PostFormatter;
  html: string;
}

function parseDateString(date: string) {
  const dateObj = new Date(date);
  if (!date || isNaN(+dateObj)) return new Date().toISOString();
  else return dateObj.toISOString();
}

function parseTags(category: string): string[] {
  return category
    .replace(/\/|/g, ",")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "")
    .map((item) => item.toLowerCase());
}

function parseFormatter(formatterStr: string): PostFormatter {
  const rawFormatter = yaml.parse(formatterStr);

  // Check if formatter is null
  if (!rawFormatter) {
    throw new Error("YAML formatter is null.");
  }

  // Legacy support
  rawFormatter["tags"] = rawFormatter["category"];

  // Check required properties
  if (!rawFormatter["title"])
    throw new Error("YAML formatter does not contain 'title' attribute.");
  if (!rawFormatter["tags"])
    throw new Error("YAML formatter does not contain 'tags' attribute.");

  const formatter: PostFormatter = {
    title: rawFormatter.title,
    tags: parseTags(rawFormatter.category),
    date: parseDateString(rawFormatter.date),
  };

  return formatter;
}

export function parsePost(files: { [key: string]: Buffer }): PostData {
  const fileNames = Object.keys(files).sort();
  const postFile = fileNames.find((fileName) => fileName.endsWith(".md"));
  if (!postFile) throw new Error("Markdown file not found.");
  const postStr = files[postFile].toString();

  const [, yamlStr, ...others] = postStr.split("---");
  const markdownStr = others.join("---").trim();
  const formatter = parseFormatter(yamlStr);
  const html = markdown.render(markdownStr);

  return {
    formatter,
    html,
  };
}
