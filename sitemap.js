const path = require("path");

// Generate sitemap xml (return type string) from urls.
function getSitemap(urls) {
  let sitemap = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  urls.forEach((url) => {
    sitemap += "<url>";
    if (!url.loc) throw new Error("No location in url data.");
    for (let key in url) {
      sitemap += `<${key}>${url[key]}</${key}>`;
    }
    sitemap += "</url>";
  });
  sitemap += "</urlset>";
  return sitemap;
}

// Get the list of urls from metadata(blog-specified)
function getUrlsFromMeta(host, meta) {
  let urls = [
    {
      loc: host,
      changefreq: "always",
      priority: "1.0",
    },
  ];
  for (let key in meta.posts) {
    let data = meta.posts[key];
    urls.push({
      loc: path.join(host, "posts", data.name),
      lastmod: data.date,
      changefreq: "monthly",
    });
  }
  return urls;
}

module.exports = { getSitemap, getUrlsFromMeta };
