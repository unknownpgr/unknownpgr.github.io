---
title: Starting Blog Development 👨‍💻[9] - Next.js
tags:
  - blog development
date: 2022-11-23T07:16:20.388Z
---

> This post was translated from Korean into English by AI.

I've been working on many projects since joining the military. One of them is revamping my blog.

# Next.js

I recently had the chance to use Next.js while working on a project with a friend. As I used it, I came to see what a truly beautiful framework it is, with features such as directory-based routing, automated Server Side Rendering (SSR), Static Site Generation (SSG), and excellent TypeScript support. So I decided to apply it to my blog right away.

With the blog's previous architecture, I would run a preprocessing program after writing a post file. The preprocessor generated a JSON file containing metadata in React's public directory, dummy HTML files for implementing the SPA, and JSON files containing information about each post. In the browser, these were loaded through the fetch API after all the JavaScript files had loaded. As a result, no SSR of any kind could take place in this process. This was because integrating React with SSR was quite difficult.

Also, although the preprocessor and the blog frontend were included in the same repository under the previous architecture, they were treated as separate projects. This made it impossible to share types and difficult to take advantage of TypeScript.

Next.js automatically performs SSG with the appropriate `getStaticProps` configuration, solving a variety of problems. Simply moving post preprocessing into `getStaticProps` made SSG possible. I could have kept a separate preprocessing step as before, but I concluded that it would only increase complexity while providing almost no benefit.

> However, when the preprocessing step is placed inside `getStaticProps`, starting a build or development server causes `getStaticProps` to run multiple times, resulting in unnecessary post preprocessing. I therefore implemented a simple cache to prevent duplicate runs.

This solved a wide range of issues all at once, including SPA redirection problems, slow loading, a complex architecture, and the generation of robot.txt and a sitemap. In particular, I previously wrote the code for generating robot.txt and the sitemap myself, but now I use a library that generates them automatically.

# Design

As I revamped the blog, I also updated its design to match how my design tastes have changed.

I used to prefer elaborate designs. I liked things that were visually elaborate, but I also mean that I preferred having lots of features. After working on many development projects, however, I realized that adding unnecessary features is likely to create technical debt. This led me to adopt a design philosophy of “if it isn't essential, leave it out.”

As a result, this blog has only three pages in total: the main page, the post page, and the about page. Even counting every TypeScript file—including type definitions, pages, and components—there are only nine. In particular, not even the longest frontend source file exceeds 100 lines. I also removed thumbnails from the post list and eliminated the category page.

# Devcontainer

Another major change was the adoption of Devcontainer. Previously, I simply worked directly on the machine and performed builds inside a Docker image, whereas I now develop inside VSCode's Devcontainer. This has made it possible to develop in a consistent environment across different machines.

# Conclusion

I've given the blog a fresh overhaul. In the process, I adopted Next.js and Devcontainer and gave the design a cleaner look.
