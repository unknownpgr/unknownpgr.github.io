import hljs from "highlight.js";
import markdownIt from "markdown-it";
import yaml from "yaml";
import { PostParser, PostParserResult } from "../core/model";
import katex from "./katex-converter";

interface PostFormatter {
  title: string;
  tags: string[];
  date: string | null;
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

function parseDateString(date: string): string | null {
  const dateObj = new Date(date);
  if (!date || isNaN(+dateObj)) return null;
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

function parseMdFile(mdFileStr: string) {
  const [, yamlStr, ...others] = mdFileStr.split("---");
  const md = others.join("---").trim();
  const formatter = parseFormatter(yamlStr);
  const html = markdown.render(md);
  return { formatter, md, html };
}

export class OnMemoryPostParser implements PostParser {
  public parse(markdown: string): PostParserResult {
    const { formatter, md, html } = parseMdFile(markdown);
    return {
      title: formatter.title,
      tags: formatter.tags,
      date: formatter.date,
      markdown: md,
      html,
    };
  }

  public dump(result: PostParserResult): string {
    const formatter = yaml.stringify({
      title: result.title,
      tags: result.tags,
      date: result.date,
    });
    const output = `---\n${formatter}---\n\n${result.markdown}\n`;
    return output;
  }
}
