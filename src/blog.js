const fs = require('fs')
const util = require('util')
const path = require('path')
const yaml = require('js-yaml');
const converter = new (require('showdown')).Converter({
    tables: true
})

// Promisified functions
const readDir = util.promisify(fs.readdir)
const listDir = async dirPath => (await readDir(dirPath)).map(x => path.join(dirPath, x))
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const stat = util.promisify(fs.stat)

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
    return Promise.all(array.map(func))
}

// Get post data from post path
async function getPostData(postPath) {
    // Convert postPath to full path
    postPath = path.resolve(postPath);

    // Get markdown file name
    const mdFilePath = (await listDir(postPath)).filter(x => x.endsWith('.md'))[0]
    if (!mdFilePath) throw new Error('There are no content file')

    // Create data
    var ret = {
        postName: path.basename(postPath),
        postPath: path.relative(__dirname, postPath),
        mdFileName: path.basename(mdFilePath),
        mdFilePath: path.relative(__dirname, mdFilePath),
        jsxFilePath: path.relative(__dirname, path.join(postPath, path.parse(mdFilePath).name + '.jsx'))
    }

    // Parse YMAL formatter and get title and tags.
    const fileText = await readFile(mdFilePath, 'utf-8')
    const parsed = fileText.split('---')
    if (parsed.length < 2) throw new Error('No YAML formatter exists in ' + mdFilePath + '.')
    const header = yaml.safeLoad(parsed[1])
    if (!header['title']) throw new Error('YAML formatter does not contain \'title\' attribute. YAML header : ', header)
    ret['title'] = header['title']
    ret['category'] = header['category']

    // Get Date
    const date = new Date(header['date'])
    if (isNaN(date)) {
        ret['date'] = (await stat(mdFilePath)).birthtime
    } else {
        ret['date'] = date
    }
    return ret;
}

async function generateJsx(posts) {
    return asyncForEach(Object.keys(posts), async function (post) {
        const { mdFilePath, jsxFilePath, postPath } = posts[post]
        const src = await readFile(path.join(__dirname, mdFilePath), 'utf-8')
        const markdown = src.substring(3 + getNthIndexOf(src, '---', 2))
        const html = converter.makeHtml(markdown)
        const jsx = `
import React from 'react'
export default function(props) {
    return (
        <div className="blog-post">
        ${html}
        </div>
    );
};`
        writeFile(path.join(__dirname, jsxFilePath), jsx)
    })
}

async function getMetadata() {

    // Get post directories
    var pathes = (await listDir('./posts')).filter(x => fs.statSync(x).isDirectory())
    const errors = []
    const posts = {}
    let postOrder = []
    const categories = {}
    await asyncForEach(pathes, async function (path) {
        try {
            const postData = await getPostData(path)
            const { postName, category } = postData
            posts[postName] = postData
            postOrder.push(postData)
            if (categories[category]) categories[category].postCount++
            else categories[category] = { postCount: 1 }
        } catch (e) {
            errors.push({ postPath: path, error: e })
        }
    })

    // Sort posts by date
    postOrder = postOrder
        .sort((a, b) => b.date - a.date)
        .map(post => post.postName)

    return {
        posts,
        errors,
        categories,
        postOrder
    }
}

async function main() {
    const meta = await getMetadata()
    writeFile(path.join(__dirname, 'meta.json'), JSON.stringify(meta))
    generateJsx(meta.posts)
}

main()
