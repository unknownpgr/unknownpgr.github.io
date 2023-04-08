import yaml from "yaml";
import markdownIt from "markdown-it";
import hljs from "highlight.js";
import katex from "./katex-converter";
import path from "path";
import htmlParser from "node-html-parser";
import crypto from "crypto";

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

function normalizeDateString(date: string) {
  const dateObj = new Date(date);
  if (!date || isNaN(+dateObj)) return new Date().toISOString();
  else return dateObj.toISOString();
}

function normalizeCategory(category: string) {
  return category.replace(/( |\t|_|-)+/g, " ").toLowerCase();
}

function normalizePath(pathStr: string) {
  return path.normalize(pathStr).replace(/\\/g, "/");
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

export async function processPostBody(
  rawPostStr: string,
  files: {
    [key: string]: Buffer;
  }
) {
  // Parse markdown string
  const [yamlStr, markdownStr] = parseRawPostString(rawPostStr);
  const formatter = parseFormatter(yamlStr);

  // Normalize formatter
  const updatedPostStr = `---\n${yaml.stringify(
    formatter
  )}\n---\n\n${markdownStr}`;

  // Normalize image path
  for (const [key, value] of Object.entries(files)) {
    files[normalizePath(key)] = value;
  }

  // Create image mapping
  const fileMapping: Record<string, string> = {};
  const html = markdown.render(markdownStr);
  const dom = htmlParser.parse(html);

  // ToDo: Update to find all tags with src attribute
  const imgTags = dom.getElementsByTagName("img");
  await Promise.all(
    imgTags.map(async (img) => {
      const imageURL = img.getAttribute("src");

      // If image url is null, set it to 404 image
      if (!imageURL) {
        img.setAttribute("src", "imgs/404.png");
        return;
      }
      const imagePath = normalizePath(imageURL);
      const imageFile = files[imagePath];

      // If image file is null, set it to 404 image
      if (!imageFile) {
        console.log(
          `Image file ${imagePath} not found in post ${formatter.title}`
        );
        img.setAttribute("src", "imgs/404.png");
        return;
      }

      const hash = crypto.createHash("md5");
      hash.update(imageFile);
      const digest = hash.digest("hex");
      const newImageFilename = `${digest}${path.extname(imageURL)}`;
      const newImageURL = path.join("/imgs/", newImageFilename);
      fileMapping[imageURL] = newImageURL;
      img.setAttribute("src", newImageURL);
    })
  );
  const updatedHtml = dom.toString();

  return {
    ...formatter,
    postStr: updatedPostStr,
    html: updatedHtml,
    imageMapping: fileMapping,
  };
}
