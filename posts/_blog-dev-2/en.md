---
title: Starting Blog Development👨‍💻[2] - Laying Out the Blog's Framework
tags:
  - blog development
date: 2020-07-25T10:37:27.328Z
---

> This post was translated from Korean into English by AI.

When I started developing the blog, the first thing I thought about was how I would build it. The easiest approach would have been to use an existing solution such as [Jekyll](https://jekyllrb.com/) or [Hexo](https://hexo.io/), but since I was building the blog as a learning project, I decided to create it myself from the ground up.

## Blog Development Goals

Before building the blog, I set the following development goals.

1. Since I am studying `React`, build it as an SPA (Single Page Application) using `React` and `React-router`.
2. However, posts should be loaded dynamically rather than all at once. (Otherwise, the loading time will become extremely long as the number of posts grows.)
3. Build the design using React-Bootstrap and customize it with `custom.scss`.
4. Writing a post should not be complicated: it should be possible simply by creating a new folder with any name in the `posts` directory and writing a markdown file with any name that includes YAML front matter. This is so that good existing markdown editors such as Typora can be used.
5. When publishing a post, tasks such as entering a commit to synchronize with GitHub should be automated so that the process requires only a few simple actions.
6. The blog management system should be easy to expand into a GUI later (if necessary).
7. Avoid constants as much as possible. For example, the directory containing posts is named `posts` by default, but users should be able to change it to something like `articles` if they want.  
8. It should not be tied to any particular operating system or post-writing tool.
9. It should support Unicode. (Because I need to write posts in Korean.)
10. Minimize, whenever possible, what must be installed to start the blog. For example, Jekyll requires Ruby to be installed, while Hexo requires Node.js. This creates a barrier to entry for people who are not familiar with programming.

This is the same list found in the README.md of [my GitHub blog development repository](https://github.com/unknownpgr/github-blog), with a few edits to make it easier to understand.

## How the Blog Works

A blog is not, fundamentally, a static website. As posts are written, the post list must change, and a page must be created for each post. Therefore, implementing this requires a separate program to manage the blog. In the case of my blog, [blog.js](https://github.com/unknownpgr/github-blog/blob/master/blog.js) serves that role. In brief, the script works as follows.

1. It reads the information from all posts and creates a metadata JSON file. This metadata JSON contains each post's title, category, publication date, and approximately 100 characters of text for previewing the body. This JSON is saved as meta.json.
2. It finds the .md file in each post directory and converts it into a JSX file. This is saved as view.jsx.
3. It generates each post's Table of Contents (TOC) in JSON format. This JSON is saved as toc.json in each post directory.

After blog.js runs and finishes updating the metadata, the blog is built. The blog statically imports meta.json; when a particular post is selected, it dynamically loads that post's view.jsx and toc.json and displays them to the reader.
