import crypto from "crypto";
import hljs from "highlight.js";
import markdownIt from "markdown-it";
import htmlParser from "node-html-parser";
import path from "path";
import yaml from "yaml";
import { PostParser, PostParserParams, PostParserResult } from "./core";
import katex from "./katex-converter";

interface PostFormatter {
  title: string;
  tags: string[];
  date: string;
}

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

function parseDateString(date: string) {
  const dateObj = new Date(date);
  if (!date || isNaN(+dateObj)) return new Date().toISOString();
  else return dateObj.toISOString();
}

function parseTags(tags: string): string[] {
  // Check if tags is an array
  if (Array.isArray(tags)) return tags.map((item) => item.toLowerCase());

  // Check if tags is a string
  if (typeof tags === "string")
    return tags
      .replace(/\//g, ",")
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "")
      .map((item) => item.toLowerCase());

  // Check if tags is null
  if (!tags) return [];

  // Otherwise, throw an error
  throw new Error("YAML formatter contains invalid 'tags' attribute.");
}

function parseFormatter(formatterStr: string): PostFormatter {
  const rawFormatter = yaml.parse(formatterStr);

  // Check if formatter is null
  if (!rawFormatter) {
    throw new Error("YAML formatter is null.");
  }

  // Legacy support
  if (!rawFormatter["tags"]) {
    rawFormatter["tags"] = rawFormatter["category"];
  }

  // Check required properties
  if (!rawFormatter["title"])
    throw new Error("YAML formatter does not contain 'title' attribute.");
  if (!rawFormatter["tags"])
    throw new Error("YAML formatter does not contain 'tags' attribute.");

  const formatter: PostFormatter = {
    title: rawFormatter.title,
    tags: parseTags(rawFormatter.tags),
    date: parseDateString(rawFormatter.date),
  };

  return formatter;
}

export class OnMemoryPostParser implements PostParser {
  constructor(private fileMappingPrefix: string) {}

  async parse({ files }: PostParserParams): Promise<PostParserResult> {
    const fileNames = Object.keys(files).sort();
    const postFile = fileNames.find((fileName) => fileName.endsWith(".md"));
    if (!postFile) throw new Error("Markdown file not found.");
    const postStr = files[postFile].toString();

    const [, yamlStr, ...others] = postStr.split("---");
    const markdownStr = others.join("---").trim();
    const formatter = parseFormatter(yamlStr);
    const html = markdown.render(markdownStr);

    // File mapping
    const fileMapping: Record<string, Buffer> = {};
    const dom = htmlParser.parse(html);
    const fileTags = [
      ...dom.querySelectorAll("img"),
      ...dom.querySelectorAll("video"),
      ...dom.querySelectorAll("audio"),
    ];
    await Promise.all(
      fileTags.map(async (tag) => {
        // Check if tag has src attribute and it is not a URL
        const src = tag.getAttribute("src");
        if (!src) return;
        if (src.startsWith("http")) return;

        // Check if file exists
        const normalizedPath = path.normalize(src);
        const file = files[normalizedPath];
        if (!file) {
          tag.setAttribute("src", "404.png");
          return;
        }

        // Create new file path from hash
        const hash = crypto.createHash("md5");
        hash.update(file);
        const hashStr = hash.digest("hex");
        const ext = path.extname(src);
        const newFilename = `${hashStr}${ext}`;
        const newFileURL = path.join(this.fileMappingPrefix, newFilename);

        // Update file path
        tag.setAttribute("src", newFileURL);
        fileMapping[newFilename] = file;
      })
    );

    return {
      postData: {
        ...formatter,
        id: "",
        fileMapping,
        html: dom.toString(),
      },
      markdownFilename: postFile,
      fixedMarkdown: `---\n${yaml
        .stringify(formatter)
        .trim()}\n---\n\n${markdownStr}\n`,
    };
  }
}