---
title: Starting Blog Development👨‍💻[7] - Refactoring
tags:
  - blog development
date: 2020-09-25T15:56:00.000Z
---

> This post was translated from Korean into English by AI.

A little while ago, while trying to write a post for the blog, I discovered a major problem: mathematical formulas. Being able to enter formulas is essential for posts about mathematics or physics, but rendering them was quite difficult with the way my blog worked. In this post, I’d like to explain how I solved that problem.
![Refactoring: clean your code](refactoring-i1.png)

# Problems with the Previous Approach

Previously, posts were rendered as follows.

1. Write a Markdown file
2. Convert the Markdown file to HTML
3. Convert the resulting HTML to JSX
4. Dynamically import and render the JSX

When I first developed the blog, I wanted to make as much use of React’s features as possible. Also, inserting HTML in React requires an attribute called `dangerouslySetInnerHTML`, and its name clearly gives off a **do not use this** vibe, so I implemented the blog without using it. That was how I ended up with this complicated approach.

The problem was that adding extra features was extremely difficult. To render mathematical formulas on the backend, I needed to set various attributes, including `class`, but I could not be sure that every attribute would be converted correctly into `.jsx`. The emoji problem I discussed in an earlier post arose from the same issue: after converting HTML to JSX, emojis were not handled correctly, resulting in warnings. Image processing was also quite cumbersome, and I barely managed it using regular expressions and all sorts of tricks.

Another problem was that compilation took longer than expected. At first, I thought compiling `.jsx` into `.js` would be quick, but surprisingly, it took anywhere from 30 seconds to over a minute, so I had to wait quite a while. An especially serious drawback was that compiling a single post required recompiling every file from scratch.

# The New Approach

I decided to keep things simple.

1. Write Markdown
2. Save it as an HTML file
3. Dynamically load the HTML file in JSX and insert it using the `dangerouslySetInnerHTML` attribute (The dynamic loading uses `fetch`, not `import`, so no recompilation is required.)

## Advantages of the New Approach

While adopting the new approach, I switched from the `showdown` library I had been using to `markdown-it`, and this brought many advantages. `markdown-it` works in two stages: first it parses a Markdown string and breaks it into tokens, and then it renders those tokens back into HTML. Performing various operations between these two stages makes many things much easier.

### Parsing

For example, I previously parsed the completed HTML file with regular expressions to create a table of contents and process images and emojis. This generally worked well, but in principle, it could never work 100% of the time. That is because HTML syntax is a context-free grammar, while regular expressions can recognize only regular grammars. For example, if an attribute contains a `>` symbol, the old processing method cannot recognize it as part of a valid tag. `markdown-it`, however, uses a proper parser, so it can distinguish these cases perfectly. Therefore, to retrieve or identify a particular tag, all I have to do is traverse the token tree with DFS. The blog management code originally consisted of a main file of about 200 lines plus roughly three other modules of around 100 lines each, but now it has been reduced to a single file of about 150 lines.

### Syntax Highlighter

Second, I can now use a syntax highlighter. Previously, code was not syntax-highlighted, but `markdown-it` provides a clean way to use `highlight.js`. Now code is syntax-highlighted when I enter it.

```c
// Syntax highlighting example
#include<stdio.h>

int main(){
    printf("Hello world!\n");
    return 0;
}
```

### Formula Rendering

Third, there is also a $\LaTeX$ formula-rendering plugin called `markdown-it-katex`, so formulas can be rendered as well. There is a library called $\KaTeX$ for rendering LaTeX on the web, and this plugin wraps it so it can be used with `markdown-it`. (There were a few problems with using it as-is, so I modified it myself. See the TMI section at the bottom.)

$$
\text{Let }f(x) =\frac{f'(x)}{\alpha}\\
\text{Then } f(x)=e^{\frac{x}{\alpha}}
$$

Not only simple formulas like this, but all kinds of complex formulas supported by $\LaTeX$ are supported as well.
$$
f(x) = \int_{-\infty}^\infty\hat\xi,e^{2 \pi i \xi x}\,d\xi
$$

### Emojis

Fourth, for some reason I cannot begin to understand, I can now throw in as many emojis as I want without getting errors.;; Previously, I had to wrap them in `<span>` tags and go through all sorts of bizarre steps....

👩‍💻👩‍💻🤘❤

### Speed

Finally, redundant compilation is no longer necessary. Previously, the blog had to be recompiled not only for major work such as changing its structure, but even just to upload a single post. Now, however, posts are rendered using `fetch` rather than `import`, so recompilation is needed only when changing the overall structure of the blog. Otherwise, I can write blog posts without compiling anything.

All in all, this refactoring brought a lot of benefits.

# Something Else I Learned - How to Apply Fonts

I like the Noto Sans font, so I had configured the CSS as follows to apply it throughout the blog.

```scss
* {
  font-family: "Noto Sans KR", sans-serif;
}
```

But this made every number in my formulas use Noto Sans, which looked really, really ugly. On top of that, `<code>` tags also ended up using Noto Sans instead of an appropriate font such as Consolas. After struggling with it for quite a while, I realized that the default font for an entire web page should be set as follows.

```scss
html,
body,
#root {
  //	...other attrs
  font-family: "Noto Sans KR", sans-serif;
}
```

Tags such as `<math>` and `<code>` have their own default fonts. While the first method overrides all of those default fonts, the second changes only the fonts of tags that do not have their own default font, leaving the others untouched.

# TMI

## The markdown-it-katex Version

I used the `markdown-it-katex` library to render formulas. But the library did not work properly. It failed whenever Unicode (Korean text) was included, and line breaks (`//`) did not work either.

However, on the `katex` demo site, both Korean text and line breaks work perfectly well. So I took the library apart myself to solve the problem. It turned out to be simpler than I had expected: the library was using version 0.6.0 of `katex`, even though `katex` had already reached version 0.12.0. (...It was a four-year-old version...)

When I checked the library’s GitHub repository, I found that a PR to update the `katex` version had already been submitted and its commit had been made. For some reason, though, the changes were not applied when I downloaded the module from npm.

In the end, there did not seem to be any immediate way to fix it, so I simply copied the entire library, modified it, and used that version.

## KaTeX Fraction Bars

There was also a problem in $\KaTeX$ where the horizontal bar would not render for small fractions. I checked and found that the bar was `0.045em` thick, but, amusingly, Chrome had a bug that prevented lines between `0.04em` and `0.05em` thick from being rendered. Fortunately, perhaps in anticipation of situations like this, KaTeX had an option for setting the minimum thickness of horizontal lines, and I solved the problem by using it.
