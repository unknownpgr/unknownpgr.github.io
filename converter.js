const fs = require("fs").promises;
const ncp = require("ncp");
const path = require("path");
const yaml = require("js-yaml");
const hljs = require('highlight.js');
const ketex = require('markdown-it-katex');
const { dirname } = require("path");
const md = require('markdown-it')({
    html: false,
    langPrefix: 'language-',
    linkify: false,
    typographer: false,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str).value;
            } catch (__) { }
        }
        return ''; // use external default escaping
    }
});
md.use(ketex);

const listDir = async (dirPath) => (await fs.readdir(dirPath)).map(x => path.join(dirPath, x));

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

// Split post into YAML formatter part and markdown part.
// Pure function
function parseRawString(src) {
    const splitter = getNthIndexOf(src, "---", 2);
    const formatter = src.slice(0, splitter);
    let markdown = src.slice(splitter + 3);
    return [formatter, markdown];
}

// Parse YAML formatter string and return json.
// Pure function(with defaultDate provided)
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

// Parse markdown and return html and text snippet of given length.
// Pure function
function parseMarkdown(postName, mdString, snippetLength) {
    let thumbnail = ''
    let snippet = ''
    let toc = []

    function recursiveSearch(tokens) {
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].type == 'image') {
                tokens[i].attrs[0][1] = path.join('post', postName, tokens[i].attrs[0][1])
                if (!thumbnail) thumbnail = tokens[i].attrs[0][1];
                console.log(tokens[i].attrs[0][1])
            }
            if ((snippet.length < snippetLength) && tokens[i].type == 'text') snippet += ((snippet.length == 0) ? '' : ' ') + tokens[i].content.trim();
            if (tokens[i].type == 'inline') recursiveSearch(tokens[i].children)
        }
    }

    let tokens = md.parse(mdString)
    let html = md.renderer.render(tokens, md.options)
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type == 'heading_open') {
            toc.push({
                type: tokens[i].tag,
                content: md.renderInline(tokens[i + 1].content)
            })
        }
    }
    recursiveSearch(tokens)
    return { html, snippet, thumbnail, toc };
}

// Parse raw string and return formatter, html, text snippet.
function parsePost(postName, rawString, snippetLength = 100, defaultDate = new Date()) {
    let [yaml, md] = parseRawString(rawString)
    let formatter = parseFormatter(yaml, defaultDate)
    let parsedPost = parseMarkdown(postName, md, snippetLength);
    return { formatter, ...parsedPost }
}

async function processPost(postDir) {
    if (!(await fs.stat(postDir)).isDirectory()) return;
    let postName = path.basename(postDir);
    let mdFile = (await listDir(postDir)).filter(x => x.endsWith('.md'))
    if (mdFile.length == 0) {
        throw new Error("There are no markdown file for post " + postName);
    } else if (mdFile.length > 1) {
        throw new Error("There are more than one markdown file for post " + postName);
    } else {
        mdFile = mdFile[0]
    }
    let rawString = await fs.readFile(mdFile, { encoding: "utf-8" })
    fs.unlink(mdFile)
    let { formatter, html, snippet, thumbnail, toc } = parsePost(postName, rawString);
    fs.writeFile(path.join(postDir, 'post.html'), html, 'utf-8');
}

async function main() {
    let src = path.join(__dirname, 'posts')
    let dst = path.join(__dirname, 'public', 'posts')
    try {
        if (+(process.version.substr(1, 2)) < 12) {
            console.error("Could not run rmdir because of node version is too low.")
        }
        // `rmdir` commmand with recursive option equires node version > 12
        await fs.rmdir(dst, { recursive: true })
    } catch (__) { }
    ncp(src, dst, async () => {
        await Promise.all((await listDir(dst)).map(processPost))
        console.log('Post update finished!')
    });
}

main()
