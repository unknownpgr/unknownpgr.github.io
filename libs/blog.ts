import fs from "fs";
import util from "util";
import path from "path";
import yaml from "js-yaml";
import ncp from "ncp";
import { getToc } from "./toc";
import { md2jsx } from "./md2jsx";
import { createThumbnail } from "./thumbnail";
import { getSitemap, getUrlsFromMeta } from "./sitemap";

/**
 * There is a difference between data for updating metadata in a blog and data for displaying a blog.
 * To update metadata, the following information is required.
 *
 * - The post's unique name (=directory name)
 * - The name of the markdown file
 *
 * In order to use it in a blog, the following information is required.
 *
 * - The post's unique name (=directory=URL)
 * - Path of generated jsx file (without extension)
 * - Path of the created toc file (without extension)
 * - Category
 * - The date the post was created
 */

// Promisified functions
const readDir = util.promisify(fs.readdir);
const listDir = async (dirPath: string) =>
  (await readDir(dirPath)).map((x: string) => path.join(dirPath, x));
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const asyncNcp = util.promisify(ncp);

// Find n-th appearence of pattern in string. index starts from 1.
function getNthIndexOf(str: string, pattern: string, n: number) {
  var l = str.length,
    i = -1;
  while (n-- && i++ < l) {
    i = str.indexOf(pattern, i);
    if (i < 0) break;
  }
  return i;
}

async function asyncForEach(
  array: any[],
  func: (value: any, index: number, array: any[]) => unknown
) {
  return Promise.all(array.map(func));
}

async function failable(func: Function) {
  try {
    await func();
  } catch {}
}

// Split post into YAML formatter part and markdown part.
function splitPost(src: string) {
  const splitter = getNthIndexOf(src, "---", 2);
  const formatter = src.slice(0, splitter);
  let markdown = src.slice(splitter + 3);
  return { formatter, markdown };
}

// Parse YAML formatter string and return json
function parseFormatter(formatterStr: string, defaultDate: Date) {
  let formatter: any = yaml.safeLoad(formatterStr);

  // Check required properties
  if (!formatter["title"])
    throw new Error("YAML formatter does not contain 'title' attribute.");
  if (!formatter["category"])
    throw new Error("YAML formatter does not contain 'category' attribute.");

  // Beautify date
  const date: any = new Date(formatter.date);
  if (isNaN(date)) {
    formatter["date"] = new Date(defaultDate);
  } else {
    formatter["date"] = new Date(date);
  }

  // Beautify category
  let { category } = formatter;
  category = category.replace(/( |\t|_|-)+/g, " ").toLowerCase();
  category = category.charAt(0).toUpperCase() + category.slice(1);
  formatter.category = category;

  return formatter;
}

/**
 * Generate text snippet
 */
function createSnippet(fullText: string) {
  let text = "";
  let split = fullText
    .replace(/(#|\r|\n|-|\|\t|`|\|| )+/g, " ")
    .trim()
    .split(" ");
  for (var i = 0; i < split.length && text.length < 100; i++) {
    text += split[i] + " ";
  }
  text = text.substr(0, 100);
  text += "...";

  return text;
}

// Get post data from post path
async function updateSinglePost(
  postPath: string,
  setting: Setting
): Promise<PostMeta> {
  // Convert postPath to full path
  postPath = path.resolve(postPath);

  // Get markdown file name
  const postFilePath = (await listDir(postPath)).filter((x) =>
    x.endsWith(".md")
  )[0];
  if (!postFilePath) throw new Error("There are no content file");

  // Split post into YAML formatter and markdown
  const src = await readFile(postFilePath, "utf-8");
  let { formatter: formatterString, markdown } = splitPost(src);

  // Parse
  let formatter = parseFormatter(formatterString, new Date());
  await writeFile(
    postFilePath,
    "---\n" + yaml.dump(formatter) + "\n---" + markdown
  );

  let text = createSnippet(markdown);

  // Create data
  var ret = {
    // name==path
    name: path.relative(path.join(setting.root, "posts"), postPath),
    text,
    ...formatter,
  };

  // jsx / toc file generation
  let { result, imgs } = md2jsx(markdown);
  let toc = JSON.stringify(getToc(result));
  if (imgs.length > 0)
    ret.thumbnail = await createThumbnail(setting, ret, imgs[0]);

  // Write files
  const srcPath = path.join(setting.root, "posts", ret.name);
  const dstPath = path.join(setting.dst, "posts", ret.name);
  try {
    await mkdir(path.join(setting.dst, "posts", ret.name));
  } catch {}
  await Promise.all([
    writeFile(path.join(dstPath, setting.jsxFile), result),
    writeFile(path.join(dstPath, setting.tocFile), toc),
    asyncNcp(srcPath, dstPath),
  ]);
  return ret;
}

async function updatePosts(setting: Setting) {
  // Make destination post directory
  try {
    await mkdir(path.join(setting.dst, "posts"));
  } catch {}

  // Get post directories
  var pathes = (
    await listDir(path.join(setting.root, "posts"))
  ).filter((x: string) => fs.statSync(x).isDirectory());

  // Collect post metadata
  const posts: PostDict = {};
  const categories: Categories = {};
  let postOrder: string[] = [];
  await asyncForEach(pathes, async function (path: string) {
    // Update single post and get postData.
    const postData: PostMeta = await updateSinglePost(path, setting);
    const { name, category } = postData;

    // Build posts dictionary
    posts[name] = postData;

    // Build post order list
    postOrder.push(postData.name);

    // Build category dictionary
    if (categories[category]) categories[category].count++;
    else categories[category] = { count: 1 };
  });

  // Sort post names in postOrder list by date and add order property.
  postOrder = postOrder.sort(
    (a, b) => posts[b].date.getTime() - posts[a].date.getTime()
  );
  postOrder.forEach((post, i) => {
    posts[post].order = i;
  });

  // Remove root from setting
  setting.root = "";

  return {
    posts,
    categories,
    setting,
    postOrder,
  };
}

// Generate pages for redirection.
async function createRedirection(setting: Setting, meta: BlogMeta) {
  const { publicDir } = setting;
  const { posts }: { posts: any } = meta;
  await failable(() => mkdir(path.join(publicDir, "posts")));

  const task = async (key: string) => {
    const name = posts[key].name;
    const pathname = path.join(publicDir, "posts", name, "index.html");
    const url = `/?page=${encodeURIComponent("/posts/" + name)}`;
    await failable(() => mkdir(path.join(publicDir, "posts", name)));
    await writeFile(
      pathname,
      `<script>window.location.replace('${url}');</script>`
    );
  };

  let tasks = [];
  for (let key in meta.posts) {
    tasks.push(task(key));
  }

  return Promise.all(tasks);
}

async function main(setting: Setting) {
  const { dst, publicDir } = setting;

  console.log("Updating posts...");
  const meta = await updatePosts(setting);
  await writeFile(path.join(dst, "meta.json"), JSON.stringify(meta));

  console.log("Generating redirection pages...");
  createRedirection(setting, meta);

  console.log("Generating sitemap...");
  let urls = getUrlsFromMeta("https://unknownpgr.github.io/", meta);
  let sitemap = getSitemap(urls);
  await writeFile(path.join(publicDir, "sitemap.xml"), sitemap);
}

// // Call main function with parameters
main({
  root: path.join(__dirname, ".."),
  dst: path.join(__dirname, "..", "src"),
  publicDir: path.join(__dirname, "..", "public"),
  jsxFile: "view.jsx",
  tocFile: "toc.json",
}).then(() => console.log("All tasks finished."));
