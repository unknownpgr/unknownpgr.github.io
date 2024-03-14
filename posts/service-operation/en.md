---
title: 2 years and 10 months of one-person service operation
tags:
  - development
date: 2023-10-04T13:28:03.688Z
---

> Translated with the help of ChatGPT and Google Translator

I run a small service that manages real estate listings. This service was created to help my mother, and although it is open to the public, it is not currently operated as a business, so only my mother is still using it.

> https://real-estate.unknownpgr.com

Checking the Git log, development began on July 12, 2020, and the service has been in operation for approximately 2 years and 10 months. It's a small service, but I've learned a lot while running this service, so I'd like to summarize it.

The actual service development process was quite messy (😅) and did not proceed as neatly as the article below. However, for readability, I have organized it neatly according to the general development process.

# start

My mother started working in real estate several years ago. At that time, she had just started working and she didn't have many properties for sale, so she simply recorded the properties on a paper table.

As the number of properties for sale increased, it soon became difficult to manage them on paper. Although her father was not a computer major, he knew how to use Excel using Visual Basic, and he created a program with CRUD functionality for her.

This program

- It had the ability to create, search, edit, and delete properties and customers.
- There was also a feature that retrieved photos containing the names of buildings from a photo directory and displayed them in a carousel.
- Used hidden sheet as database.
- So, when needed, the data could be printed directly into a table and used.

Of course, there were some problems as my father did not study programming in depth.

- The database was not normalized.
- Buildings and customers actually have an n:n relationship, but they are managed on the same sheet, so only 1:1 matching is possible. So, to register a new customer, I had to delete the old customer information.
- All the code was gathered in one file and there was a lot of code duplication, so the code length exceeded 10,000 lines.

Nevertheless, the program worked perfectly and my mother found it very easy to work with.

But as she continued to work, her needs continued to increase. Programs became increasingly complex, making it no longer possible to add new features. So I decided to recreate this program.

# domain

First, we had to obtain domain knowledge prior to development. Of course, at that time, I had no idea about clean architecture, domain-driven development, entities, or use cases. However, from my own experience, I knew that if a programmer creates a program as he had imagined without domain knowledge and detailed user requirements, everything will have to be modified in the end. So, I took her mother, got some paper and pencil, and asked her what UI and what features she needed.

In this process, I was able to learn the difference between users and developers, and how to communicate with users.

First, I learned that when talking to users, you should deal with the results, not the process. Users cannot, and do not need to, understand how a feature works internally. What matters to users is the results.

My mother had no idea whether a program ran locally or server-client made any difference in usability, and she didn't know the difference between a web page shortcut and a native app on a smartphone. But instead of explaining web applications or native apps, she explained, 'This way you have to have an internet connection to use it, but it will automatically synchronize between your computer and your laptop.' In reality, the server-client architecture has nothing to do with synchronization. However, the specifics of how it worked didn't really matter since the user completely understood how it worked.

And I learned that users don't really know what they need, so when receiving requests from users, you need to look into the purpose you're trying to achieve and don't just think about functionality.

Among the requests was to include a calculator that could convert 'pyeong' and 'square meter' and a conversion page that could convert road name addresses and street number addresses. Implementing such a calculator or converter is simple by adding a tab. However, if you think about it a little more, ultimately what the user wants is not a converter or a page, but to get one of the two pieces of information from the other. So, create both a road name address and a street address entry field in the building information field, but if you enter any address in either page (for example, entering a street number address in the road name address field), it will automatically be converted appropriately when the focus is out. We implemented it so that both values are entered. For the square footage, we created both a square meter input box and a square meter input box and implemented it so that when a value is entered in one, the other is automatically filled. From this experience, we learned that users are often unable to accurately describe their requirements.

Next, we learned that users may not be able to describe exactly what they want.

We would like the buildings to be listed in address order, but there was a request to list them in the order they were most recently modified. However, because both address and modification time are unique values, this sorting criterion was generally unsatisfactory (although there are exceptions for multi-family homes). So, we conducted more user interviews(?). As a result, we learned that the reason we wanted them listed in address order was to manage buildings by region. In other words, all you had to do was sort by region (from street address to dong) rather than address, and then sort by information modification time. (However, later, multiple sorting criteria became necessary, and the sorting criteria were eventually updated to allow users to select their own.)

Lastly, I learned that the difference in perspectives between programmers and non-programmers can be bigger than I thought.

When I checked the data to transfer it from the existing Excel program, there was a lot of duplicate data and many values were in a novel(?) format. For example, there was a way to represent uncertain dates with \* (like 2023-01-1\*). This means that any date is estimated to be between January 10 and 20, 2023. However, this notation had business implications, so it could not be changed without permission. And sometimes we needed to sort the data based on this value.

