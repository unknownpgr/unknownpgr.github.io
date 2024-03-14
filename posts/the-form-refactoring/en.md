---
title: The-Form Refactoring
tags:
  - development
date: 2023-08-16T14:17:01.499Z
---

> Translated with the help of ChatGPT and Google Translator

I am running a service called [The-Form](https://the-form.io). The Form is a survey platform created while training for the 2021 Software Maestro Training Course.

I decided to develop The Form and made my first commit on July 8, 2021. Two years have passed since then, and many changes have occurred in The Form. Meanwhile, TheForm’s code became increasingly complex and difficult to maintain. So I decided to refactor TheForm’s code.

In this article, I will introduce The Form’s refactoring process and share what I felt while refactoring.

## Why did you refactor?

The Form is (surprisingly) a platform used by many users, and we always receive requests for various features. We sometimes receive dozens of requests for new features a day. However, as we tried to develop these features, the code became so complex and unstable that it became very difficult to add new features. Of course, there's nothing you can't do if you try to develop it somehow, but if something goes wrong, it seems like you won't be able to fix it.

## Problems with The Form

The biggest problem with The Form is that it was developed in JavaScript, not TypeScript. At the time, there was a desire to develop products quickly, and the team members, including myself, were not familiar with TypeScript. So I decided to use JavaScript. When the product structure was simple and I was always looking at the code, there was no problem, but when the product became complicated and I stopped looking at the code for a while and then looked at the code again, it was very difficult to interpret.

And the components existed as separate repositories and each had an independent deployment process. The Form is divided into various components such as backend, frontend, authentication server, and image server. However, since they exist in separate repositories, changing distribution-related tasks has become too much of a task. In particular, important values, including various secrets, were set in GitHub Action for each repository, so even if you wanted to change one setting, you had to touch all settings. Also, in GitHub Action, it is possible to set a secret for security reasons, but it is impossible to recheck the secret, so the secret must be kept separately. In particular, secrets cannot be tracked using Git, so there were times when they were accidentally lost. (Of course, the value can be checked on Kubernetes, so you can get it back.)

Above all, the architecture was not clean. In particular, The Form contains a lot of important logic in the front end. However, not only did I lack experience writing large-scale front-end code, but I also lacked understanding of architecture, so the business logic and UI code in the front-end ended up being mixed up a lot.

## Refactoring strategy

Before refactoring, we decided to thoroughly plan the refactoring strategy and begin refactoring with the goal of gradual deployment. This is because I have tried refactoring before and failed several times. At that time, so much refactoring was done at once that the product changed so much from before that it became virtually impossible to port data stored in existing services. In addition, because the structures of the front-end and back-end were changed so much at once, even if data portability was possible, a new product had to be created and distributed. Deploying a completely new codebase is too risky a decision. So in the end, we were unable to deploy the refactored version and returned to the original version.

To achieve this, the first thing we did was put all of The Form’s repositories into one monorepo. And we rebuilt our CI/CD pipeline. There are several advantages to combining repositories into a monorepo.

- In the existing structure, it is difficult to launch the development server locally, but if you manage the project with a monorepo, you can launch the entire service locally as a single docker-compose file.
  - The Form is not a very heavy service and the team size is small, so it is much more efficient to develop the entire service locally rather than mocking other services.
- Testing is convenient.
- Deployment-related tasks only need to be done once, rather than for each repository.
- You can easily manage ambiguous data such as common service settings or Kubernetes resources.

And when we started this work, we archived all existing repositories. This is to force the existing code base not to be touched. If I hadn't done so before, I kept touching the existing code base for minor error corrections or design improvements, and then the differences between the existing code base and the new monorepo grew so much that it eventually became impossible to migrate to the monorepo.

Lastly, we made ‘production deployment anyway’ our top priority. This is to minimize the differences between the code base and the product.

After integrating and distributing the monorepo, we stopped refactoring for a while to reflect the suppressed desires of other developers, designers, and PMs to improve the product, and proceeded to improve the design, add various data analysis tools, and improve functions. At the same time, the backend architecture was made more robust, the design of the main page was improved, and various minor errors were resolved. This gives us at least some preparation to start refactoring.

Before starting refactoring again, we had to decide which component to work on first: backend or frontend. It's not impossible to refactor both components simultaneously. However, in that case, deployment is possible only after a very large amount of code has been modified. This means that gradual deployment is not possible. So, after much thought, I decided to refactor the front-end first and then the rest of the components, including the back-end. This is because most of The Form’s business logic in the domain of surveys is located on the front end.

## Front-end refactoring [1] - Ts-fy

Before any structural refactoring, we refactored the frontend from JS to TS. First, I converted all files to TypeScript, even if I had to put `any` in all the uncertain parts. At the same time, we were able to convert all the details, including UI components, into stable TypeScript.

## Front-end refactoring [2] - Architecture design

Afterwards, we implemented a survey structure based on clean architecture. The most difficult part of this process was deciding on a programming methodology to implement the business logic. There are various paradigms in programming, including procedure-oriented, functional, and object-oriented. Among them, two methodologies are suitable for implementing the business logic of The Form: Object Oriented Programming (OOP) and Data Oriented Programming (DOP). However, both methodologies have pros and cons, so it was not easy to decide which method to choose.

**If you choose OOP:**

- You can make your entities stable by hiding the values and exposing only the methods.
- However, it has the disadvantage of mixing values and methods.
- So it is difficult to share entities between frontend and backend.

**If you choose DOP:**

- The functions that handle the data are well separated.
- If the schema is well defined, it has the advantage of being easy to share entity data between services, that is, between the front end and the back end. This is because DOP is a methodology designed to be language independent.
- However, there is also a disadvantage that it is difficult to hide the data or force it not to be modified directly.
- If implemented incorrectly, business logic may become distributed.

The reason this decision is difficult is because The Form’s business logic spans both the front-end and back-end.
If The Form's front-end or back-end took up most of the business logic and the other was only the other's infrastructure or expression layer, there would be no need to worry about this.

> In fact, the front-end and back-end perspectives should not be considered at the architecture design stage in the first place. After designing the architecture first, when implementing specific parts, the boundary between front and back can only be drawn between components.

Of course, OOP and DOP are not conflicting methodologies, just different perspectives. Depending on your needs, both methodologies can be used in harmony. However, the advantages of each methodology should not be diluted in the process. So I approached it in the following way.

**From DOP's perspective:**

- Define a schema that is separated from the data values.
- Treat data as general-purpose objects rather than instances of classes.
- Data remains immutable.

**From an OOP perspective:**

- When manipulating data, we do not manipulate objects directly, but instead use instances of classes that manipulate objects.
- Data is not immutable within this instance.
- These instances can have a little more state than the data itself, depending on your needs.

Below is the pseudocode implementing this.

```typescript
// The code below is pseduo code.
import { Survey, SurveySchema } from "entity";

class SurveyService {
  private surveyObject: Survey;

  constructor(surveyObject: Survey) {
    const newSurveyObject = deepCopyObject(surveyObject); // Therefore, outside of SurveyService the data is immutable.
    this.surveyObject = SurveySchema.validateOrThrow(newSurveyObject);
  }

  public getSurveyObject(): Survey {
    return deepCopyObject(this.surveyObject);
  }

  public setSurveyTitle(title: string) {
    this.surveyObject.title = title;
  }

  // ... lower
}
```

The advantages you can gain from these methods are:

- Business logic is concentrated in one class.
- Validation is performed when an instance is created, and thereafter, data is manipulated using only class methods. Therefore, data integrity is guaranteed (as long as no mistakes are made in the method).
- You can utilize the advantages of OOP as is. For example, dependency inversion can be easily implemented using interfaces, etc.

Also, when I wrote the entity schema, I wanted it to be a single source of truth for the backend and frontend. This requires minimizing dependency on languages and frameworks. So I chose the method below.

- The schema is written in JSON-Schema.
- Use `zod` to perform validation and extract TypeScript types.
- JSON-Schema is compatible with most languages, so even if the backend or frontend language changes, you can use the schema as is by selecting an appropriate conversion library.

## Front-end refactoring [3] - Logic migration

We then migrated the existing frontend to use the newly created, clean business logic. The most difficult part of this process was making the newly written code compatible with React without breaking it.

In React, state is managed with `state`. The value of `state` is set by `setState` and then rendering is automatically performed again by React. However, in the newly created architecture, the state is just an object or an instance of a class containing it. So even if you change the value internally using a method, no rendering will occur.

To solve this problem, I thought about and tried many different things.

- I considered using React’s `state` to manage state.
  - However, in that case, abstract parts such as entities or use cases depend on the concrete part of the React framework. Therefore, this violates abstraction.
  - Also, `state` cannot refer to new values anywhere immediately, but only after the UI is rendered once. Therefore, it is not suitable for implementing asynchronous or UI-unrelated logic.
  - `state`, including `setState` and `useState`, can only be used inside the UI, making business logic dependent on the UI.
- You can also manage state using `Context API` or `Redux`.
  - However, this is also just a `useState` that is easier to use and spans multiple components.
  - As a result, it violates abstraction.
- Using Javascript's `Proxy` API, you can detect changes in objects.
  - This method seemed so good that I actually tried implementing it.
  - However, in practice, this implementation is too dependent on the environment. Some browsers may not support this API.
  - This can cause unintentional mistakes because actions usually occur in value assignments where it is difficult to predict which action will be executed.
  - In some cases, the value has changed but you don't want it to be rendered. This is the case when reassigning the same value. However, rendering still occurs in this case.
- The service does not include any logic to observe changes in values. Instead, we create an Adapter that allows the service to be used in React, and implement it to detect changes by wrapping all the functions of the service there. - I thought it was the cleanest method from an architectural perspective. - However, this method requires wrapping all functions of the Service in the Adapter, resulting in excessive code duplication. - This makes maintenance difficult, especially since the Adapter must be modified every time a new feature is added.

After these attempts, we ultimately decided to choose the most certain and stable method. A listener can be registered in the Service object that manages data, and when a function that changes the value of the data is called, the explicitly registered listener is called after changing the value. This method was thought to be the most stable and reliable method as it does not require any special environment. This method instead accidentally implements a new feature and doesn't call the listener function, which means no rendering will occur.

```typescript
// The code below is pseduo code.
class SurveyService {
  // ... schematic
  private listeners: (() => void)[] = [];
  public addListener(listener: () => void) {
    this.listeners.push(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  public setTitle(title: string) {
    this.surveyObject.title = title;
    this.notifyListeners();
  }
  // ... lower
}
```

## Front-end refactoring [4] - Data migration

Afterwards, the data was migrated. First, I defined the tasks that need to call the backend in an interface called `Repository` and wrote a class that implements this interface. At this time, the backend had not been touched at all, so the functions that had previously called the backend were used as is. I also added code to migrate the data retrieved from the backend to the new entity structure.

This time, shockingly, no migration was needed to push values into the backend. This is because there is very little value checking done on the backend. (So in fact, it was possible to insert arbitrary JSON objects into the existing The Form database.)

There wasn't much to worry about when creating the migration function. This is because value validation and parsing were easily solved through the `zod` library. However, because the existing survey data structure was only roughly written down and the schema was not created as structural data such as Typescript interface or JSON-Schema, I had to check the database directly to understand the existing survey structure. In particular, there were so many optimal fields that processing default values was quite a difficult task.

## Front-end refactoring [5] - Glossary of terms

After organizing the structure, I made sure to organize the terminology. This is because there was confusion due to the use of multiple terms before. For example, to represent responses to a survey, terms such as `response`, `answer`, and `result` in Korean and `answer`, `response`, and `result` in English were used interchangeably. In particular, `response`, or `response`, was very confusing because it could refer to either a general API response or a survey answer. So, we have organized the terms as follows.

- `Survey`: Survey
- `Question`: Question in the survey. `Survey` can have multiple `Questions`.
- `Answer`: An answer corresponding to one `Question`.
- `Submission`: The result of the respondent answering one `Survey`. Therefore, `Submission` consists of several `Answer`.
- `Result`: The set of all `Submission`s for one `Survey`. Therefore, `Result` consists of multiple `Submission`.

## Backend refactoring [1] - Architecture

Afterwards, we proceeded with backend refactoring. The business logic previously contained in Express Router has been gathered into a single class. And we separated the dependencies of various functions.

For example, we refactored the ability to send emails. Previously, the process of sending mail was directly included in the business logic. We ran the EJS template engine in our business logic and called the AWS SDK directly. Therefore, one route to send an email performed all processes from routing, parameter parsing, template rendering, and sending. However, during refactoring, we separated this function into two interfaces: `EmailSender` and `TemplatedEmailSender`.

- `EmailSender` has a method called `sendEmail(src, dst, title, content)`.
- `TemplatedEmailSender` has methods such as `sendGreetingEmail(...)` and `sendSurveyInfoEmail`. Each method receives the values required when sending an email as parameters and internally creates the email subject and content.
- `TemplatedEmailSender` is injected with `EmailSender` when created and used to send mail.

Afterwards, we actually implemented the `SesEmailSender` and `TemplatedEmailSenderImpl` classes that inherit this. From this came a separation of concerns.

- Templates can be added or updated without touching any business logic.
- If you want to send it another way instead of SES, you can also port it very easily.
- Except for `SesEmailSender`, all tests can be tested locally based on mocking.

Of course, we created a `Repository` interface for database access on the backend and implemented a `RepositoryImpl` class that actually accesses it. At the same time, we moved the code to migrate the old version of the survey on the front to the backend `RepositoryImpl`. Apart from a few minor errors (due to the fact that the `Date` type value was an object rather than a string in the backend, unlike in the frontend), it worked without any problems. This ensures type safety in the backend as well.

## Backend refactoring [2] - API

After refactoring the business logic, we focused on implementing the API. This is because APIs are not only difficult to test, but also difficult to catch errors at compile time. So, instead of implementing the API code directly, we used the `tsoa` library to automatically generate the API route and OpenAPI Schema. Afterwards, we implemented the frontend to automatically generate an API client using the `openapi-typescript-codegen` library.

Because the front and back share an entity written in JSON Schema, a subset of OpenAPI, the types naturally matched. The front Repository has changed from a thick layer that calls APIs and performs migration to a thin layer that only handles Request and Response objects.

Additionally, as an additional benefit, schema verification of input data is now performed automatically. In the past, because data values were not properly validated, it was actually possible to save even if arbitrary JSON was sent. However, this problem does not occur now because tsoa automatically performs type verification.

## Backend refactoring [3] - Testing

Afterwards, we finally decided to introduce a test script. Previously, we conducted QA manually because there were not many features, but we decided that manual QA was not reasonable as we plan to add more features in the future and distribution will become more frequent.

Puppeteer and Playwright were considered as testing frameworks. There are various test tools such as Postman and Jmeter, but although they are suitable for measuring API or backend latency / throughput, they have the disadvantage of not being able to test the UI. Because The Form is a survey platform, UI testing is essential.

Of these two, I chose Playwright.

- Convenient installation and configuration.
- Officially supports docker.
- Testing for tasks that cause asynchronous / delay is automated.
- Provides the option to test in multiple browsers at once.

## Secret Management

And we updated it to manage secrets based on sealed-secret. Previously, when running a GitHub Action, a secret was injected through an environment variable. This method had the problem of not only making it difficult to manage secrets, but also making it impossible to track the Kubernetes resource containing the secret in git.

Sealed-secret is a tool to solve this problem. Sealed-secret consists of a controller and CLI floating on Kubernetes. CLI encrypts the secret with Kubernetes' public key and outputs it as a YAML file. When you deploy this YAML file to Kubernetes, the controller detects it, decrypts the secret, and stores it in Kubernetes.

Therefore, even if the sealed-secret resource is exposed, its value cannot be known without the private key held by the controller. On the other hand, even if you only have a sealed-secret without the original secret, you can distribute the secret without any problem. This makes it possible to track secrets and other Kubernetes resources to git.

## CI/CD Refactoring

At the same time, CI/CD implemented as GitHub Action was updated to a Node.js script that runs locally.

- Because The Form has a small team, there is no need to use a heavy, centralized distribution environment.
- Performing builds and deployments locally significantly reduces build times by maximizing cache usage.
- It is not difficult to move it back to GitHub Action, etc., if necessary.

This Node.js script executes the following actions for each service.

1. Get a list of all files in the repository excluding `node-modules` etc.
2. Sort them.
3. Read all files in order and calculate their hashes.
4. Compare with the hash stored in the file system, and if different, perform a build.
5. Push the Docker image to the registry. (The Form uses a private repository.)
6. Run kustomize to create a single `manifest.yaml` file that launches all TheForm services.
7. Deploy this with kubectl.

From this, you can now deploy the entire The Form service by simply having the corresponding `manifest.yaml` file. This file is tracked in git, so if an error is found and the service needs to be rolled back, you can retrieve the file from the most recently deployed commit and deploy it.

## In conclusion

I refactored The Form like this. There were many difficult parts, but there were also many things to learn. Although The Form is still a very lacking service, we believe that we will be able to create a better service through this refactoring.
