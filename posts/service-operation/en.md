---
title: Running a Service Solo for Two Years and Ten Months
tags:
  - development
date: 2023-10-04T13:28:03.688Z
---

> This post was translated from Korean into English by AI.

I run a small service for managing real estate listings. I built it to help my mother. Although it is publicly accessible, I do not currently operate it as a business, so my mother remains its only user.

> https://real-estate.unknownpgr.com

According to the Git log, I started developing it on July 12, 2020, which means I have been operating the service for about two years and ten months. It is a small service, but I learned a great deal from running it, and I wanted to write those lessons down.

The actual development process was quite a mess (😅) and did not proceed as neatly as the account below suggests. For readability, however, I have organized it into a clean narrative that follows a typical development process.

# Getting Started

My mother began working in real estate several years ago. At the time, she had only just started and did not have many listings, so she simply recorded them in a table on paper.

As the number of listings continued to grow, it soon became difficult to manage them on paper. My father did not major in computer science, but he knew how to work with Excel using Visual Basic, so he built her a program with CRUD functionality.

This program

- could create, search, edit, and delete listings and customers.
- could also retrieve photos whose filenames included a building's name from a directory of photos and display them as a carousel.
- used a hidden sheet as its database.
- therefore allowed the data to be printed directly as a table whenever needed.

Of course, since my father had not studied programming in depth, it had a few issues.

- The database was not normalized.
- Buildings and customers actually have an n:n relationship, but because they were managed in the same sheet, only 1:1 matching was possible. As a result, registering a new customer required deleting the previous customer's information.
- All the code was contained in a single file, and there was so much duplication that it grew to more than 10,000 lines.

Even so, the program worked perfectly and made my mother's work considerably easier.

However, as she continued working, the number of required features kept growing. The program became increasingly complex until adding new functionality was no longer feasible. So I decided to rebuild it.

# Domain

Before beginning development, I first needed to acquire domain knowledge. At the time, of course, I knew nothing about concepts such as Clean Architecture, domain-driven development, entities, or use cases. From experience, however, I did know that if a programmer built a program exactly as they imagined it without detailed user requirements and domain knowledge, they would eventually have to redo everything. So I sat down with my mother, paper and pencil in hand, and asked what kind of UI and features she needed.

This process taught me about the differences between users and developers, and how to communicate with users.

First, I learned that conversations with users should focus on outcomes, not processes. Users neither can nor need to understand how a feature works internally. What matters to them is the result.

My mother had no idea whether the program ran locally or used a server-client architecture, what difference that would make when using it, or even how a shortcut to a web page on a smartphone differed from a native app. Instead of explaining web applications or native apps, however, I told her, “If we do it this way, you can only use it while connected to the internet, but your data will automatically stay in sync between your desktop and laptop.” In reality, a server-client architecture has nothing to do with synchronization. But because the user fully understood how it would behave, the specific mechanism was not particularly important.

I also learned that users do not always know exactly what they need. When gathering requirements, therefore, you need to investigate the goal they are trying to achieve rather than thinking only about the requested feature.

One requirement was to include a calculator that could convert between *pyeong* and square meters, as well as a page that could convert between road-name addresses and lot-number addresses. It would have been easy to add a tab and implement such calculators or converters. Thinking a little further, however, the user did not really want a converter or a page; she wanted to derive one piece of information from the other. So I created fields for both road-name and lot-number addresses in the building information form. Entering either type of address into either field—for example, entering a lot-number address in the road-name address field—would automatically populate both fields with the appropriately converted values once the field lost focus. Likewise, I added fields for both *pyeong* and square meters, and entering a value in one automatically filled in the other. From this experience, I learned that users are often unable to articulate their requirements precisely.

Next, I learned that users may not be able to explain exactly what they want.

There was a requirement for buildings to be listed in address order while also being listed in order of most recent modification. But addresses and modification times are both unique values—apart from exceptions such as multi-family housing—so these sorting criteria generally could not both be satisfied. I therefore conducted a little more of a user interview(?). I discovered that she wanted the buildings listed by address so that she could manage them by area. In other words, they needed to be sorted not by address, but by area (the *dong* in a lot-number address), and then by the time their information was last modified. (Later, however, multiple sorting criteria became necessary, so I eventually updated the service to let the user choose the sorting criteria herself.)

Finally, I learned that the difference in perspective between programmers and non-programmers can be greater than one might expect.

When I examined the data in the existing Excel program in preparation for migrating it, I found a great deal of duplicated data and many values in novel(?) formats. One example was a notation that used an asterisk to mark an uncertain date (such as 2023-01-1\*). It meant that the date was estimated to fall somewhere between January 10 and 20, 2023. But because this notation carried business meaning, I could not simply change it. Sometimes the data also needed to be sorted according to these values.

