const fs = require("fs");
const util = require("util");
const path = require("path");
const yaml = require("js-yaml");
const getToc = require("./toc");
const ncp = require("ncp");
const converter = new (require("showdown").Converter)({
  tables: true,
  prefixHeaderId: "header", // It requires header prefiex because first full-korean header will be converted to empty string.
  ghCodeBlocks: true,
});

/**
 *
 * 구현해본 바, 블로그에서 메타데이터 업데이트를 위한 데이터와 블로그 표시를 위한 데이터가 차이가 있다.
 * 메타데이터 업데이트를 위해서는 다음과 같은 정보가 필요하다.
 *
 * - 포스트의 고유한 이름(=디렉토리 이름)
 * - 마크다운 파일의 이름
 *
 * 블로그에서 사용하기 위해서는 다음과 같은 정보가 필요하다.
 *
 * - 포스트의 고유한 이름(=디렉토리 이름=URL)
 * - 생성된 jsx파일의 경로(확장자 없이)
 * - 생성된 toc파일의 경로(확장자 없이)
 * - 카테고리
 * - 포스트가 작성된 날짜
 *
 * 현재 블로그 포스트가 가지는 메타정보는 아래와 같다/
 * - 포스트 고유한 이름(=디렉토리 이름)
 */

// Promisified functions
const readDir = util.promisify(fs.readdir);
const listDir = async (dirPath) =>
  (await readDir(dirPath)).map((x) => path.join(dirPath, x));
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const stat = util.promisify(fs.stat);
const mkdir = util.promisify(fs.mkdir);

// Find n-th appearence of pattern in string. index starts from 1.
function getNthIndexOf(str, pattern, n) {
  var l = str.length,
    i = -1;
  while (n-- && i++ < l) {
    i = str.indexOf(pattern, i);
    if (i < 0) break;
  }
  return i;
}

async function asyncForEach(array, func) {
  return Promise.all(array.map(func));
}

// Replace emoji to <Emoji/> tag.
function replaceEmoji(string) {
  var regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/;
  let result = "";
  let left = string;
  let emojiUsed = false;
  while (true) {
    let match = left.match(regex);
    if (!match) break;
    result += left.substring(0, match.index) + `<Emoji symbol="${match[0]}"/>`;
    left = left.substring(match.index + match[0].length);
    emojiUsed = true;
  }
  result += left;
  return {
    emojiUsed,
    result,
  };
}

// Split post into YAML formatter part and markdown part.
function splitPost(src) {
  const splitter = getNthIndexOf(src, "---", 2);
  const formatter = src.slice(0, splitter);
  let markdown = src.slice(splitter + 3);
  return { formatter, markdown };
}

// Generate jsx from markdown
function generateJsx(markdown) {
  let html = converter.makeHtml(markdown);
  const { result, emojiUsed } = replaceEmoji(html);
  html = result;
  return `import React from 'react';${
    // Import only when using Emoji tag.
    emojiUsed ? 'import Emoji from "UIs/Emoji";' : ""
  }export default function(props){return(<React.Fragment>${html}</React.Fragment>);};`;
}

// Parse YAML formatter string and return json
function parseFormatter(formatterStr, defaultDate) {
  let formatter = yaml.safeLoad(formatterStr);

  // Check required properties
  if (!formatter["title"])
    throw new Error("YAML formatter does not contain 'title' attribute.");
  if (!formatter["category"])
    throw new Error("YAML formatter does not contain 'category' attribute.");

  // Beautify date
  const date = new Date(formatter.date);
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
function generateSnippet(fullText) {
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
async function updateSinglePost(postPath, setting) {
  // Convert postPath to full path
  postPath = path.resolve(postPath);

  // Get markdown file name
  const postFilePath = (await listDir(postPath)).filter((x) =>
    x.endsWith(".md")
  )[0];
  if (!postFilePath) throw new Error("There are no content file");

  // Split post into YAML formatter and markdown
  const src = await readFile(postFilePath, "utf-8");
  let { formatter, markdown } = splitPost(src);

  // Parse
  formatter = parseFormatter(formatter, Date.now());
  await writeFile(
    postFilePath,
    "---\n" + yaml.dump(formatter) + "\n---" + markdown
  );

  let text = generateSnippet(markdown);

  // Create data
  var ret = {
    // name==path
    name: path.relative(path.join(setting.root, "posts"), postPath),
    text,
    ...formatter,
  };

  // jsx / toc file generation
  let jsx = generateJsx(markdown);
  let toc = JSON.stringify(
    // The html tag doesn't work properly when stored and loaded in json.
    // Therefore, the <Emoji/> tag must be removed before saving it in html.
    getToc(jsx.replace(/<Emoji[^"]+"/g, "").replace(/"[^">]*\/>/g, ""))
  );

  // Write files
  const srcPath = path.join(setting.root, "posts", ret.name);
  const dstPath = path.join(setting.dst, "posts", ret.name);
  try {
    await mkdir(path.join(setting.dst, "posts", ret.name));
  } catch {}
  await Promise.all([
    writeFile(path.join(dstPath, setting.jsxFile), jsx),
    writeFile(path.join(dstPath, setting.tocFile), toc),
    ncp(srcPath, dstPath),
  ]);
  return ret;
}

async function updatePosts(setting) {
  // Make destination post directory
  try {
    await mkdir(path.join(setting.dst, "posts"));
  } catch {}

  // Get post directories
  var pathes = (await listDir(path.join(setting.root, "posts"))).filter((x) =>
    fs.statSync(x).isDirectory()
  );

  // Collect post metadata
  const posts = {};
  const categories = {};
  let postOrder = [];
  await asyncForEach(pathes, async function (path) {
    // Update single post and get postData.
    const postData = await updateSinglePost(path, setting);
    const { name, category } = postData;

    // Build posts dictionary
    posts[name] = postData;

    // Build post order list
    postOrder.push(postData);

    // Build category dictionary
    if (categories[category]) categories[category].count++;
    else categories[category] = { count: 1 };
  });

  // Sort post names in postOrder list by date and add order property.
  postOrder = postOrder
    .sort((a, b) => b.date - a.date)
    .map((post, i) => {
      posts[post.name].order = i;
      return post.name;
    });

  // Remove root from setting
  delete setting.root;

  return {
    posts,
    categories,
    setting,
    postOrder,
  };
}

async function main(setting) {
  const { dst } = setting;
  console.log("Updating posts...");
  const meta = await updatePosts(setting);
  await writeFile(path.join(dst, "meta.json"), JSON.stringify(meta));
}

main({
  root: path.join(__dirname),
  dst: path.join(__dirname, "src"),
  jsxFile: "view.jsx",
  tocFile: "toc.json",
}).then(() => console.log("All tasks finished."));
