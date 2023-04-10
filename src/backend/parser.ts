import crypto from "crypto";
import htmlParser from "node-html-parser";
import path from "path";
import yaml from "yaml";
import {
  getNthIndexOf,
  normalizeCategory,
  normalizeDateString,
  normalizePath,
  renderMarkdown,
} from "./utils";

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

export interface Post {
  imageMapping: Record<string, string>;
  title: string;
  date: string;
  category: string;
  html: string;
  postStr: string;
}

export async function processPostBody(
  rawPostStr: string,
  files: {
    [key: string]: Buffer;
  }
): Promise<Post> {
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
  const html = renderMarkdown(markdownStr);
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