I later solved this problem by storing the date data in this field as a String rather than a Datetime. I restricted it so that no new formats other than the asterisk notation could be used. When sorting by this data, I used a version of the value in which the asterisk was replaced with 5, which resolved the issue.

# Development

After learning the domain, I began developing the service.

- I built the frontend using React and Chakra UI.
- I built the backend using Koa.
- I used Mongo Atlas for the database and Prisma to manage the schema and database client.
- I deployed every component except the database to a Kubernetes cluster on my personal server.

Various problems and questions arose during development as well.

- A single building had around 90 properties.
- Those properties changed very frequently.
- The corresponding UI also changed frequently.

I resolved this problem by implementing a flexible architecture.

- Because the database used MongoDB, changing the schema was easy.
- Because I used Prisma, the database schema and client types could also be checked automatically.
- For the API between the backend and frontend, I used tsoa to generate the OpenAPI specification automatically.
- I also generated the frontend API calls automatically using `openapi-generator-cli`.

The properties of a building were so numerous and complex that I spent a great deal of time wondering, “Should I just use the type Prisma automatically generates as the entity?” But doing so would make the business logic depend on the database schema, violating the dependency inversion principle. Perhaps a better ORM than Prisma might emerge later. If I depended on Prisma's types, adopting a new ORM would be difficult. In the end, I therefore created and used a separate entity. Fortunately, Prisma enforces the types of the objects it returns, and TypeScript considers objects with the same properties to be of the same type, so I was able to keep the repository structure relatively simple.

I also wondered whether the frontend and backend should share an entity or use separate entities. Fundamentally, however, the frontend and backend are not what the architecture should begin by considering. Components should first be organized by functionality, and the boundary between the frontend and backend should then be drawn according to which side each component is better suited for. The frontend and backend should not be considered first. I therefore concluded that sharing entities between the frontend and backend posed no architectural problem, and that is how I implemented it.

The frontend contains a fair amount of business logic, so I could not regard it as a simple presentation layer. I also considered whether DTOs should be created only as needed to move data across the service boundary between the frontend and backend. I concluded, however, that such concerns could be addressed by adjusting the backend-frontend boundary whenever necessary. Since I was developing the service alone and its domain had not yet stabilized, I decided to use entities directly for convenience for the time being, and to create DTOs later for optimization once the service had stabilized.

