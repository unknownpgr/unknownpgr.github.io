---
title: Starting Blog Development 👨‍💻[6] - SEO
tags:
  - blog development
date: 2020-08-07T21:18:27.674Z
---

> This post was translated from Korean into English by AI.

In the previous post, I covered how I built an SPA on GitHub Pages, which only serves static content. I used a method that inserted a script into the `404.html` file to redirect visitors to the main page.

![iFunny.com](fv7itie7gr.jpg)

Yes... as it always has, as it still does, and as it surely will again, this creates yet another problem.

# Sitemap

When we create a new webpage, a web crawler needs to visit our site and add its pages to an index before the page can appear on search engines such as Google or Naver. Search Engine Optimization (SEO) is the practice of helping search engines update their view of a site promptly(?) and making the site easier to find. One way to do SEO is to submit a Sitemap to search engines. According to Wikipedia, a Sitemap is a list that describes the structure of a website.

> A **site map** (or **sitemap**) is a list of pages of a web site.

More specifically, it refers to an <u>XML file</u> created so that a <u>web crawler</u> can understand the structure of a site, and it usually looks like the example below. The website administrator submits this file to search engines, and the search engines add the sites listed in the file to their indexes. Those pages can then appear in search results.

```xml
<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
    <url>
        <loc>http://example.com/</loc>
        <lastmod>2006-11-18</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
</urlset>
```

(Alternatively, you can take a look at [my blog's sitemap](https://unknownpgr.github.io/sitemap.xml) yourself.)

If you look at the `<url>` section in the example above, you can see that it contains several properties.

- `<loc>`: Short for location, it specifies an address included in the site.
- `<lastmod>`: Short for last modified, it indicates when the page was most recently modified.
- `<chagefreq>`: Short for change frequency, it indicates how often the page is modified. It can have the following values:
  - `always`: The page changes every time it is visited
  - `hourly`
  - `daily`
  - `weekly`
  - `monthly`
  - `yearly`
  - `never`: The page never changes, as with an archive page
- `<priority>`: Just as the name suggests, this indicates the page's priority. It can have a value from 0.0 to 1.0, and the default is 0.5. It is used to express the relative importance of pages within a site. (Therefore, setting every value to 1.0 will not make all of your pages rank at the top of search results.)

There are several other properties as well, so please [refer to Wikipedia](https://en.wikipedia.org/wiki/Sitemaps#Element_definitions).

# 404

Search engines are designed to find useful information, so naturally they do not include 404 pages in their indexes. The problem is that, in order to serve my blog as an SPA, it redirects visitors through a 404 page. The page may remain there for less than 0.1 seconds, but the HTTP response header will still report a 404, and the crawler stops exploring at that point. As a result, none of the pages other than the main page were being indexed properly.

# Solution

No matter how much I thought about it, I could not come up with a clean solution. So, with no other choice, I simply created an HTML file for every post (...)

For example, a file like this:

```html
<!-- https://unknownpgr.github.io/posts/2020-07-21/index.html -->
<script>window.location.replace('/?page=%2Fposts%2F2020-07-21');</script>
```

Although GitHub Pages is a static server, it will at least send a directory's index.html when you access the directory rather than a file. Therefore, when someone visits `https://unknownpgr.github.io/posts/2020-07-21`, the file above is returned, and the visitor is taken to the desired page in exactly the same way as with the `404.html` method. In addition, the `404.html` approach requires a step to determine the current page URL, whereas this method has the page address hard-coded, giving it the advantage of switching pages (ever so slightly) faster.

# SPA vs. Multiple Pages

Before applying this solution, I spent some time wondering whether it would be better to give up on the SPA and build a blog consisting of multiple pages, or to use this sort of workaround. Here is why I decided not to give up on the SPA:

- Giving up the SPA would increase the blog's overall size. (Every post would need a complex index.html file.)
- I will need to modify index.html in the future for things like adding Google Analytics, and having to update every copy each time would make the process complicated.
- This redirection process only occurs when someone first enters the site. Once the site has loaded, a browser router handles navigation within it. Therefore, using this method neither causes a serious slowdown nor requires a redirect every time.
- Despite the redirect, search engines recognize the necessary content correctly.
- ![20200808061619441](20200808061619441.png)
