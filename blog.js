const fs = require("fs");
const util = require("util");
const path = require("path");
const yaml = require("js-yaml");
const converter = new (require("showdown").Converter)({
  tables: true,
  prefixHeaderId: "header", // It requires header prefiex because first full-korean header will be converted to empty string.
});
const getToc = require("./toc");
const { exec } = require("child_process");

/**
 * 스크립트가 너무 더럽다. 특히 메타데이터 가져오고 저장하는 부분이, 상대 디렉토리로 바꿨다가 다시 절대로 가는 등, 의미없는 부분이 너무 많다. 이 부분을 다시 고칠 필요가 있다.
 * 추가적으로, 생성된 html로부터 toc-like json을 생성하는 방법이 필요하다. toc html을 그대로 생성해버렸다가는 React router등을 제대로 이용할 수 없고, 범용성도 좋지 않다.
 * Markdown으로부터 바로 생성하는 것도 고려해볼 만하지만, showdown 라이브러리와 ID 생성 방법이 다르면 어떡하나.
 * 일단 전자만 구현하고, 시간 나면 두 가지 모두 구현해서 라이브러리로 분리하자.
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
 */

// Promisified functions
const readDir = util.promisify(fs.readdir);
const listDir = async (dirPath) =>
  (await readDir(dirPath)).map((x) => path.join(dirPath, x));
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const stat = util.promisify(fs.stat);
const execute = util.promisify(exec);

// Find n-th appearence of pattern in string.
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
  const parsed = src.split("---");
  if (parsed.length < 2)
    throw new Error("No YAML formatter exists in " + mdFilePath + ".");
  let header = yaml.safeLoad(parsed[1]);
  if (!header["title"])
    throw new Error("YAML formatter does not contain 'title' attribute.");

  // Get Date
  const date = new Date(header.date);
  if (isNaN(date)) {
    header["date"] = (await stat(mdFilePath)).birthtime;
  } else {
    header["date"] = date;
  }

  // Beautify category
  if (header.category)
    header.category = header.category.replace(/( |\t|_|-)+/g, "_");

  // Create data
  var ret = {
    name: path.basename(postPath),
    path: path.relative(setting.root, postPath),
    text: parsed[2]
      .replace(/(#|\r|\n|-|\|\t| )+/g, " ")
      .trim()
      .substr(0, 100),
    ...header,
  };

  // jsx / toc file generation
  const markdown = src.substring(3 + getNthIndexOf(src, "---", 2)); // Split cannot be used here because --- is also used as horizontal line.
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
  const errors = [];
  const categories = {};
  let postOrder = [];
  await asyncForEach(pathes, async function (path) {
    try {
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
    } catch (e) {
      // Build error dictionary
      errors.push({ path: path, error: e });
    }
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
    errors,
    categories,
    setting,
    postOrder,
  };
}

async function runCommand(command, msg, cwd = __dirname) {
  console.log(msg);
  console.log("\tCommand : " + command);
  const result = true;
  const start = Date.now();
  try {
    await execute(command, { cwd: cwd });
  } catch (e) {
    console.log("\t Error : " + e);
    result = false;
  }
  const end = Date.now();
  const sec = (end - start) / 1000;
  console.log(`\tExecution time : ${sec}s\n`);
  return result;
}

async function main(setting) {
  const { root } = setting;
  console.log("Updating posts...");
  const meta = await updatePosts(setting);
  await writeFile(path.join(root, "meta.json"), JSON.stringify(meta));

  //================================================
  // Automated blog build & commit
  //================================================

  if (process.argv.indexOf("--skip-build") > 0) {
    console.log("Skip build.");
    return;
  }

  const buildSuccess = await runCommand(
    "yarn react-scripts build",
    "Build blog"
  );
  if (!buildSuccess) {
    console.log("Blog build failed. cancel all tasks.");
    return;
  }

  const src = path.join(__dirname, "build");
  const dst = path.join(__dirname, "../github-blog-build/");

  await runCommand("mkdir " + dst, "Create blog path");
  await runCommand(
    'rm -rf -v !(".git"|"README.md")',
    "Remove existing files",
    dst
  );
  await runCommand(`yes | cp -rf ${src}/* ${dst}`, "Copy blog build");
  await runCommand("git add .", "Git add all", dst);
  await runCommand(`git commit -m "Update at ${new Date()}"`, "Commit", dst);
  await runCommand("git push origin master", "Git push", dst);
}

main({
  root: path.join(__dirname, "src"),
  jsxFile: "view.jsx",
  tocFile: "toc.json",
}).then(() => console.log("All tasks finished."));
