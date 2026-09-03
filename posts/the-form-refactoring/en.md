---
title: The-Form Refactoring
tags:
  - development
date: 2023-08-16T14:17:01.499Z
---

> This post was translated from Korean into English by AI.

I run a service called The-Form ([The-Form](https://the-form.io)). The-Form is a survey platform that we built in 2021 while participating in the Software Maestro training program.

We decided to develop The-Form and made our first commit on July 8, 2021. Two years have passed since then, and The-Form has gone through many changes. Along the way, its code grew increasingly complex and difficult to maintain. So I decided to refactor The-Form's code.

In this post, I will walk through The-Form's refactoring process and share what I learned from it.

## Why did I decide to refactor?

The-Form is a platform that is (surprisingly) used by many people, so we are always receiving requests for all kinds of features. Some days, we get several requests for new features in a single day. But when I tried to develop these features, the code had become so complex and unstable that adding anything new was extremely difficult. Of course, I could probably have forced my way through it somehow, but I felt that if something went wrong, the codebase would become completely unmanageable.

## The problems with The-Form

The biggest problem with The-Form was that it had been developed in JavaScript rather than TypeScript. At the time, we were eager to develop the product quickly, and the team members, myself included, were not familiar with TypeScript. So we decided to use JavaScript. This was not much of a problem while the product's structure was simple and we were constantly looking at the code. But once the product grew more complex and I returned to the code after not looking at it for a while, it was extremely difficult to understand.

The components also lived in separate repositories, each with its own independent deployment process. The-Form is divided into a variety of components, including the backend, frontend, authentication server, and image server. Because they lived in separate repositories, however, making any change related to deployment became a major undertaking. In particular, important values—including various secrets for GitHub Actions—were configured separately in every repository, so changing even a single setting meant touching all of them. GitHub Actions allows you to set secrets for security reasons, but does not let you view them again, so we had to maintain a separate copy of the secrets. Secrets cannot be tracked with Git either, and we occasionally lost them by mistake. (Of course, we could retrieve them again because their values can be checked in Kubernetes.)

Most importantly, the architecture was not clean. In particular, much of The-Form's important logic lived in the frontend. I not only lacked experience writing large-scale frontend code, but also had an insufficient understanding of architecture, so the business logic and UI code in the frontend ended up heavily intertwined.

## Refactoring strategy

Before beginning the refactoring, I decided to plan the strategy thoroughly and aim for incremental deployment. This was because I had tried and failed to refactor the product several times before. On those occasions, I refactored too much at once, and the product diverged so far from the previous version that migrating the data stored in the existing service became virtually impossible. On top of that, I changed the frontend and backend structures so extensively at the same time that, even if the data could have been migrated, I would effectively have been building and deploying an entirely new product. Deploying a completely new codebase would have been far too risky. In the end, I could not deploy the refactored version and had to go back to the original.

To prevent this, the first thing I did was consolidate all of The-Form's repositories into a single monorepo. Then I rebuilt the CI/CD pipeline. Consolidating repositories into a monorepo has several advantages.
- With the existing structure, it was difficult to run the development servers locally, but managing the project as a monorepo lets us run the entire service locally with a single docker-compose file.
    - The-Form is not a particularly heavy service, and our team is small, so running the entire service locally while developing is far more efficient than mocking the other services.
- Testing is convenient.
- Deployment-related work only has to be done once instead of separately for every repository.
- Ambiguous resources such as service-wide configuration values and kubernetes resources are easier to manage.

When I started this work, I also archived every existing repository. This was meant to prevent us from touching the old codebase. When I had not done so in the past, we kept changing the old codebase to fix minor bugs or improve the design. Eventually, the old codebase and the new monorepo diverged so much that migrating to the monorepo became impossible.

Finally, I made “deploying to production, no matter what” the highest-priority goal. This was to minimize the gap between the codebase and the product.

After consolidating and deploying the monorepo, I briefly paused the refactoring to address the pent-up desire among the other developers, designers, and PMs to improve the product. We improved the design, added various data analysis tools, and worked on feature enhancements. In the process, the backend architecture became more robust, the main page design was improved, and various minor bugs were resolved. With that, the minimum preparations needed to begin refactoring were complete.

Before resuming the refactoring, I had to decide whether to work on the backend or the frontend first. Refactoring both components at the same time would not have been impossible. But in that case, we would only have been able to deploy after changing a very large amount of code. In other words, incremental deployment would have been impossible. After careful consideration, I decided to refactor the frontend first, followed by the backend and the remaining components. This was because, given the nature of the survey domain, most of The-Form's business logic was in the frontend.

## Frontend Refactoring [1] - Ts-fy

Before any structural refactoring, I converted the frontend from JS to TS. I converted every file to TypeScript first, even if that meant putting `any` everywhere the types were uncertain. Along the way, I was able to convert the details, including the UI components, into robust TypeScript.

## Frontend Refactoring [2] - Architecture Design

Next, I implemented a survey structure based on clean architecture. The hardest part of this process was deciding on a programming methodology for implementing the business logic. Programming has many paradigms, including procedural, functional, and object-oriented programming. Of these, two methodologies were suitable for implementing The-Form's business logic: Object Oriented Programming (OOP) and Data Oriented Programming (DOP). But because both had advantages and disadvantages, deciding which one to choose was not easy.

**If I chose OOP:**
- Entities could be made robust by hiding their values and exposing only methods.
- However, it has the disadvantage of mixing values and methods.
- This makes it difficult to share entities between the frontend and backend.

**If I chose DOP:**
- The functions that operate on the data are cleanly separated.
- As long as the schema is well defined, entity data can easily be shared between services—that is, between the frontend and backend. This is because DOP is designed to be language-agnostic.
- However, it is difficult to enforce data hiding or prevent data from being modified directly.
- If implemented poorly, the business logic may become scattered.

This decision was difficult because The-Form's business logic spanned both the frontend and the backend.
If either the frontend or the backend had contained most of The-Form's business logic, while the other had merely served as its infrastructure or presentation layer, I would not have needed to wrestle with this question.

> In fact, the distinction between frontend and backend should not be considered at the architecture design stage in the first place. Only after designing the architecture, when implementing the concrete details, can you draw a frontend-backend boundary between components.

Of course, OOP and DOP are not conflicting methodologies; they simply take different perspectives. They can be used together harmoniously as needed. However, the advantages of each methodology should not be diluted in the process. So I took the following approach.

**From the perspective of DOP:**
- Define a schema that is separate from the data values.
- Treat data as generic objects rather than instances of classes.
- Keep data immutable.

**From the perspective of OOP:**
- When manipulating data, do not manipulate the object directly. Instead, use an instance of a class that manipulates the object.
- Within this instance, the data is not immutable.
- As needed, these instances may hold a little more state than the data itself.

Below is pseudocode implementing this approach.

```typescript
// The code below is pseudocode.
import { Survey, SurveySchema } from 'entity';

class SurveyService{
    private surveyObject: Survey;

    constructor(surveyObject: Survey){
        const newSurveyObject = deepCopyObject(surveyObject); // This keeps the data immutable outside SurveyService.
        this.surveyObject = SurveySchema.validateOrThrow(newSurveyObject);
    }

    public getSurveyObject(): Survey{
        return deepCopyObject(this.surveyObject);
    }

    public setSurveyTitle(title:string){
        this.surveyObject.title = title;
    }

    // ... omitted below
}
```

This approach offers the following advantages.
- The business logic is concentrated in a single class.
- Validation is performed when an instance is created, and after that, data is manipulated only through the class's methods. Therefore, data integrity is guaranteed (as long as there are no mistakes in the methods).
- The advantages of OOP can be fully preserved. For example, interfaces can be used to implement dependency inversion more easily.

I also wanted the entity schema to serve as the single source of truth for both the backend and frontend. To do that, dependencies on specific languages and frameworks had to be minimized. So I chose the following approach.
- Write schemas in JSON Schema.
- Use `zod` to perform validation and extract TypeScript types.
- Because JSON Schema is compatible with most languages, the same schemas can be used with an appropriate conversion library even if the backend or frontend language changes.


## Frontend Refactoring [3] - Logic Migration

Next, I migrated the existing frontend to use the newly written, clean business logic. The hardest part of this process was making it compatible with React without compromising the new code.

In React, state is managed as `state`. A value is assigned to `state` through `setState`, after which React automatically renders the UI again. In the new architecture, however, state was just an object or an instance of a class containing that object. So even when a method changed a value internally, it did not trigger a render.

I considered and tried various approaches to solve this problem.
- I considered managing state using React's `state`.
    - In that case, however, abstract parts such as entities and use cases would depend on the concrete details of the React framework. This would violate the abstraction.
    - Also, a new value in `state` cannot be referenced immediately from anywhere; it can only be referenced after the UI has rendered once. This makes it unsuitable for implementing asynchronous logic or logic unrelated to the UI.
    - Because `state`, including `setState` and `useState`, can only be used inside the UI, the business logic would become dependent on the UI.
- State could also be managed using the `Context API` or `Redux`.
    - But these are still just more convenient versions of `useState` that span multiple components.
    - Ultimately, they violate the abstraction as well.
- JavaScript's `Proxy` API can detect changes to an object.
    - This approach looked so promising that I actually implemented it.
    - But in practice, the implementation was too dependent on the environment. Some browsers did not support this API.
    - It could cause unintended mistakes because behavior was triggered by value assignment, an operation where it is generally difficult to anticipate that something else will run.
    - In some cases, a value may have changed without requiring a render. Reassigning the same value is one example. Yet even in this case, a render would occur.
- The Service could contain no logic at all for observing changes in values. Instead, I could create an Adaptor that made the Service usable in React and have it detect changes by wrapping every function in the service.
     - Architecturally, I thought this was the cleanest approach.
     - However, it created excessive code duplication because every Service function had to be wrapped in the Adaptor.
     - In particular, the Adaptor had to be modified every time a new feature was added, making maintenance difficult.

After these attempts, I ultimately decided to choose the clearest and most reliable approach. Listeners can be registered on the Service object that manages the data. When a function that changes a data value is called, it changes the value and then explicitly calls the registered listeners. I considered this the most stable and reliable approach because it does not require any particular environment. The downside is that if I implement a new feature and forget to call the listener function, no render will occur.

```typescript
// The code below is pseudocode.
class SurveyService{
    // ... omitted above
    private listeners: (()=>void)[] = [];
    public addListener(listener:()=>void){
        this.listeners.push(listener);
    }

    private notifyListeners(){
        this.listeners.forEach(listener=>listener());
    }

    public setTitle(title:string){
        this.surveyObject.title = title;
        this.notifyListeners();
    }
    // ... omitted below
}
```

## Frontend Refactoring [4] - Data Migration

Next, I migrated the data. First, I defined the operations that needed to call the backend in an interface called `Repository`, then wrote a class implementing that interface. Because the backend had not been touched at all yet, I reused the existing functions that called it. I then added code to migrate data retrieved from the backend into the new entity structure.

Shockingly, no migration was needed when sending values to the backend. This was because the backend performed almost no validation. (In fact, it had been possible to insert arbitrary JSON objects into The-Form's existing database.)

There was not much to deliberate over when writing the migration functions, because validation and parsing could be handled easily with the `zod` library. However, we had only roughly documented the structure of the existing survey data and had not expressed its schema in a structured format such as a TypeScript interface or JSON Schema. As a result, I had to inspect the database directly to understand the old survey structure. In particular, the old structure had far too many optional fields, so handling default values was also quite a challenging task.

## Frontend Refactoring [5] - Terminology

After organizing the structure, I standardized the terminology. Until then, the use of multiple terms had caused confusion. For example, to refer to a survey response, the Korean equivalents of `response`, `answer`, and `result` were used interchangeably, as were the English terms `answer`, `response`, and `result`. In particular, `response`—in either English or Korean—could refer both to an ordinary API response and to a survey response, which was extremely confusing. So I standardized the terminology as follows.

- `Survey`: A survey.
- `Question`: A question in a `Survey`. A `Survey` can contain multiple `Question`s.
- `Answer`: An answer corresponding to one `Question`.
- `Submission`: The result of a respondent answering one `Survey`. A `Submission` therefore consists of multiple `Answer`s.
- `Result`: The set of all `Submission`s for one `Survey`. A `Result` therefore consists of multiple `Submission`s.

## Backend Refactoring [1] - Architecture

Next, I refactored the backend. I consolidated the business logic that had previously lived in Express routers into a single class. I also separated the dependencies of the various features.

For example, I refactored the email-sending feature. Previously, the process of sending email was embedded directly in the business logic. The business logic invoked the EJS template engine and called the AWS SDK directly. As a result, a single route for sending email performed every step: routing, parameter parsing, template rendering, and sending. During the refactoring, however, I split this feature into two interfaces: `EmailSender` and `TemplatedEmailSender`.

- `EmailSender` has a method called `sendEmail(src, dst, title, content)`.
- `TemplatedEmailSender` has methods such as `sendGreetingEmail(...)` and `sendSurveyInfoEmail`. Each method receives the values needed to send an email as parameters and internally generates the email's subject and content.
- When created, a `TemplatedEmailSender` is injected with an `EmailSender`, which it uses to send email.

I then implemented the `SesEmailSender` and `TemplatedEmailSenderImpl` classes based on these interfaces. This separated the concerns.
- Templates can be added or updated without touching the business logic at all.
- Migrating away from AWS SES to another method of sending email is very easy.
- Everything except `SesEmailSender` can be tested locally using mocks.

Of course, I also created a `Repository` interface for database access in the backend and implemented a `RepositoryImpl` class that performed the actual access. In the process, I moved the code that migrated old survey versions from the frontend into the backend's `RepositoryImpl`. Aside from a few minor errors (which occurred because, unlike in the frontend, `Date` values were objects rather than strings in the backend), it worked without any problems. This also gave the backend type safety.

## Backend Refactoring [2] - API

After refactoring the business logic, I turned my attention to the API implementation. APIs are not only difficult to test but also make it hard to catch errors at compile time. So rather than implementing the API code directly, I used the `tsoa` library to generate the API routes and OpenAPI Schema automatically. I then used the `openapi-typescript-codegen` library in the frontend to generate the API client automatically.

Because the frontend and backend shared entities written in JSON Schema, a subset of OpenAPI, their types matched naturally. The frontend Repository went from a thick layer that called the API and performed migrations to a thin layer that only handled Request and Response objects.

As an additional benefit, input schema validation became automatic. Previously, the data values were not properly validated, so virtually any arbitrary JSON could be sent and stored. Now, however, tsoa validates the types automatically, so this problem no longer occurs.

## Backend Refactoring [3] - Testing

Next, I finally decided to introduce test scripts. Previously, there had not been many features, so we performed QA manually. But we planned to add more features and deploy more frequently, so I concluded that manual QA was no longer reasonable.

I considered Puppeteer and Playwright as testing frameworks. There are various testing tools such as Postman and JMeter, but while they are suitable for testing APIs or measuring backend latency and throughput, they have the disadvantage of being unable to test the UI. Because The-Form is a survey platform, UI testing is essential.

Of the two, I chose Playwright.
- Installation and configuration are convenient.
- It officially supports docker.
- Testing of asynchronous or delayed operations is automated.
- It provides an option to test across multiple browsers at once.

## Secret Management

I also updated the system to manage secrets using sealed-secret. Previously, secrets were injected through environment variables when GitHub Actions ran. This approach not only made secrets difficult to manage, but also made it impossible to track Kubernetes resources containing secrets in git.

Sealed-secret is a tool designed to solve these problems. It consists of a controller running in Kubernetes and a CLI. The CLI encrypts secrets with Kubernetes's public key and outputs them as a YAML file. When this YAML file is deployed to Kubernetes, the controller detects it, decrypts the secrets, and stores them in Kubernetes.

Therefore, even if a sealed-secret resource is exposed, its values cannot be determined without the private key held by the controller. At the same time, secrets can be deployed without any problems using only the sealed-secret, even without the original secrets. This made it possible to track secrets and other Kubernetes resources in git.

## CI / CD Refactoring

Along with this, I replaced the CI / CD implemented with GitHub Actions with a Node.js script that runs locally.
- Because The-Form has a small team, there is no need to use a heavy, centralized deployment environment.
- Performing builds and deployments locally maximizes cache usage, significantly reducing build times.
- It would not be difficult to move the process back to GitHub Actions or something similar if needed.

This Node.js script performs the following operations for each service.
1. Get a list of every file in the repository except `node-modules` and similar directories.
2. Sort the list.
3. Read every file in order and calculate its hash.
4. Compare the result with the hash stored in the filesystem, and perform a build if they differ.
5. Push the docker image to the registry. (The-Form uses a private repository.)
6. Run kustomize to generate a single `manifest.yaml` file that launches all of The-Form's services.
7. Deploy it with kubectl.

As a result, the entire The-Form service can be deployed using only the `manifest.yaml` file. Because this file is tracked in git, if an error is discovered and the service needs to be rolled back, the file can be taken from the most recently deployed commit and deployed again.

## Closing Thoughts

That is how I refactored The-Form. There were many difficult parts, but I learned just as much from the process. The-Form is still lacking in many ways, but I believe this refactoring will help us build a better service.
