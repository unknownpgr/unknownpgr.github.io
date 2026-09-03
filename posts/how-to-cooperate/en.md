---
title: How to Collaborate Effectively
tags:
  - development
date: 2021-01-09T13:39:34.560Z
---

> This post was translated from Korean into English by AI.

# The Basics of Collaboration

Lately, I have had many opportunities to collaborate with other people. Some projects run smoothly even with five people working on them at the same time, while others have plenty of problems despite having only three people involved. Along the way, I have learned a little about how to collaborate effectively and what not to do. So I decided to organize my thoughts on what it takes to collaborate well.

Reading this again after finishing it, I think these are good practices to follow not only when collaborating, but also when coding alone.

## Do Not Push Broken Code

**If your code has errors, you must not push it to the remote repository.** This is a basic rule of collaboration. In fact, it is not even specific to collaboration; it is a basic rule of using Git. If there is an error, either do not push to the remote repository at all, or fix the error before pushing. **Ideally, you should not even commit broken code in the first place.** If, for some reason, you absolutely must push broken code, create a new branch where nobody else is working and push it there. Never push broken code to a branch that people are actively working on. If you do, the same error will appear in everyone else's working code. Then everyone else will either have to wait until someone resolves the problem or fix it in their own way, which will cause conflicts when the changes are merged later. Therefore, you must **never** push broken code.

Even if you do not push broken code, there may be times when you still need to commit it. In that case, you must clearly state in the commit that the code contains an error, and you must commit it on a separate branch rather than the main/master branch.

Of course, while developing, there are errors that appear only under specific circumstances and therefore go unnoticed. Errors can also arise during a merge even when Git reports no conflict. Or the error may be logical and difficult to recognize as an error. Naturally, such cases are unavoidable. But when there is an obvious error, such as one displayed in the console, you **must** fix it.

## An Error Is Still an Error Even If the Program Runs

For the sake of user experience, some languages and platforms display errors only in the console without notifying the user. In JavaScript or Unity, for example, the entire program rarely crashes unless an error is exceptionally severe. As a result, some people seem to think, “There is an error, but it works fine. So it is good enough.”

**But an error is an error under any circumstances.** Somewhere, the code is clearly not running as intended, and that can sometimes become a serious security vulnerability. Even merely printing an error in the output console has the harmful effect of making other error messages harder to notice. If you test it every way you can and find no problem at all, you can simply delete the entire part that causes the error. If an error occurs but removing that code causes no problem, then the code was meaningless anyway. Otherwise, there must be a problem, of course.

There is only one case in which leaving an error alone is acceptable: when the platform itself displays the error and there is nothing you can do about it. For example, in JavaScript, a 404 error message is displayed even if you handle the exception. Naturally, even then, preventing the error from occurring in the first place is far better.

## Warning == Error

Sometimes code produces a huge number of warnings while compiling, while running, or in the IDE. Most warnings occur when something is syntactically valid but logically problematic, or when there is a significant chance that it will cause a problem later. When collaborating, however, it is difficult to understand one another's code completely. If you do not resolve warnings in such situations, they will eventually turn into errors. Therefore, when collaborating, you must resolve every warning before pushing.

There is exactly one situation in which a warning can be ignored: you have written a function or variable that someone else will definitely use later, but that person has not used it yet, and the language itself does not support interfaces or a similar mechanism, so an `unused~~`-type error is unavoidable.

## Delete Unused Code

This is a problem found in a great deal of code: people do not delete code that is no longer used. When unused code remains, it becomes **very** difficult for collaborators to understand what that code does. Of course, simply addressing the warnings shown by the IDE will solve much of this problem. In some cases, however, code assigns or checks a variable that is never actually used. Because the IDE does not issue a warning in such cases, someone reading the code for the first time cannot tell whether it is meaningful without analyzing all of it.

You might think this is not a serious problem because it does not immediately cause a runtime error. But unused code is like a time bomb. As it accumulates, it makes it **impossible to find the cause** when an error that is difficult to trace eventually occurs. It is also a major culprit in **making maintenance fundamentally impossible**, especially when a new developer joins instead of someone who wrote the code from the beginning. **Unused code must be deleted. Unused code must be deleted. Unused code must be deleted.** I wrote it four times because it is important.

In some cases, people comment out unused code without any proper explanation. That is much better than simply leaving it in place, but it should still be avoided whenever possible. If you really need to leave code commented out like this, you should also explain why it was written, what it does, and why you commented it out instead of deleting it. There is no reason to do this in a Git-managed project in particular, since you can view earlier versions of the code and use branches. So when I encounter code like this while collaborating, I simply delete it—provided, of course, that it can be recovered from Git.

## Comments Are Essential

When several people work together, comments are not optional; they are essential. With function and variable names in particular, it is often impossible to understand their purpose unless it is documented in a comment. For example, suppose a variable has the type `int` and the name `time`. It might seem obvious that this variable represents time, so a comment may appear unnecessary. But someone reading the code for the first time has no way to know whether it is a datetime value; the time elapsed since the program started; in a game, the time elapsed since a round began; or whether it is stored in seconds, minutes, hours, days, or UNIX time. A comment is therefore essential.

