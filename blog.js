const fs = require("fs").promises;
const ncp = require("ncp");
const path = require("path");
const yaml = require("js-yaml");
const hljs = require('highlight.js');
const ketex = require('./libs/md-latex');
const markdown = require('markdown-it')({
    html: true,
    langPrefix: 'language-',
    linkify: true,
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
const getSitemap = require('./libs/sitemap');

markdown.use(ketex);

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
    let md = src.slice(splitter + 3);
    return [formatter, md];
}

// Parse YAML formatter string and return json.
// Pure function(only if defaultDate was provided)
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
    formatter.category = category;

    return formatter;
}

// Parse markdown and return html, thumbnail path, toc of given length.
// Pure function
function parseMarkdown(postName, mdString) {
    let thumbnail = '';
    let toc = [];
    let headerIndex = 1;

    function recursiveUpdate(tokens) {
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].type === 'image') {
                // Update the image path to absolute path
                tokens[i].attrs[0][1] = path.join('/posts', postName, tokens[i].attrs[0][1]);
                // Get the first image as thumbnail
                if (!thumbnail) thumbnail = tokens[i].attrs[0][1];
            }
            if (tokens[i].type === 'inline') recursiveUpdate(tokens[i].children);
        }
    }

    let tokens = markdown.parse(mdString);
    recursiveUpdate(tokens);

    // Assign an id to header and build table of content
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type === 'heading_open') {
            let id = 'header-' + headerIndex;
            headerIndex++;
            if (!tokens[i].attrs) tokens[i].attrs = [];
            tokens[i].attrs.push(['id', id]);
            toc.push({
                type: tokens[i].tag,
                content: markdown.renderInline(tokens[i + 1].content),
                id: id
            });
        }
    }
    let html = markdown.renderer.render(tokens, markdown.options);
    return { html, thumbnail, toc };
}

// Parse raw string and return formatter, html.
// Pure function
function parsePost(postName, rawString, defaultDate = new Date()) {
    let [yamlStr, md] = parseRawString(rawString);
    let formatter = parseFormatter(yamlStr, defaultDate);
    let parsedPost = parseMarkdown(postName, md);
    return { formatter, md, ...parsedPost };
}

// Parse an .md file, remove it, generate post.html and toc.json, then return metadata of post.
// Not a pure function.
async function processPost(postDir) {
    if (!(await fs.stat(postDir)).isDirectory()) return;
    let name = path.basename(postDir);
    let mdFile = (await listDir(postDir)).filter(x => x.endsWith('.md'));

    // Check if given post is hidden post
    if (name.startsWith('.')) return;

    // Check if there are exactly one markdown file
    if (mdFile.length === 0) {
        throw new Error("There are no markdown file for post " + name);
    } else if (mdFile.length > 1) {
        throw new Error("There are more than one markdown file for post " + name);
    } else {
        mdFile = mdFile[0];
    }

    // Parse markdown file
    let rawString = await fs.readFile(mdFile, { encoding: "utf-8" });
    let { formatter, md, html, thumbnail, toc } = parsePost(name, rawString);

    // Write data
    fs.writeFile(path.join(__dirname, 'posts', name, path.basename(mdFile)),
        '---\n' + yaml.dump(formatter) + '\n---' + md);
    fs.writeFile(path.join(postDir, 'post.html'), html, 'utf-8');
    fs.writeFile(path.join(postDir, 'toc.json'), JSON.stringify(toc), 'utf-8');

    // Remove markdown file
    fs.unlink(mdFile);

    // Return metadata
    return { ...formatter, name, thumbnail };
}

async function main() {
    let src = path.join(__dirname, 'posts');
    let dst = path.join(__dirname, 'public', 'posts');

    // Delete existing data
    try {
        if (+(process.version.substr(1, 2)) < 12) {
            console.error("Could not run rmdir because of node version is too low.");
        }
        // `rmdir` commmand with recursive option equires node version > 12
        await fs.rmdir(dst, { recursive: true });
    } catch (_) { return; }

    // First, copy raw post data to dst directory
    ncp(src, dst, async () => {
        // Second, compile them.
        let postData = await Promise.all((await listDir(dst)).map(processPost));

        // Filter empty posts
        postData = postData.filter(x => x);

        // Sort the metadata by the date and convert it to a dictionary.
        let meta = {};
        postData = postData.sort((a, b) => b.date - a.date);
        postData.forEach(data => meta[data.name] = data);

        // Write the metadata to file
        fs.writeFile('src/meta.json', JSON.stringify(meta), 'utf-8');

        // Generate sitemap
        let sitemap = getSitemap('https://unknownpgr.github.io/', meta);
        fs.writeFile(path.join(__dirname, 'public', 'sitemap.xml'), sitemap);
        console.log('Post update finished!');
    });
}

main();
