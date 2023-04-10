import hljs from "highlight.js";
import katex from "./katex-converter";
import markdownIt from "markdown-it";
import path from "path";

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
export function getNthIndexOf(str: string, pattern: string, n: number) {
  const l = str.length;
  let i = -1;
  while (n-- && i++ < l) {
    i = str.indexOf(pattern, i);
    if (i < 0) break;
  }
  return i;
}

export function normalizeDateString(date: string) {
  const dateObj = new Date(date);
  if (!date || isNaN(+dateObj)) return new Date().toISOString();
  else return dateObj.toISOString();
}

export function normalizeCategory(category: string) {
  return category.replace(/( |\t|_|-)+/g, " ").toLowerCase();
}

export function normalizePath(pathStr: string) {
  return path.normalize(pathStr).replace(/\\/g, "/");
}

export function renderMarkdown(markdownStr: string) {
  return markdown.render(markdownStr);
}
