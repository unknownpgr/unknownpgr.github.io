// Generate sitemap xml (return type string) from urls.
// Use any[] for key-iteration
function getSitemapFromURL(urls) {
  let sitemap =
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  urls.forEach((url) => {
    sitemap += "<url>\n";
    for (let key in url) {
      sitemap += `<${key}>${url[key]}</${key}>\n`;
    }
    sitemap += "</url>\n";
  });
  sitemap += "</urlset>\n";
  return sitemap;
}

// Get the list of urls from metadata(blog-specified)
function getURLsFromMeta(host, meta) {
  if (host.endsWith("/")) host = host.substr(0, host.length - 1);

  let urls = [
    {
      loc: host,
      changefreq: "always",
      priority: 1.0,
    },
  ];
  for (let key in meta) {
    let data = meta[key];
    urls.push({
      loc: `${host}/posts/${data.name}/`,
      lastmod: data.date.toISOString(),
      changefreq: "monthly",
    });
  }
  return urls;
}

function getSiteMap(host, meta) {
  return getSitemapFromURL(getURLsFromMeta(host, meta));
}

module.exports = getSiteMap;
