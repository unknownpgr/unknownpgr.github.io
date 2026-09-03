---
title: Starting Blog Development👨‍💻[3] - Implementing CI
tags:
  - blog development
date: 2020-07-25T11:51:36.698Z
---

> This post was translated from Korean into English by AI.

# The Inconvenience of Writing Posts

 While building my GitHub blog, I realized that the process of writing a single post was far too cumbersome. At the time, writing and publishing a post on the blog required going through the following steps.

1. Run `node blog.js` to update the blog metadata and generate a JSX file for each post
2. Run `yarn build` to build the React app
3. Clone the `unknownpgr.github.io` repository locally
4. Delete everything in the `unknownpgr.github.io` repository and copy the contents of the `/build` directory into it
5. `git add .`
6. `git commit -m "Commit message"`
7. `git push origin master`

...

This is not good. Writing a single post requires no fewer than seven steps, and if even one of them fails, the post cannot be published. Steps 1 and 2 in particular are only possible with Node.js installed, but I wanted Git to be the only tool anyone needed to install in order to use the blog.

At first, I thought Node.js was unavoidable because the blog had to be built, so I made blog.js execute the entire process above. But I wondered whether it could be automated, and after some extensive Googling, I discovered the concept of CI.

# What Is Continuous Integration (CI)?

## Why It Was Introduced

Continuous integration is a concept that emerged to solve problems like these. My blog is a project that I manage by myself, and development takes place in just one—or at most two—development environments. But what if a large IT company needed to follow a process like this?

When multiple people work on a project, there is typically a single codebase, which each person copies to do their development work. By the time you finish your work, however, other developers will probably have modified the codebase, so it will have changed. To integrate your work back into the codebase, you therefore need to pull those changes again. If the codebase has changed substantially, integrating your work will require a great deal of additional modification as well. At that point, you may end up spending more time merging code than writing it. And if the development and build environments are different? Even getting the environments aligned is bound to be a hassle.

After putting all that effort into merging everything, you encounter an error during the build. A lightweight project such as a blog can be built in a minute and a half, but building the enormous projects operated by companies can take hours. If an error occurs, you have to spend all that time building it again. Naturally, you cannot do any other work until you fix the error and get the build to succeed.

On top of that, as [Woowa Brothers' tech blog](https://woowabros.github.io/experience/2018/06/26/bros-cicd.html) explains well, a complex build and deployment process increases the likelihood of human error. Once the build finishes, someone also has to notify the testers and request beta testing.

All of these processes slow down project development and require additional labor.

## How CI Works

This is where the concept of CI comes in. As the name Continuous Integration suggests, CI **means automating all of this integration work**. For example, a CI pipeline could be configured as follows.

1. After completing their work, a developer submits a PR to a specific branch.
2. The CI server automatically detects it and runs unit tests.
3. If the tests pass, the PR is merged and a build is automatically performed.
4. If the build succeeds, the testers are automatically notified, and they test the build output to check for problems.
5. If there are no problems, it is deployed.

This automation allows the development–integration–testing–build cycle to operate efficiently.

# CI for a GitHub Blog

My project is only a GitHub blog, and it does not really have anything that could be called a unit test. In fact, if the React build completes, it is safe to assume that there are no problems. I therefore designed the following CI process.

1. Start when a push event occurs on the master branch
2. Run `blog.js` to correct post errors, update the blog metadata, and generate JSX files
3. If any post errors were corrected, commit and push the changes
4. Build the blog
5. If the blog build succeeds, deploy it to `unknownpgr.github.io`
6. Once the process is complete, send a success or failure notification through the Slack app.

This CI process is implemented using Actions provided by GitHub. Simply create a `.github/workflows` directory in the project and write a workflow in YAML format, and it will run automatically. [The workflow I configured](https://github.com/unknownpgr/github-blog/blob/master/.github/workflows/auto-update.yml) operates as follows.

1. When a commit whose message contains the string `post-update` is pushed to the master branch,
2. Check out the repository
3. Initialize the project (`yarn install`)
4. Run `node blog.js` to update it.
5. Send a Slack notification if it fails
6. If any post errors were corrected, commit and push the changes to the current repository
7. Build the updated content
8. Send a Slack notification if it fails
9. Create a new directory for the `unknownpgr.github.io` repository
10. Run `git init` and `git pull`
11. Copy the build directory into the new directory
12. Commit and push.

# Conclusion

After configuring the CI process above, the process of writing a post became as simple as this.

1. Run a script containing `git pull;git add .;git commit -m "Commit message"`, or enter the commands manually
2. Wait for the Slack notification

If it succeeds, I can inspect the published post for problems; if it fails, I can find the cause and debug it. All Node.js builds are performed inside an Ubuntu Docker container provided by GitHub Actions, so no program other than Git needs to be installed in order to use the blog.
