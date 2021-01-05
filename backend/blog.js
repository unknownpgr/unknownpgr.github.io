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
            } catch (_) { }
        }
        return ''; // use external default escaping
    }
});
markdown.use(ketex);
const getSitemap = require('./libs/sitemap');

// Alias frequently used functions
const join = path.join;
const write = fs.writeFile;
const listDir = async (dirPath) => (await fs.readdir(dirPath)).map(x => path.join(dirPath, x));


// Promisify ncp
const pncp = (src, dst) => new Promise((res, rej) => ncp(src, dst, (err) => { err ? rej() : res(); }));

// Split post into YAML formatter part and markdown part.
// Pure function
function parseRawPostString(src) {

    // Find n-th appearence of pattern in string. index starts from 1.
    function getNthIndexOf(str, pattern, n) {
        let l = str.length,
            i = -1;
        while (n-- && i++ < l) {
            i = str.indexOf(pattern, i);
            if (i < 0) break;
        }
        return i;
    }

    const splitter = getNthIndexOf(src, "---", 2);
    const formatter = src.slice(0, splitter);
    let md = src.slice(splitter + 3);
    return [formatter, md];
}

// Parse YAML formatter string into json object.
// Automatically correct some data
// Alomost pure function (use `new Date()` in code)
function parseFormatter(formatterStr) {
    let formatter = yaml.safeLoad(formatterStr);

    // Check required properties
    if (!formatter["title"])
        throw new Error("YAML formatter does not contain 'title' attribute.");
    if (!formatter["category"])
        throw new Error("YAML formatter does not contain 'category' attribute.");

    // Add date if it doesnt exists, else just \ beautify it
    const date = new Date(formatter.date);
    if (!formatter.date || isNaN(date)) {
        formatter["date"] = new Date();
    } else {
        formatter["date"] = new Date(date);
    }

    // Beautify category
    let { category } = formatter;
    category = category.replace(/( |\t|_|-)+/g, " ").toLowerCase();
    formatter.category = category;

    return formatter;
}

// Parse markdown and return html, thumbnail path, toc.
// Pure function
function parseMarkdown(postName, markdownStr) {
    let thumbnail = '';
    let toc = [];

    let tokens = markdown.parse(markdownStr);

    /**
     * This section does
     * - Change the image path(which is a relative path) to an absolute path.
     * - Get the first image as a thumbnal.
     */
    {
        function recursiveUpdate(_tokens) {
            for (let i = 0; i < _tokens.length; i++) {
                if (_tokens[i].type === 'image') {
                    // token.attrs[0][1] : the soruce path of the image tag
                    // Update the image path to an absolute path
                    _tokens[i].attrs[0][1] = join('/posts', postName, _tokens[i].attrs[0][1]);
                    // Get the first image as thumbnail
                    if (!thumbnail) thumbnail = _tokens[i].attrs[0][1];
                }
                if (_tokens[i].type === 'inline') recursiveUpdate(_tokens[i].children);
            }
        }
        recursiveUpdate(tokens);
    }

    /**
     * This section does
     * - Assign an id to every header 
     * - Build table of content
     */
    {    // Assign an id to header and build table of content
        let headerIndex = 1;
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
    }

    let html = markdown.renderer.render(tokens, markdown.options);
    return { html, thumbnail, toc };
}

// Parse raw string and return formatter, html.
// Pure function
function parsePost(postName, rawStr) {
    let [yamlStr, markdownStr] = parseRawPostString(rawStr);
    let formatter = parseFormatter(yamlStr);
    let parsedPost = parseMarkdown(postName, markdownStr);
    return { formatter, markdownStr, ...parsedPost };
}

// Parse an .md file, remove it, generate post.html and toc.json, then return metadata of post.
// Not a pure function.
async function processPost(srcDir, dstDir, name) {
    let postDir = join(dstDir, name);

    // Check if given post is a hidden post
    if (name.startsWith('.')) return;
    // Check if given path is a valid directory
    if (!(await fs.stat(postDir)).isDirectory()) return;
    let mdFile = (await listDir(postDir)).filter(x => x.endsWith('.md'));

    // Check if there are exactly one markdown file
    if (mdFile.length === 0) {
        throw new Error("There are no markdown file for post " + name);
    } else if (mdFile.length > 1) {
        throw new Error("There are more than one markdown file for post " + name);
    } else {
        mdFile = mdFile[0];
    }

    // Parse markdown file
    let rawPostStr = await fs.readFile(mdFile, { encoding: "utf-8" });
    let { formatter, markdownStr, html, thumbnail, toc } = parsePost(name, rawPostStr);

    // Update post file
    write(join(srcDir, name, path.basename(mdFile)), '---\n' + yaml.dump(formatter) + '\n---' + markdownStr);
    // Write generated html, table of contents
    write(join(postDir, 'post.html'), html, 'utf-8');
    write(join(postDir, 'toc.json'), JSON.stringify(toc), 'utf-8');

    // Remove markdown file
    fs.unlink(mdFile);

    // Return metadata
    return { ...formatter, name, thumbnail };
}

async function main() {
    const src = join(__dirname, '../posts');
    const dst = join(__dirname, 'posts');
    const sitemapPath = join(__dirname, 'sitemap.xml');
    const metaPath = join(__dirname, 'meta.json');

    // Delete existing data
    try {
        // `rmdir` commmand with recursive option equires node version > 12
        if (+(process.version.substr(1, 2)) < 12) {
            console.error("Could not run rmdir because of node version is too low.");
        }
        await Promise.all([
            fs.rmdir(dst, { recursive: true }),
            fs.unlink(metaPath),
            fs.unlink(sitemapPath)
        ]);
    } catch (e) {
        console.log("There was some error while removing data.");
        console.log(e);
    }

    // Copy raw post data to dst directory
    await pncp(src, dst);

    // Compile them and save compiled results
    let postData = (await Promise.all((await fs.readdir(dst)).map(name => processPost(src, dst, name))))
        .filter(x => x);

    // Sort the metadata by the date and convert it to a dictionary.
    // Actually, a dictionary should not have an order.
    // Thus, it is just a trick and not a recommaned coding pattern.
    let meta = {};
    postData = postData.sort((a, b) => b.date - a.date);
    postData.forEach(data => meta[data.name] = data);

    // Write the metadata to file
    write(metaPath, JSON.stringify(meta), 'utf-8');

    // Generate sitemap from metadata
    let sitemap = getSitemap('https://unknownpgr.github.io/', meta);
    write(sitemapPath, sitemap);
    console.log('Post update finished!');
}

main();
