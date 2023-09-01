import crypto from "crypto";
import hljs from "highlight.js";
import markdownIt from "markdown-it";
import htmlParser from "node-html-parser";
import path from "path";
import yaml from "yaml";
import { PostData, PostMetadata, PostParser, PostParserParams } from "./core";
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

function parseTags(category: string): string[] {
  return category
    .replace(/\//g, ",")
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

export class OnMemoryPostParser implements PostParser {
  constructor(private fileMappingPrefix: string) {}

  async parse({ files }: PostParserParams): Promise<PostData> {
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
    const fileTags = dom.querySelectorAll("img");
    await Promise.all(
      fileTags.map(async (img) => {
        const src = img.getAttribute("src");
        if (!src) return;
        // Check if file is local or remote
        if (src.startsWith("http")) return;
        // Check if file exists
        const normalizedPath = path.normalize(src);
        const imageFile = files[normalizedPath];
        if (!imageFile) {
          img.setAttribute("src", "404.png");
          return;
        }

        // Create hash
        const hash = crypto.createHash("md5");
        hash.update(imageFile);
        const hashStr = hash.digest("hex");

        // Create new image path
        const ext = path.extname(src);
        const newImageFilename = `${hashStr}${ext}`;
        const newImageURL = path.join(this.fileMappingPrefix, newImageFilename);

        // Update image path
        img.setAttribute("src", newImageURL);
        fileMapping[newImageFilename] = imageFile;
      })
    );

    return {
      ...formatter,
      id: "",
      fileMapping,
      html: dom.toString(),
    };
  }
}