To resolve this issue later, I decided to store the date data in this part in String format instead of Datetime. Instead, we restricted the use of new formats other than this asterisk notation. And when sorting based on this data, we solved the problem by replacing the asterisk with 5.

# Development

After acquiring the domain, we started developing the service.

- Created a frontend using React and Chakra UI.
- Built the backend using Koa.
- We used Mongo Atlas as the database and managed the schema and database client using Prisma.
- All components except DB were deployed on the Kubernetes cluster on my personal server.

During development, various problems and concerns arose.

- One building had about 90 properties.
- Properties change very often.
- And the UI changes were frequent accordingly.

This problem was solved by implementing a flexible architecture.

- Because the database was composed of MongoDB, it was easy to change the schema.
- Because Prisma was used, database schema and client type checking could also be performed automatically.
- The API between back-front automatically generated OpenAPI specifications using tsoa.
- Front-end API calls were also automatically generated using `openapi-generator-cli`.

Because the properties of the building are so numerous and complex, I thought, 'Should I just use the type automatically generated by Prisma as the entity?' I really thought about this a lot. But then your business logic depends on the database schema, which violates the dependency inversion principle. Maybe a better ORM than Prisma will come out later. If you depend on Prisma's type, it will be difficult to introduce a new ORM. So in the end, I created a separate entity and used it. Fortunately, Prisma enforces the type of the returned object, and Typescript considers it to be the same type if it has the same properties, so we were able to create a repository structure that was not very complicated.

I was also concerned about whether I should share the entity between the front and back, or create and use a separate entity. But fundamentally, the front and back are not issues to worry about in the architecture in the first place. After configuring components according to function, the boundary between front and back should be drawn according to whether the component is suitable for the front or back, and the front and back should not be considered first. So, we decided that there was no architectural problem in sharing entities between the front and back, and we actually implemented it this way.

The frontend contains quite a bit of business logic. So we couldn't think of it as just an expression layer. I also thought about whether DTOs should only be created as needed to allow data to travel between the front and back service boundaries. However, we decided that this could be resolved by modifying the back-front boundary as needed. So, as it is a one-person development and the service domain has not yet been stabilized, I decided to use the entity as is for convenience now and create a DTO for optimization later when the service is stabilized.

Building a development environment and server is also a fun process. This service requires four components: front server, back server, MongoDB, and Redis to operate properly. However, when running a development server locally, there were frequent conflicts with the ports of other services' development servers. It is not difficult to change the port, but each time, I had to update the externally registered development server information for Kakao login, etc. This problem was solved neatly by configuring the development server to access the domain using the [http-tunneling](https://github.com/unknownpgr/http-tunnelling) tool developed later.

# Refactoring

In the section above, it was written as if a clean architecture was designed and developed for the domain from the beginning. However, as I mentioned at the beginning, we actually went through a lot of trial and error and a lot of refactoring.

#### TypeScript

First of all, at first we didn't use TypeScript, but JavaScript. Therefore, there were many errors that occurred due to lack of type checking. This problem was solved by simply refactoring the entire source code into TypeScript. I remember it took a month or more.

#### Backend architecture

Afterwards, architectural issues arose. When I first started this project, I didn't know much about architecture design, so I wrote the business logic in the koa router. Of course, the database layer was also not separated, so I called primsa directly. This architecture is useful when the business logic is small and simple, such as a notepad or diary service, but maintenance becomes difficult if the logic becomes even a little complex. Only after reading the Clean Architecture book did I know how to solve this problem, and I solved it by modifying the backend to be based on Clean Architecture. The code base, including the API, had changed significantly, making continuous deployment impossible, but fortunately, since this service only had one user, we were able to stop and redeploy the service at an appropriate time.

#### Front-end architecture

There were also problems arising from poor design of the front-end architecture. The main UI of the service is the Input Component (e.g. Text area, toggle button, etc.) that inputs/displays building or customer information. Initially, to make the change easy, we implemented it so that fields of the entity object in the context within the Input Component could be modified by supplying the attribute name of the appropriate entity to the Input Component as a prop. This implementation made UI changes easy, but also tightly coupled the front-end logic, Input Component, and React Framework. So, as time went by, adding features became very difficult. Ultimately, this too was completely rewritten to cleanly separate business logic, framework, and UI.