Setting up the development environment and server was also an enjoyable process. This service requires four components to function properly: a frontend server, a backend server, MongoDB, and Redis. When I ran development servers locally, however, their ports frequently conflicted with those of development servers for other services. Changing a port was not difficult, but each time I did so, I had to update externally registered development-server information for services such as Kakao Login. I later solved this cleanly by using the [http-tunneling](https://github.com/unknownpgr/http-tunnelling) tool I developed to configure the development server so it could be accessed through a domain.

# Refactoring

The preceding section makes it sound as if I designed and developed a clean architecture tailored to the domain from the very beginning. As I mentioned at the start, however, the reality involved a variety of trials and errors, followed by an enormous amount of refactoring.

#### TypeScript

First of all, I initially used JavaScript rather than TypeScript. This caused many errors due to the lack of type checking. I resolved the problem simply by refactoring the entire source code to TypeScript. As I recall, it took a month or perhaps even longer.

#### Backend Architecture

Next came architectural issues. When I first started this project, I did not know much about architecture design, so I put the business logic inside the Koa router. The database layer was not separated either, so it called Prisma directly. This kind of architecture can be useful when the business logic is small and simple, as in a notepad or diary service, but it becomes difficult to maintain as soon as the logic grows even slightly more complex. Only after reading *Clean Architecture* did I understand how to solve this problem. I resolved it by restructuring the backend around Clean Architecture. The API and much of the codebase changed so extensively that continuous deployment was impossible. Fortunately, since this service had only one user, I could stop it at a suitable time and redeploy it.

#### Frontend Architecture

There were also problems caused by poorly designed frontend architecture. The service's primary UI consists of Input Components (such as text areas and toggle buttons) that enter and display information about buildings or customers. Initially, to make these easy to change, I implemented each Input Component so that supplying the name of an appropriate entity attribute as a prop allowed it to modify that field on the entity object in the context. This implementation made UI changes easy, but it coupled the frontend logic, Input Components, and React Framework extremely tightly. Over time, adding features became exceedingly difficult. In the end, I rewrote this completely as well, cleanly separating the business logic, framework, and UI.

Unlike on the backend, where data flows along the call stack, data on the frontend does not flow along the call stack. In other words, when a function—usually an event handler—updates state (or a model), completely unrelated UI components may be updated. For that reason, frontend business logic cannot simply be written as ordinary classes; it must provide a way for React and similar tools to observe it. I tried various approaches to implement this—Proxy, frameworks (e.g. Redux / Context API), and PubSub—but nothing worked as well as a simple listener. I therefore added an addEventListener function to the class and a hook that uses it, allowing the class to work with React while preserving Clean Architecture.

#### GraphQL

I also got burned after introducing a technology indiscriminately simply because it looked promising. At one point, wanting to try something new, I adopted GraphQL without much thought. My intention was to reduce unnecessary data transfer: when implementing list UIs and similar features, retrieving entire entities sent far too much unneeded data. At first, I thought it was a clean and sophisticated technology. As I worked with it, however, I encountered a variety of problems.

- It is well suited to fetching data in precisely the desired shape, but applying complex filters or manipulating the data is quite difficult.
- The N+1 problem has a greater impact than I expected.
- The data types become so complex that it is difficult to keep the frontend structure clean.

In the end, I returned to a REST API. While carrying out this refactoring, I also realized that I had coupled GraphQL and the business logic too tightly. Afterward, as mentioned above, I separated abstractions from implementations on the frontend as well.

#### CQRS

I also ended up implementing CQRS almost by accident because I needed a complex aggregation. The task was to display customers with outstanding payments at the top of the customer list. Implementing this required

1. examining each customer's transactions,
2. determining whether any of those transactions had not been paid, and then
3. sorting the customers accordingly.

Unlike joins in an RDB, aggregation in MongoDB does not have particularly good performance. Adding sorting made the operation extremely inefficient. So I created a separate model specifically for reads. This model was a version of the customer model with the IDs of unpaid transactions added to it, and I implemented the system so that modifying a customer or a transaction would update this model as well. In this case, only one customer is modified at a time and no sorting is performed, so the time complexity does not increase. During queries, however, an index can be used, resulting in a major performance improvement. I only later learned that separating out a read model in this way is a form of CQRS.

# Deployment

Deployment was not easy either. One fortunate accident was that I had been too lazy to split the repositories, so I developed the frontend and backend together in a single repository. I only later learned that this was an established approach called a monorepo.

Even so, creating a deployment process was more difficult than I expected. At first, I tried various CI/CD tools such as ArgoCD and GitHub Actions. With ArgoCD, however, image builds and deployment were separated, which complicated the deployment process. Handling everything in GitHub Actions was a reasonably good approach, but it was too slow and made secrets difficult to manage.

The biggest problem of all was the number of things that needed to be managed. Every approach I tried worked perfectly, but the problem was that I was the only person developing this project. The more management points there were, the harder it became to manage. For example, if I were using ECR, GitHub Actions, and ArgoCD, adding a service or changing an image name would require changes in four different places, including the source code.

I came to realize that all the impressive CI/CD stacks mentioned above were designed with teams of many developers in mind, and that adopting stacks like those for a small project was little more than showing off. So I handled both builds and deployment with simple shell scripts. Builds are performed locally using docker buildx. If the image builds successfully, kustomize generates a single manifest file appropriate for the deployment environment (production/staging). All image names in this file are expressed as environment variables and replaced using envsubst. The resulting manifest file is tracked in Git. Initially, I did not know how to manage secrets and did not track the file for security reasons, but after introducing Sealed Secret, I made it possible to track it. Deployment is then performed locally using kubectl.

This approach is extremely efficient. When I previously used GitHub Actions, deployment took three to five minutes, but I was able to reduce it to less than one minute. Previously, a considerable amount of time was spent starting a VM for the build after a push, performing a Git Clone, and loading the Docker cache from the registry. With this approach, however, there is no need to configure a build environment or perform a Git Clone. Since the Docker cache uses the local cache, the cache loading time is effectively negligible. As a result, when there are no changes, a process that took at least 30 seconds under the previous deployment workflow now takes 0.9 seconds.

# Version Control

For version control, I also adopted a new, simplified approach instead of GitFlow.

- Branches are divided into main and feature branches.
- When a feature needs to be developed, a feature branch is created from main.
- After feature development is complete, it is tested and merged into main.

From there, the deployment process proceeds as follows.

- Perform the deployment.
- This generates a `manifest.yaml` file containing all information about the currently deployed service.
- Commit it to Git.
- If this version is stable, tag it as stable.

A major advantage of this version-control approach is that rollback is simple when an error occurs, because the Kubernetes resources themselves are managed in a single file tracked by Git. If a problem occurs, I only need to return to that commit and deploy its manifest.yaml file.

# Conclusion

Throughout this project, I encountered a variety of problems and learned a great deal by solving them. I believe this kind of experience is a valuable asset that can only be gained by operating a product oneself. I also believe the lessons I learned from this project will be of great help in future projects.
