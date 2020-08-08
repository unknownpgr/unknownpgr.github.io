"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUrlsFromMeta = exports.getSitemap = void 0;
require("./config");
// Generate sitemap xml (return type string) from urls.
// Use any[] for key-iteration
function getSitemap(urls) {
    var sitemap = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    urls.forEach(function (url) {
        sitemap += "<url>";
        for (var key in url) {
            sitemap += "<" + key + ">" + url[key] + "</" + key + ">";
        }
        sitemap += "</url>";
    });
    sitemap += "</urlset>";
    return sitemap;
}
exports.getSitemap = getSitemap;
// Get the list of urls from metadata(blog-specified)
function getUrlsFromMeta(host, meta) {
    if (host.endsWith("/"))
        host = host.substr(0, host.length - 1);
    var urls = [
        {
            loc: host,
            changefreq: "always",
            priority: 1.0,
        },
    ];
    for (var key in meta.posts) {
        var data = meta.posts[key];
        urls.push({
            loc: host + "/posts/" + data.name,
            lastmod: data.date.toISOString(),
            changefreq: "monthly",
        });
    }
    return urls;
}
exports.getUrlsFromMeta = getUrlsFromMeta;
