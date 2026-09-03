---
title: Starting Blog Development👨‍💻[8] - Structural Overhaul
tags:
  - blog development
date: 2021-01-05T05:34:01.406Z
---

> This post was translated from Korean into English by AI.

Now that the semester is over, I have revamped the blog. As I used React frequently in other projects, the parts of this blog that needed fixing became easier to spot. As a result, quite a lot has changed.

# Component Structure

- Previously, the source was structured with all the `jsx` and `scss` files separated. I have moved away from that approach and created a separate directory for each component, along with a component-specific `scss` file.

- I had also written the `scss` files without giving them much thought, which led to a problem where a child component's `scss` affected its parent component. To fix this, I assigned a unique class name to the top-level element of each component and wrapped everything in each `scss` file with that class.

  - ```jsx
    ...
    import 'somecompoent.scss'
    ...
    return <div className="some-component">
    	<div className="inner">
            ASDF
        </div>
    </div>
    ...
    ```

  - ```scss
    // somecomponent.scss 
    .some-component{
        .inner{
            ...
        }
    }
    ```

  - Of course, [SCSS modules](https://create-react-app.dev/docs/adding-a-css-modules-stylesheet/) are available in React, but I decided not to use them because of the various inconveniences involved.
  
- I also improved the UI, so now, when you click a category in the list on the left side of the blog's main page, the category you are currently viewing is shown in bold. Previously, it was difficult to tell which category you were viewing.

- Previously, a short excerpt from each post appeared under its title. But looking at it again, I realized it was neither particularly useful nor visually appealing, so I simply removed it.

# Project Structure

The project structure itself has also changed considerably. Previously, the frontend and backend(?) were combined, but I have now separated them into entirely different directories so that there is a clear distinction between the two.

>  Here, "backend" does not refer to the kind of backend typically discussed in web development, with a database and so on. Instead, it refers to the scripts used to compile the blog. Since I could not think of a more suitable term, I simply decided to call it the backend.

 Previously, after writing and compiling a new post, its metadata was stored in the frontend. This meant that every time I wrote a post, the frontend source code changed slightly and therefore had to be rebuilt. With this overhaul, however, the frontend source code does not change at all, while the post information can be updated separately.

As a result, writing posts and updating the blog's structure can now be done independently.

# CI/CD

As the blog structure was divided into frontend and backend, I also reconfigured the CI/CD setup that uses GitHub Actions. The biggest change was properly fixing the caching. Previously, I had copied some GitHub Actions caching code I found on Google, but it turned out that I had specified the key incorrectly, so nothing was being cached at all. Once I fixed it properly, build speeds became about ten times faster. Running `yarn install` used to take more than a minute in some cases, but now it usually finishes within three seconds. (I should have read the documentation sooner...)

This is only a minor update, but previously, environment variables were specified in each step of the GitHub workflow. Since that could make things difficult for anyone who wanted to fork and use this repository, I gathered all the environment variables at the top level.

# Things to Change in the Future

Currently, both the blog's structure and all its posts are stored in the master branch. However, this would make it difficult for other people to fork and use the blog (though I do not know whether anyone would want to). So I am considering whether it might be better to designate a separate branch for storing post information and remove all post information from the master branch.
