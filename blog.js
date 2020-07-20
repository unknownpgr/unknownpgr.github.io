const fs = require("fs");
const util = require("util");
const path = require("path");
const yaml = require("js-yaml");
const converter = new (require("showdown").Converter)({
  tables: true,
  prefixHeaderId: "header", // It requires header prefiex because first full-korean header will be converted to empty string.
});
const getToc = require("./toc");
const ncp = require("ncp");

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

// Get post data from post path
async function updateSinglePost(postPath, setting) {
  // Convert postPath to full path
  postPath = path.resolve(postPath);

  // Get markdown file name
  const mdFilePath = (await listDir(postPath)).filter((x) =>
    x.endsWith(".md")
  )[0];
  if (!mdFilePath) throw new Error("There are no content file");

  // Parse YMAL formatter and get title and tags
  const src = await readFile(mdFilePath, "utf-8");
  const splitter = getNthIndexOf(src, "---", 2);
  const yamlPart = src.slice(0, splitter);
  const markdown = src.slice(splitter + 3);
  let header = yaml.safeLoad(yamlPart);
  if (!header["title"])
    throw new Error("YAML formatter does not contain 'title' attribute.");

  // Get Date
  const date = new Date(header.date);
  if (isNaN(date)) {
    header["date"] = (await stat(mdFilePath)).birthtime;
    writeFile(
      mdFilePath,
      yamlPart + 'date: "' + header["date"] + '"\n---' + markdown
    );
  } else {
    header["date"] = date;
  }

  // Beautify category
  if (header.category) {
    let { category } = header;
    category = category.replace(/( |\t|_|-)+/g, " ").toLowerCase();
    category = category.charAt(0).toUpperCase() + category.slice(1);
    header.category = category;
  }

  // Generate snippet text
  let text = "";
  let split = markdown
    .replace(/(#|\r|\n|-|\|\t|`|\|| )+/g, " ")
    .trim()
    .split(".");
  for (var i = 0; i < split.length && text.length < 100; i++) {
    text += split[i] + ".";
  }
  if (text.length > 100) {
    text = text.substr(0, 100);
    text += "...";
  }

  // Create data
  var ret = {
    // name==path
    name: path.relative(path.join(setting.root, "posts"), postPath),
    text,
    ...header,
  };

  // jsx / toc file generation
  const html = converter.makeHtml(markdown);
  const jsx = `import React from 'react';export default function(props){return(<React.Fragment>${html}</React.Fragment>);};`;
  const toc = getToc(html);
  await Promise.all([
    writeFile(path.join(postPath, setting.jsxFile), jsx),
    writeFile(path.join(postPath, setting.tocFile), JSON.stringify(toc)),
  ]);
  return ret;
}

async function updatePosts(setting) {
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
  const { root, dst } = setting;
  console.log("Updating posts...");
  const meta = await updatePosts(setting);
  await writeFile(path.join(dst, "meta.json"), JSON.stringify(meta));
  await ncp(path.join(root, "posts"), path.join(dst, "posts"));
}

main({
  root: path.join(__dirname),
  dst: path.join(__dirname, "src"),
  jsxFile: "view.jsx",
  tocFile: "toc.json",
}).then(() => console.log("All tasks finished."));
