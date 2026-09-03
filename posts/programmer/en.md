---
title: How Do You Become a Developer?
tags:
  - tips
date: 2022-12-22T14:13:19.220Z
---

> This post was translated from Korean into English by AI.

I sometimes get questions like these. Actually, I get them fairly often.

- Which programming language should I study?
- Where should I start?
- How can I become a developer?

Or questions like these:

- What is coding?
- Does using CMD count as coding?

I would like to put my answers to these questions in one place.

# What Does a Developer Do in the First Place?

People who have not yet encountered software development tend to think of a developer vaguely as someone who makes programs, someone who does something difficult(?) with computers, or a hacker.
Of course, these are all things that actual developers do. But the essence of being a developer, as I see it, is slightly different.

To me, a developer is “someone who solves problems using IT.”

For example, the developers who build and maintain KakaoTalk are people solving the problem that communication between people is slow and complicated.
People who develop games are solving the problem of how to entertain people.

What I mean is that the essence of being a developer is the “ability to solve problems,” not simply knowing how to use many programming languages and tools.
Of course, in general, knowing many programming languages or being proficient with a variety of tools allows you to solve problems better.
That is why people list the programming languages and libraries they know how to use on their résumés or in their portfolios.
But you must not forget that, in the end, they are merely means of solving problems, not the essence of the work.

# What Kind of Person Is Well Suited to Being a Developer?

I can answer this with confidence.

“I don't know. You have to try it to find out.”

I have met a great many people who wanted to become developers, as well as people who were already on that path.
Conversely, I believe I have also met quite a few people who tried to become developers but failed or gave up.
And yet, I could not find any meaningful trait they had in common.
Even among people who enroll in computer science and study it, some learn quickly while others give up.

This may be a vague answer, but the only common trait I have seen among successful developers is that they like and enjoy development. However, after meeting many people who were just starting out, I have realized that you truly have to try it before you can know who will enjoy development and who will not. I have seen many people enter the field with a clear goal and passion, only to discover that it was not right for them and give up. Conversely, I have also seen many people start because school made them do it, because a friend suggested it, or because they had nothing else to do in the military, only to find that it suited them so well that they made it their career.

The IT field also advances incredibly quickly. In other fields, major trends may change once every few years or decades, but in this field, new technologies can emerge in as little as three to six months. Developers must therefore keep acquiring new technologies while also building strong foundations. If you can enjoy this kind of study, being a developer will probably suit you well.

# What Do I Need to Do to Become a Developer?

You should study the following:

- Programming languages
- Computer science
- How to collaborate
- Architecture
- Development methodologies

I will explain them one by one.

**Programming Languages**

I always use this analogy:

> “The relationship between a developer and a programming language is like the relationship between an international lawyer and English.”

Can someone who cannot speak English become an international lawyer? Probably not. Then can someone who is merely good at English become an international lawyer? They may have a better chance than someone who cannot speak English, but being good at English alone is not enough to become an international lawyer. How much of what an aspiring international lawyer needs does English account for? Probably only a very small portion.

Programming languages are the same. If you do not know a language, you cannot code at all or understand code written by others, so you cannot become a developer. But knowing only programming languages is absolutely not enough to become a developer.

Many people ask which programming language they should study.
I recommend learning the following four languages in order:

- Python
- C
- JAVA
- Java script (ECMASCript)

First, Python has simple syntax, is easy to get started with, and lets you try many interesting things. This makes it a good language for developing an interest in computers. With other languages, even setting up the initial development environment can be complicated, so you may quickly lose interest.

C is the foundation of all languages. You cannot say that you program without understanding C, especially pointers.

JAVA is a representative example of an object-oriented language. Because development is often object-oriented, you need to know JAVA. C# is not a bad choice either.

JS is used extensively on the web—especially on the frontend—which can be said to account for most development today. In terms of the convenience of setting up a development environment, no language can match JS. The reason I recommend it last, however, is that developing correctly with JS requires an understanding of frontend-backend architecture. People who approach JS only abstractly, without understanding this architecture, often become very confused. I have also seen people confuse the Node.js environment with the browser environment quite often.

**Computer Science**

Computer science is the collective term for the study of computers themselves. In general, it encompasses the subjects taught in computer science and computer engineering departments. The following are essential subjects that you must learn to become a developer.

- Data structures
- Algorithms
- Operating systems
- Computer architecture
- Data communications
- Networks
- Discrete mathematics
- Databases
- Software engineering

These can be considered essential subjects for working with computers. Of course, you can still develop software without knowing them well. But there is an enormous difference between knowing these subjects and not knowing them. In terms of efficiency alone, whether you understand and implement computer architecture, operating systems, and appropriate algorithms can make a difference in performance of hundreds of times or more. When an unexpected error occurs, computer science knowledge also allows you to resolve it much faster and more accurately. That is why most companies ask about computer science knowledge in interviews. In addition to these subjects, there are many other areas of computer science, including the following:

- Programming language theory
- Compilers (automata)
- Computer graphics
- Embedded systems
- Unix / Linux / Windows programming
- Computer security
- Linear algebra
- Artificial intelligence (machine learning)
- Hardware

