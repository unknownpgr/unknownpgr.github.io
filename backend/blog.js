const fs = require("fs").promises;
const ncp = require("ncp");
const path = require("path");
const yaml = require("js-yaml");
const hljs = require("highlight.js");
const ketex = require("./libs/md-latex");
const markdown = require("markdown-it")({
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
markdown.use(ketex);
const getSitemap = require("./libs/sitemap");
const resize = require("./libs/resizer");

// Alias for frequently used functions
const { join } = path;
const write = fs.writeFile;

// Promisified ncp
const pncp = (src, dst) =>
  new Promise((res, rej) =>
    ncp(src, dst, (err) => {
      err ? rej(err) : res();
    })
  );

// Constants
const ROOT = "https://unknownpgr.com/";
const PATH_BUILD = join(__dirname, "..", "docs");
const PATH_SRC = join(__dirname, "..", "posts");
const PATH_DST = join(PATH_BUILD, "posts");
const PATH_SITEMAP = join(PATH_BUILD, "sitemap.xml");
const PATH_META = join(PATH_BUILD, "meta.json");

// Find n-th appearence of pattern in string. index starts from 1.
function getNthIndexOf(str, pattern, n) {
  const l = str.length;
  let i = -1;
  while (n-- && i++ < l) {
    i = str.indexOf(pattern, i);
    if (i < 0) break;
  }
  return i;
}

// Split post into YAML formatter part and markdown part.
// Pure function
function parseRawPostString(src) {
  const splitter = getNthIndexOf(src, "---", 2);
  const formatter = src.slice(0, splitter);
  const md = src.slice(splitter + 3);
  return [formatter, md];
}

function normalizeDate(date) {
  const dateObj = new Date(date);
  if (!date || isNaN(dateObj)) return new Date();
  else return dateObj;
}

function normalizeCategory(category) {
  return category.replace(/( |\t|_|-)+/g, " ").toLowerCase();
}

// Parse YAML formatter string into json object.
// Automatically correct some data
// Alomost pure function except `new Date()` use in code
function parseFormatter(formatterStr) {
  const formatter = yaml.safeLoad(formatterStr);

  // Check required properties
  if (!formatter["title"]) throw new Error("YAML formatter does not contain 'title' attribute.");
  if (!formatter["category"]) throw new Error("YAML formatter does not contain 'category' attribute.");

  // Normalize date
  formatter.date = normalizeDate(formatter.date);

  // Normalize category
  formatter.category = normalizeCategory(formatter.category);

  return formatter;
}

// Parse markdown and return html, thumbnail path, toc.
// Pure function
function parseMarkdown(markdownStr) {
  const toc = [];
  const tokens = markdown.parse(markdownStr);
  let firstImage = "";

  /**
   * This section does
   * - Change the image path(which is a relative path) to an absolute path.
   * - Get the first image as a thumbnal.
   *
   * token.attrs[0][1] : the soruce path of the image tag
   * Update the image path to an absolute path
   */
  (function recursiveUpdate(_tokens) {
    for (let token of _tokens) {
      if (token.type === "image") {
        const image = token.attrs[0][1];
        if (firstImage === "") firstImage = image;
        if (image.length > 64) {
          console.log(`Image name ${image} is too long`);
        }
      }
      if (token.type === "inline") recursiveUpdate(token.children);
    }
  })(tokens);

  /**
   * This section does
   * - Assign an id to every header
   * - Build table of content
   */
  let headerIndex = 1;
  for (let i = 0; i < tokens.length; i++) {
    const cur = tokens[i];
    const nxt = tokens[i + 1];

    if (cur.type === "heading_open") {
      const id = `header-${headerIndex}`;
      const type = tokens[i].tag;
      const content = markdown.renderInline(nxt.content);

      cur.attrs = cur.attrs || [];
      cur.attrs.push(["id", id]);

      toc.push({ type, content, id });
      headerIndex++;
    }
  }

  const html = markdown.renderer.render(tokens, markdown.options);
  return { html, firstImage, toc };
}

// Parse raw string and return formatter, html.
// Pure function
function parsePost(rawStr) {
  const [yamlStr, markdownStr] = parseRawPostString(rawStr);
  const formatter = parseFormatter(yamlStr);
  const parsedPost = parseMarkdown(markdownStr);
  return { formatter, markdownStr, ...parsedPost };
}

async function validatePost(postName, postDir) {
  // Check if given post is a hidden post
  if (postName.startsWith(".") || postName.startsWith("_")) return false;
  // Check if given path is a valid directory
  if (!(await fs.stat(postDir)).isDirectory()) return false;
  return true;
}

async function getMarkdownFile(directory) {
  const mdFiles = (await fs.readdir(directory))
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => path.join(directory, fileName));

  // Check if there are exactly one markdown file
  if (mdFiles.length === 0) throw new Error("There are no markdown file at " + directory);
  else if (mdFiles.length > 1) throw new Error("There are more than one markdown files at " + directory);
  else return mdFiles[0];
}

// Parse an .md file, remove it, generate post.html and toc.json, then return metadata of post.
// Not a pure function.
async function processPost(name) {
  try {
    const postDir = join(PATH_DST, name);

    if (!(await validatePost(name, postDir))) return;

    const mdFile = await getMarkdownFile(postDir);

    // Parse markdown file
    const rawPostStr = await fs.readFile(mdFile, { encoding: "utf-8" });
    const { firstImage, formatter, markdownStr, html, toc } = parsePost(rawPostStr);

    // Update post file, generated html and table of contents
    const updatedPostStr = "---\n" + yaml.dump(formatter) + "\n---" + markdownStr;
    await write(join(PATH_SRC, name, path.basename(mdFile)), updatedPostStr);
    await write(join(postDir, "post.html"), html, "utf-8");
    await write(join(postDir, "toc.json"), JSON.stringify(toc), "utf-8");

    // Generate thumbnail files
    const thumbnail = await createThumbnail(firstImage, name);

    // Remove markdown file
    fs.unlink(mdFile);

    console.log(`Post ${name} successfully processed.`);

    // Return metadata
    return { ...formatter, name, thumbnail };
  } catch (e) {
    console.log("Error occrred while processing post", name);
    console.log(e);
    return null;
  }
}

async function createThumbnail(firstImage, postName) {
  if (!firstImage || firstImage.length === 0) return "";

  let thumbnail = "";
  try {
    // Notice that thumbnaile file may not have extenstion.
    const { base, ext } = path.parse(firstImage);
    thumbnail = path.join("/posts", postName, `thumbnail.${base}`);
    const src = join(PATH_BUILD, "posts", postName, firstImage);
    const dst = join(PATH_BUILD, thumbnail);
    if (ext) {
      const result = await resize(src, dst);
      if (result === "Fail") throw new Error("Worker side error");
    } else ncp(src, dst);
  } catch (e) {
    console.log(`Image ${thumbnail} is not converted due to error below.`);
    console.log(e);
  }
  return thumbnail;
}

async function createRedirectionHtml(redirectionPath, meta) {
  await Promise.all(
    Object.entries(meta).map(([name, post]) => {
      const html = `
            <meta property="og:url"         content="/posts/${name}/"/>
            <meta property="og:type"        content="website"/>
            <meta property="og:title"       content="${post.title}"/>
            <meta property="og:description" content="Blog of Unknownpgr"/>
            <meta property="og:image"       content="${post.thumbnail}"/>
            <script src="/404.js"></script>
            `
        .replace(/(\r|\n|\t)/g, "")
        .replace(/ +/g, " ");
      const htmlPath = join(redirectionPath, name, "index.html");
      return write(htmlPath, html, "utf-8");
    })
  );
}

async function clearOutputDirectory() {
  // Delete existing data
  try {
    // `rmdir` commmand with recursive option equires node version > 12
    if (+process.version.substr(1, 2) < 12) {
      console.error("Could not run rmdir because of node version is too low.");
    }
    await fs.rm(PATH_DST, { recursive: true });
    console.log("All existing files were removed.");
  } catch (e) {
    console.log("There was some minor error while removing data.");
    console.log("The error occurred is as follows.");
    console.log(e);
  }
}

async function main() {
  await clearOutputDirectory();

  // Copy raw post data to dst directory
  try {
    await pncp(PATH_SRC, PATH_DST);
    console.log("Raw post data was copied to destination directory.");
  } catch (e) {
    console.error("Error occurred while coping data to destination directory. Stop blog build.");
    console.error("The error occurred was as follows.");
    console.error(e);
    return -1;
  }

  // Compile them and save compiled results
  const postList = await fs.readdir(PATH_DST);
  const tasks = postList.map(processPost);
  console.log("Task array constructed.");
  let postData = (await Promise.all(tasks)).filter((x) => x);
  console.log("All post were processed.");

  // Sort the metadata by the date and convert it to a dictionary.
  // Actually, items in a dictionary should not have an order.
  // Thus, it is just a trick and not a recommaned coding pattern.
  const meta = {};
  postData = postData.sort((a, b) => b.date - a.date);
  postData.forEach((data) => (meta[data.name] = data));

  // Write the metadata to file
  await write(PATH_META, JSON.stringify(meta), "utf-8");

  // Generate sitemap from metadata
  const sitemap = getSitemap(ROOT, meta);
  await write(PATH_SITEMAP, sitemap);

  console.log("Post update finished!");

  // generate redirection page, because github page cannot handle spa.
  createRedirectionHtml(PATH_DST, meta);
}

main();