**Comments are even more important for functions.** Because a function is a collection of code that can perform several operations, without an appropriate comment it may be impossible to tell what the function does at all.

Of course, there are rules for writing comments, and some comments are worse than no comment at all. **However**, if there are too many comments, you can delete them; if there are none, there is nothing you can do. If you are wondering whether to add a comment, it is better to add one.

## Follow Naming Conventions

The only absolute rule for naming a function or variable is `(_|[a-zA-Z])(_|[a-zA-Z]|[0-9])*`. **However**, there are generally accepted rules for naming functions and variables, and these rules are called conventions. When people hear “conventions,” they usually think of notation for names made up of multiple words (e.g. camelCase, snake_case, and kebab-case). But I consider word choice more important. It is not too late to change the casing later using an IDE's refactoring features.

For example, a function whose name starts with `set` should set the value of a variable, while one whose name starts with `get` should retrieve the value of a variable. A function whose name starts with `on` should be a callback, and one whose name starts with `is` should return a `boolean` value. For variable names, `i`, `j`, and `k` are generally used only as indices for iteration, while `l` is used almost exclusively to represent the length of an array.

Some names should also come in pairs, such as `get` and `set`. Usually, `start` pairs with `finish` or `end`, while `create` pairs with `delete` or `remove`. `push` is paired with `pop` almost 100% of the time and is rarely used unless something has stack-like behavior. Similarly, `(en)queue` is used with `dequeue` and is rarely used unless something has queue-like behavior. `pause` pairs with `resume`, `save` with `load`, and `read` with `write`. Therefore, if you implement a feature that stores a value under the name `write`, the feature that retrieves it should be named `read`; you should avoid naming it `load` or `get`.

There are also many words that sound plausible but are rarely used. For example, the verb `make` means to create something, but we usually use `create` when creating something and `generate` when generating a value; `make` is not used very often. Likewise, `bring` means to retrieve something, but we generally use `get`, `load`, or `read`, and hardly ever use `bring`.

Following these conventions can greatly improve code readability. Conversely, if you code in a way that departs radically from convention, **your code may become harder to read than obfuscated code.** This is not an exaggeration; it really can. Obfuscated code follows no rules at all, but **poorly chosen names can mislead readers about what a function or variable does**, which can make the code even harder to read than obfuscated code.

Sometimes, no matter how hard you think about it, there seems to be no appropriate conventional name for a function or variable. Usually, this means the code is poorly designed because you are trying to put too much functionality into a single function. When this happens, I split the function appropriately. If there is still no way around the problem, I give it a suitable name and add a very detailed comment explaining what it does.

## Include the Right Information in Names

Function and variable names should contain the right information. As we saw in the earlier example about comments, names such as `time`, `init`, `go`, and `run` make it difficult to infer any useful information. It is therefore better to provide sufficient information with names such as `initScene` and `processRunningTime`. Of course, this does not mean that every variable or function name should be tremendously long, like `TransactionAwarePersistenceManagerFactoryProxy`. (That is a real class name.) You just need to strike an appropriate balance with comments.

## Avoid Global Variables Whenever Possible

Like everything else discussed above, global variables are a major cause of code that is difficult to understand. You should avoid them whenever possible. If you really need to use a global variable, it is best to assign it in exactly one place and only reference it everywhere else. Once there are four or more global variables, I begin to assume that something is wrong.

Here, “global variable” means a variable that can be modified. A **constant** is, literally, constant. Even if it is global, it is not a **variable**, so **a global constant is not a global variable.** Feel free to use them. Likewise, functions are not global variables because they cannot be modified (even if they are declared in variable form, like lambdas).

Sometimes there are global variables, such as `static` variables in C, that are used only within a single function. In such cases, making the access modifier `private` is the bare minimum. It is also best to declare the variable immediately above the function to indicate that it is used only there, and to avoid names like `counter` or `time` that look as though they might be used elsewhere.

# Good Practices for Collaboration

While everything above consists of rules you must follow when collaborating, the points below are recommendations. Of course, many people consider these essential as well, but for a simple project I would not go so far as to require them.

- Use an appropriate code formatter, and make sure everyone shares the same configuration.
- Use an appropriate analyzer, such as ESLint, to maintain code quality. Its configuration should also be shared by everyone.
- Do not include several unrelated changes in a single commit. If you forgot to commit along the way, make active use of the staging feature to separate the changes into distinct commits.
- Write commit messages as imperative sentences, using the base form of the verb and capitalizing the first letter.
  - Write the commit message as though completing the sentence `This commit will "Commit message"`. (The very first init commit is an exception.)
    - This commit will "Add data sort function" (O)
    - This commit will "Added data sort function" (X)
    - This commit will "Function name refactor" (X)
- Keep the number of function parameters to four or fewer whenever possible. If a parameter does not always have to be supplied, give it a default value.
  - Conversely, if a parameter must always be supplied, do not give it a default value.
- Write functions as pure functions whenever possible.
- At the beginning of a project, structure and modularize it well, then assign those modules to individual team members. This will minimize conflicts.
- If it is possible that the project will be handed over to someone else rather than ending with me, write documentation.
  - If that is difficult, at least write a clean README.
- Keep a development log that summarizes the development process in one or two lines. This can prevent you from wondering later, `Wait, why did I do this back then?`