The areas of computer science above are truly academic fields, and beyond them there is also a great deal to learn about programming languages themselves, as well as libraries and frameworks. Here are a few simple examples:

- When studying JAVA, you will need to understand object lifecycles and which methods and classes are Thread-Safe and which are not.
- Because JS runs on a single thread, you must understand how its asynchronous operations are carried out through the event loop architecture in order to write asynchronous programs correctly.
- If you study the React library, you must understand how the virtual DOM and state interact.

**How to Collaborate**

Development is generally carried out by several people working together. If you do not know how to collaborate well, you will often find yourself in very difficult situations. In particular, you must follow various conventions and be proficient with collaboration tools such as Git. I have covered these topics in other posts on my blog.

- [How to Collaborate Well](https://unknownpgr.com/posts/how-to-cooperate/)
- [Git Basics](https://unknownpgr.com/posts/git-github/)

**Architecture**

When developing a service, its overall structure is called its architecture. For example:

- Whether to have users download and use the program directly (e.g., Microsoft Office)
- Whether to provide the service through the web (e.g., YouTube, Naver)
- If the service is provided through the web, how the server should be structured
  - For example, whether to divide the service into small parts and develop them separately (Microservice)
  - Or whether to build it as one large service (Monolithic)
  - If the service is divided into large parts, how they will communicate with one another (API Gateway / Service Mesh)
- How developers will work and how deployment will take place (Continuous Integration, Continuous Deploy; CI/CD)
- How to guarantee high availability (Hight Availability; HA)
- How to handle disaster recovery

...and so on can all be considered part of architecture in the broad sense. It is, quite literally, the structure of a service. Developing without designing this architecture, simply making things up as you go, is like constructing a building however you please without a blueprint. At first, it may look as though you are managing to build something, but problems are bound to arise once large numbers of people begin using it.

It is also difficult to change the structure of a building once it has been built. Unlike a building, however, a well-designed IT service can have its structure changed even while it is in operation. This allows you to continue adding value by updating the service. But if the architecture is poorly designed, even a small update can cause numerous problems. The cost of updates then continues to rise, and eventually you may end up spending more on fixing errors than on development itself.

**Development Methodologies**

Development methodologies are closely related to the preceding topics of collaboration and architecture. Once you decide to develop a piece of software, it will take a long time if the project is large. The way the development proceeds is therefore extremely important. There are various development methodologies, but I will explain the two most commonly used ones here.

- One is the waterfall model. As the name suggests, the waterfall model is like a waterfall flowing from top to bottom: you decide in advance everything that will be developed and the order in which it will be developed, then follow that established procedure step by step. This development methodology is useful when the software requirements are extremely clear and detailed. For example, it can be useful when developing banking services, military programs, or aircraft autopilot software. In the waterfall model, tools such as Gantt Charts or PERT are used to determine and visualize the development sequence.

- The other is the agile methodology. Software developers have often worked hard to build programs, only to receive numerous requests to add more features or to remove or change features because they were unnecessary. From this, developers realized that “customers do not really know what they want” and that “developers do not really know what customers want either.” A methodology therefore emerged in which developers first create a service with only the most basic features (Minimum Viable Product; MVP), have customers use it, and then develop it according to their needs while gathering their feedback. This is the agile methodology.

# What Is the Difference Between Programming and Coding?

In general, programming refers to the process of writing a procedure for solving a problem. In other words, programming usually refers to a logical concept. Coding, on the other hand, generally refers to the actual process of writing code. Therefore, if you write out the process for solving a problem very clearly in Korean, it would not be coding, but it could be called programming. Conversely, if you are writing something without really knowing what it is yourself but are entering code anyway, it would not be programming, though it could be called coding.

That is why the term programmer is perfectly fine, while coder is a derogatory term for someone who cannot solve problems logically and only knows how to enter code.

# Do CMD (.bat) / HTML / CSS Count as Coding?

People often call them coding because making a point of distinguishing them is inconvenient. Generally, however, coding or programming means writing code using a programming language that meets the special condition of being “Turing complete.” HTML / CSS do not meet that condition, so they are not usually called coding or programming. Shell scripts such as CMD or batch files are Turing complete, but using simple commands such as `ipconfig` or `echo` is not usually described as coding.

> Strictly speaking, the combination of CSS and HTML is Turing complete. However, this involves using tricky techniques; in ordinary use, they are not Turing complete.

# What Is a Good Way to Become a Developer?

I believe this is the best approach. Many developers will probably agree.

1. Choose a language and study its basic syntax.
2. Make something—anything. It is even better if it is something you actually need. The following are things I have personally made, and I still find them extremely useful.
   - A journal
   - A notepad
   - A web service for storing or sharing photos
   - A blog
   - A game
3. Repeat. If possible, try collaborating with several people. Try Git, and try all sorts of other things as well.
4. As you do so, study the theoretical knowledge mentioned earlier.

I have seen quite a few people study only theory without actually writing programs. This is like saying you are studying the piano while only looking at sheet music and music theory, or reading a psychology textbook because you want to learn how to date. No matter how much theory you study, it is useless if you never actually try making something. Above all, studying theory alone is not much fun.

# In Closing

If you have any questions, feel free to email me anytime at unknownpgr@gmail.com, and I will reply!