However, unlike the backend, where data flows along the call stack, in the frontend, data does not flow along the call stack. This means that if the state (or model) is updated in a function (usually an event handler), other UI components that are completely unrelated to that function may be updated. Therefore, in the front end, business logic should not be written as a simple class, but a way to observe it should be provided in React, etc. To implement this, I tried various methods - Proxy, Frameworks (e.g. Redux / Context API), PubSub - but there was nothing like a simple listener. So I created an addEventListener function in the class and added a hook that uses this function to maintain a clean architecture. I implemented it so that it can be used in React.

#### GraphQL

There have been times when I recklessly adopted technology that seemed good and ended up in failure. I've applied GraphQL before to try out a new technology. When implementing list UI, etc., bringing in the entire entity would result in too much unnecessary data being transmitted, so the intention was to reduce this. When I introduced it, I thought it was a neat and sophisticated technology. However, we encountered various problems while working.

- It's great for getting the data right, but it's quite difficult to apply complex filters or manipulate the data.
- The N+1 problem is bigger than you think.
- The data type is so complex that it is difficult to get a clean structure on the front page.

So I ended up going back to the REST API. While performing this refactoring, we also realized that we had coupled GraphQL and business logic too strongly, and later, as mentioned earlier, we separated implementation and abstraction on the front end as well.

#### CQRS

Because complex aggregation was needed, we implemented CQRS without realizing it. The task was to expose customers who had not made payments to the top of the customer list, but in order to implement this,

1. Among the transactions each customer has
2. After finding out whether there is a transaction for which payment has not been made
3. Sorting must be done in this order:

Aggregation in MongoDB does not perform as well as Join in RDB. However, when sorting was performed, it became a very inefficient operation. So, I created a separate model for Read. This model is a model that adds the IDs of transactions for which payment has not been made to the customer model, and is implemented so that when a customer or transaction is modified, this model is also modified. In this case, time complexity does not increase because only one customer is modified at a time and no sorting is performed, but performance is greatly improved because an index can be used when searching. I later found out that this is a type of CQRS with a separate Read model.

# distribution

Deployment was also no easy task. The good news is that since it was cumbersome to separate the repositories, we developed the front and back into one repository. I later found out that it was a method called monorepo.

Nonetheless, writing the deployment process was more difficult than expected. At first, I used various CI/CD tools such as ArgoCD and GitHub Actions. However, using ArgoCD separated image build and deployment, making the deployment process complicated. Handling everything in GitHub Actions was a nice solution, but it was slow and difficult to manage secrets.

The biggest problem was the management point. All of the previous methods I tried worked perfectly, but the problem was that I was the only one developing this project. This is because the more management points there are, the more difficult it becomes to manage them. For example, assuming you use ECR, GitHub Actions, and ArgoCD, there are four parts you need to touch, including the source code, to add a service or change an image name.

At the same time, I realized that all of the wonderful CI/CD stacks mentioned above were designed for cases where many people gathered together to develop, and that introducing such stacks in small projects was just a facade. So, we solved both the build and deployment by introducing a simple shell script. The build is performed locally using docker buildx, and once the image build is successful, kustomize is used to generate a single manifest file specific to the deployment environment (production/staging). In this file, all image names are in environment variable format and are replaced using envsubst. The manifest file created this way is tracked in git. Initially, we did not track the secret for security reasons because we did not know how to manage it, but later we introduced Sealed Secret to make it trackable. You then perform the deployment locally using kubectl.

This method is extremely efficient. Previously, when we used GitHub Actions, deployment times would take 3 to 5 minutes, but we were able to shorten this to less than 1 minute. Basically, previously, the process of starting a VM for a post-push build, performing a Git clone, and loading the Docker cache from the registry took quite a bit of time. However, by introducing this method, build environment configuration or Git Clone became unnecessary. Docker cache uses a local cache, so cache load time is virtually negligible. So, if no changes were made, the traditional deployment process, which took at least 30 seconds, was reduced to 0.9 seconds.

# Configuration management

Configuration management also introduced a new, simplified method instead of GitFlow.

- The branch is divided into main and features.
- When feature development is necessary, the feature is created in main.
- After feature development is completed, tests are performed and features are merged into main.

From this, the deployment process goes like this:

- Perform distribution.
- Then, a `manifest.yaml` file containing all information about the currently deployed service is created.
- Commit this to Git.
- If this version is stable, tag it as stable.

The great advantage of this configuration management method is that rollback is simple when an error occurs because the kubernetes resource itself is managed in a single file tracked by Git. Because if something goes wrong, all you have to do is go back to that commit and deploy the manifest.yaml file.

# conclusion

While working on this project, I encountered various problems and learned a lot while solving them. I believe that this experience is a valuable asset that can only be gained by running a product on your own. And through this project I think what I learned will be of great help to my next project.
