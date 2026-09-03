---
title: Starting Blog Development👨‍💻[5] - SPA
tags:
  - blog development
date: 2020-08-06T22:06:33.625Z
---

> This post was translated from Korean into English by AI.

After solving the emoji issue discussed in the previous post, I thought there would be no more problems. But as is always the case with programming, new problems inevitably arise.



![r/ProgrammerHumor - Debugging be like... Source: https://www.reddit.com/r/ProgrammerHumor/comments/9g4vml/debugging_be_like/](m0xy5opltgm11.jpg)



The problem was that I had developed the blog as a Single Page Application.

# The History of SPA (Single Page Applications)

Before getting into the problem, let's take a look at what an SPA is.

## Problems with Traditional Web Pages

Before the concept of an SPA emerged, websites had to <u>load a new HTML file from the server every time</u> they wanted to display new content. This had several drawbacks.

- Because the entire page had to be refreshed, users had to wait while looking at a blank screen as the page rendered.
- Even elements that were actually shared across multiple pages, such as the Header and Footer, had to be downloaded and rendered all over again each time.
- As a result, web pages took a long time to appear.
- The page flickered during each refresh, which was visually unpleasant.

## The Concept of an SPA

This led to the concept of the SPA. SPA stands for Single Page Application, and it refers to an approach that does not load the entire web page again every time, but instead <u>uses JavaScript to reload only the parts that are needed</u>.

- For example, when you switch categories on my blog, it does not render every component again; it renders only the post list, which is the part that actually needs to change.
- You can get a better feel for it by clicking the examples in the Examples section on the left side of the [React Router](https://reactrouter.com/native/example/Basic) website.

Therefore, when a web page is built as an SPA, a single HTML/JS file is enough to display a variety of screens. Whenever the web page needs to change, only the necessary parts have to be updated.

## The Fatal Drawbacks of Early SPAs

Of course, SPAs were not perfect from the moment they first appeared, and they initially had several drawbacks.

### Unable to Navigate to a Specific Page

For example, the website of the [Korea Contents Association](http://www.koreacontents.or.kr/) is built as an SPA. (I do not know who made it, but despite being an SPA, it renders everything again whenever you move to another page. 🤔) So, if you navigate to a specific page on this site, copy its URL, and open it in a new tab, you simply get the home page. In fact, even refreshing the page takes you back to the home page.

### No History Management

When you press the back button in a web browser, the browser takes you to the previous URL. But because an SPA does not change the URL, actions such as going back did not work at all within a site.

### Not Searchable (❗)

And ultimately, **they were not searchable.**

Search engines generally distinguish pages based on their URLs. But no matter how much content a web page built as an SPA contains, the site has only a single URL. This is because everything happens within a single `index.html` file. As a result, search engines recognize only the one page that loads at the very beginning. For shopping sites, blogs, online communities, Wikipedia, and other sites where the content of each page matters, being unsearchable is a fatal drawback.

## The Emergence of the HTML5 History API

Various ways to solve these problems subsequently emerged.

### Hash

One of them was the Hash. A <u>Hash is a URL format used to navigate to a specific element within a page</u>. You simply append the ID of a particular element to the URL in the form `#ELEMENT_ID`. You can easily find examples on Wikipedia.

```
https://en.wikipedia.org/wiki/Single-page_application#Technical_approaches
```

If you look closely at the URL above, there is a section near the end that begins with `#`. This is the Hash. If you visit [the URL above](https://en.wikipedia.org/wiki/Single-page_application#Technical_approaches), instead of going to the top of the page, you are taken to the location of the element whose `id` is `Technical_approaches`. Because a Hash points to the location of an element within a site, changing the URL's Hash using an `<a>` tag or JavaScript changes the URL without reloading the web page. Some libraries used this behavior to implement SPAs. (I believe [Angular](https://angular.io/) used this approach.)

Of course, the Hash was not a perfect solution either. It solved the first and second problems mentioned above, but some search engines ignored Hashes, so search still did not work very well.

And because this was more of a trick than the standard approach, the resulting URLs looked awkward.

```
https://unknownpgr.github.io/#/posts/some-post
```

...Having something strange inserted in the middle certainly looks awkward.

### HTML5 History API

With the arrival of HTML5, however, all of these problems disappeared at once.

One of the features of HTML5 is the [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API). In short, it lets you manipulate URLs and browser history however you like. Previously, changing the URL in the address bar required actually navigating to another page. With the History API, however, it became possible to manipulate the URL as though you had visited a new page without navigating away.

React's Browser Router emerged by making use of this feature. Browser Router is a technique that, when moving to a new page, does not actually perform any page routing at all but <u>changes the URL to make it look as though you have navigated to another page</u>. You can use it through a library called [React Router](https://reactrouter.com/).

# GitHub Pages Strikes Back

So I had no doubt that there would be no problem with building my blog as an SPA. The problem, however, was that GitHub Pages hosts sites using a static web server.

Take the page at `https://unknownpgr.github.io/posts/blog-dev-4`, for example. That path does not actually exist. The only file that really exists is `https://unknownpgr.github.io/index.html`; Browser Router merely changed the URL to the one above. But GitHub Pages' static server, completely unaware of this, assumes that there is no file at `https://unknownpgr.github.io/posts/blog-dev-4` and returns a 404 when that path is accessed.

## Solution

Fortunately, where there is a will, there is a way, and I found a solution.

If you create a `404.html` file in the root directory on GitHub, that page is displayed instead of GitHub Pages' default 404 page whenever a 404 occurs. The trick is to use this page to redirect back to the main page (`/`) while passing the originally requested page through a GET parameter.

```html
<!-- 404.html -->
<script>
    const url = `/?page=${encodeURIComponent(window.location.pathname)}`;
    window.location.replace(url);
</script>
```

The main page then checks the `page` parameter. If the parameter exists, it uses Browser Router to redirect to that page.

```jsx
// App.js
...
let param = window.location.search.substr(1);
let redirect = undefined;
if (param.indexOf("page=") >= 0) {
        let dest = decodeURIComponent(param.replace("page=", ""));
    console.log("Redirect to " + dest);
    if (dest.indexOf("/404.html") >= 0) {
        console.log("Ignore redirect to 404 page.");
	} else redirect = <Redirect to={dest} />;
}
...
```

Using this method, I was able to serve an SPA blog while still using GitHub Pages' static server.
