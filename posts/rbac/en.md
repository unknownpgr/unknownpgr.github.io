---
title: Implementing RBAC
tags:
  - development
date: 2021-12-02T17:45:23.057Z
---

> This post was translated from Korean into English by AI.

> This post was written with reference to [Role-Based Access Control](https://csrc.nist.gov/CSRC/media/Projects/Role-Based-Access-Control/documents/ferraiolo-kuhn-92.pdf) (1992).

I am currently working on improving the website of a club I belong to. The existing website was based on XE and written in PHP. Version 1 of XE was released in 1999, and maintenance ended in 2009. In other words, it is an incredibly old system.

Unable to stand the million warnings that appeared whenever I opened the admin page, I decided to migrate the website to a Node.js-based system (after nearly 20 years). That was when I ran into the problem of implementing an authorization system. If the club website had been nothing more than a simple message board, I would not have given it so much thought. But it includes a great many features, including competition registration. I wanted to develop an authorization system that could manage all of these features cleanly while remaining a separate module, free of dependencies on other systems such as the user system or message board system.

Through my usual work with AWS and Kubernetes, however, I knew that these systems use RBAC, and therefore that RBAC is suitable for complex systems like AWS. So I decided to study it and apply it to the club website. Once I actually started implementing it, I found the process of implementing RBAC more enjoyable than I had expected, so I wanted to document what I learned and how I implemented it.

# What Is Role-Based Access Control (RBAC)?

RBAC is a method of access control proposed by David F. Ferraiolo and D. Richard Kuhn in their 1992 paper [Role-Based Access Control](https://csrc.nist.gov/CSRC/media/Projects/Role-Based-Access-Control/documents/ferraiolo-kuhn-92.pdf). Before then, Mandatory Access Control (MAC) and Discretionary Access Control (DAC) were generally regarded as access-control systems suitable for military or government use. The paper, however, argues that DAC lacks a clear theoretical foundation and is ill-suited to commercial or government organizations, and proposes Role-Based Access Control (RBAC) as a new, non-discretionary approach.

To understand RBAC, then, we need to examine the problems with the existing DAC model. Much like a Unix filesystem, DAC assigns an owner to every object, after which that owner may manipulate the object at will. DAC is generally translated into Korean as “arbitrary access control,” but in this context I would prefer to translate it as “discretion-based access control.” This is because **all** permissions on an object are left to the owner's discretion. For example, one owner can transfer ownership to another owner and freely change access permissions on the objects they own.

In many organizations, however, actual users do not “own” the information about access permissions. That is, even if they can access an object, they cannot transfer the right to access that object itself to someone else. In practice, access permissions are managed by the system or by an authorized administrator.

In such cases, access restrictions are generally determined by the user's role within the organization (rather than by whether the user owns an object). A hospital, for example, might have roles such as doctor, nurse, therapist, and pharmacist, while a bank might have roles such as teller, loan officer, and accountant. Such roles can also be applied to military systems. Target analysts, situation analysts, and traffic analysts, for example, are common roles in tactical systems.

**...Up to this point, I have practically been translating the paper. A proper explanation begins below, but reproducing the paper as-is would probably make it difficult to understand, so from here on I will explain it in my own way.**

What the authors were trying to say in the paragraphs above is this: traditional DAC performs “owner-based” access control, and because it allows actions such as transferring ownership to someone else, its authorization controls are too loose. If, for example, someone in an important position were to mistakenly transfer ownership of a confidential file to another person, it would cause a serious problem. Unlike that approach, we can consider roles within an organization and observe that users with the same role generally have the same permissions. Then, if we

1. define roles (e.g. administrator, regular user, full club member),
2. define permissions (e.g. access the admin page, read the full-members board, read the free board),
3. assign permissions to each role, and
4. assign users to each role,

the problem is neatly solved. Role-Based Access Control interprets this connection between users and permissions as a relationship mediated by roles.

## My Personal Interpretation of RBAC

The paper proposes RBAC as an alternative way to solve the problems of DAC. I, however, interpreted RBAC as an alternative to an ideal authorization system.

An ideal authorization system would let us configure every permission for every user. Therefore, if there are N permissions and M users, it requires up to $N\times M$ relations.

But it is nearly impossible for an administrator to manage all of them, because there is simply too much permission information to maintain. Even with just 1,000 users and 20 permissions, for example, there would be 20,000 permissions to configure. Practical concerns aside, even the space complexity is $O(NM)$, which is far too large.

In an ordinary system, not every user will have a completely different set of permissions. We can therefore reduce the number of required relations by grouping together users who have the same permissions. Suppose, for example, that grouping users with identical permissions produces K groups. Then we only need to store

1. which group each user belongs to—that is, the user–group relationship—and
2. which permissions each group has—that is, the group–permission relationship.

This means that we need only $N\times K+K\times M=(N+M)\times K$ relations. If we assume that the previous example produces about four groups, we can see that only $(20+1000)\times 4=4080$ relations are needed. That is far fewer than the 20,000 from before. This even assumes that a user may belong to multiple groups at once. If we limit each user to a single group, only $N\times K + M$ relations are needed; using the previous example, 1,080 relations are enough.

> Of course, DAC can also be interpreted as an alternative to an ideal authorization system. In this case, permissions are interpreted as a user's ($N$) actions ($K$) on resources ($M$). Since we cannot manage all $N\times M\times K$ relations, we assign an owner to every resource and interpret that owner as being able to perform every action on the resource. We then need to store only $M$ owner–resource relationships. The drawback, however, is that it becomes impossible to selectively prohibit the owner of a resource from performing a particular action on it.

## Components and Mathematical Representation of the RBAC Model

The RBAC model has the following five major components.

- Whether a particular action (function) can be performed is called a “**P**ermission.”
- The entity that can exercise a permission is called a “**S**ubject.”
- A group of entities with a particular set of permissions is called a “**R**ole.”

These are usually abbreviated as $P$, $S$, and $R$.

In addition,

- the permission–role relationship—that is, which Permission is assigned to which Role—is called **P**ermission **A**ssignment, and
- the subject–role relationship—that is, which Subject is assigned to which Role—is called **S**ubject **A**ssignment.

These are usually abbreviated as $PA$ and $SA$.

> There are also **T**ransactions (T), **R**ole **H**ierarchy (RH), and so on, but I will not cover them here.

All of these can be expressed as sets.

- $P$, $S$, and $R$ can all be thought of as simple sets,
- $PA\subset P\times R$, and
- $SA\subset S\times R$.

# Implementation

As you can see, the system above is extremely simple. There was, however, quite a gap between its conceptual structure and an actual implementation.

Before implementing the system, I first set the following goals.

- Design an RBAC system.
- The system must exist as an independent module and have no dependencies on other systems, such as the user model, message boards, or competition registration.
- Using the module must be as simple as possible. In other words, minimize the amount of code that must be added to use it.
- The system must use a relational database.
- It must be possible to configure permissions (through a CLI tool or web dashboard) without touching either the database or the source code at all.

I set these goals because the service I manage is a club website. I will not be its sole administrator forever; younger club members will manage it in the future, and many of them will not be computer science majors. Introducing a technology such as Redis to a service with fewer than 100 concurrent users would add another maintenance burden and make backups more difficult. (A script for backing up the entire database already exists, so backups are currently straightforward.) Furthermore, modifying source code simply to configure permissions is clearly a poor implementation in itself. Removing dependencies and modularizing the system follow from the same reasoning.

Once I set these conditions and began implementing the system, however, I encountered several problems.

## How Do We Obtain the List of Permissions?

This system ultimately requires five sets: $P, S, R, PA, SA$. We can simply reuse the existing user model as $S$, while $R$ is just a table with one column (or two, if we add a description for each Role). Given $P,R,S$, both $PA$ and $SA$ can easily be represented as two-column tables. The crucial problem was how to obtain the set $P$.

I quickly realized that unlike the other sets, $P$ could not be stored in the database. If it were, every addition or deletion of an API in the source code would also require directly modifying the database to adjust the permissions. That would be an extremely inefficient and error-prone structure. I therefore decided that after the server starts, $P$ would be generated dynamically at runtime whenever it is requested.

My first idea was to map APIs and permissions one-to-one. The list of APIs would then become the list of permissions, and Koa's route-listing feature would make this easy to implement. In other words, when the server started, it would retrieve its own list of APIs and use that as $P$.

**However**, on the club website, some boards are accessible to all users, while others are accessible only to full members. In other words, even calls to the same message board API may require different permissions. This meant that the approach would not work. It was a genuinely difficult problem to solve. I looked at other authorization libraries and found inspiration in the [Casbin](https://casbin.org/) library: divide a permission into “Actions” and “Objects,” then use their Cartesian product as the set of permissions. Taking message board permissions as an example, it would look like this:

```
- Actions = ['list posts', 'read post', 'write post']
- Objects = ['full-members board', 'free board']
- Permissions = Objects × Actions = [
  ('full-members board', 'list posts'), ('full-members board', 'read post'), ('full-members board', 'write post'),
  ('free board', 'list posts'), ('free board', 'read post'), ('free board', 'write post')
  ]
```

The Casbin library implemented this in a specially formatted file, but I did not like that approach. Whenever an administrator added or deleted a category, the file would also have to be updated, which is highly inefficient. I therefore designed the RBAC system to accept lists of “Actions” and “Objects” and automatically generate their Cartesian product.

Of course, there are situations in which no “Object” is needed. For example, the “may delete users” feature (available to the administrator role) simply allows or disallows user deletion; there is no need for fine-grained permission to delete only particular users. For cases like this, I implemented the system so that supplying `null` for the list of “Objects” uses the list of “Actions” directly as the permissions.

This design, however, introduces a minor problem: it can generate meaningless permissions. Suppose, for example, that the permissions for sending a private message and for using message boards are expressed together as follows:

```
- Actions = ['send private message', 'read post', 'write post']
- Objects = ['free board', 'full-members board']
```

This would generate permissions such as `send private message to free board (?)`, which have no actual meaning. So instead of taking the Cartesian product of every Action and every Object, I separated permissions into modules, allowing only the Cartesian products of particular Actions and particular Objects. In other words, a permission is a `(Module, Action, Object)` tuple.

Some people might think that every operation could simply be standardized as “CRUD” to make the system RESTful. In practice, however, that creates quite a few strange problems. Consider the “permission to know that a board exists”—that is, permission to see the board in the list of boards when visiting the website. This permission would of course be a “Read.” But the “permission to read posts belonging to a board” is a different permission, yet expressing it as CRUD would also make it a Read. An administrator may also have permission to add a board, which is a Create in CRUD. But an ordinary user's permission to write a post inside a board is likewise a Create. In other words, expressing permissions as CRUD can cause multiple permissions to overlap, making it impossible to distinguish them uniquely. There are various other problems as well, including the fact that not every resource uses all four CRUD operations.

> Of course, this could be solved by designing the API structure to be extremely RESTful. But obsessing over REST too much can result in a significant loss of generality. For example, login and logout can be expressed as `POST /session` and `DELETE /session`, but one might as well use the non-RESTful `POST /login` and `DELETE(or POST or GET) /logout`.

I therefore implemented permission modules as follows.

```js
const PostPermission = RBAC.getRBACModule('post', ['read', 'delete', 'update']);
const MenuPermission = RBAC.getRBACModule('menu',
                                          ['list', 'write'], // Actions
                                          ['free-board', 'member-board'] // Objects
                                         );
```

If categories were maintained in a list like `CategoryPermission` in the example above, this would be no different from maintaining them in a file. In other words, whenever an administrator added a category, the category would also have to be added to that list. I therefore implemented it so that the category list is retrieved from the database, as shown below.

```js
const MenuPermission = RBAC.getRBACModule('menu', ['list', 'write'], async knex => {
  const menus = await knex.select('menu_pk', 'name').from('menu');
  return menus.map(x => ({ id: x.menu_pk, description: x.name }));
});
```

Here, an Object does not mean the entire actual object, but rather its primary key in the database. If administrators were shown only the primary keys of objects, however, they would have difficulty configuring permissions. So instead of supplying a list of strings, I made it possible to supply a list of `{id, description}` values, allowing administrators to see both the ID and description.

> This is not particularly important, but the actual implementation accepts `Object[]`, `Promise<Object[]>`, or `function => Promise<Object[]>` as the Objects input.
>
> You might also think that in order to reflect categories changed by an administrator while the server is running, the query above would have to run every time a menu is retrieved. But permission checks query PA, not P. Therefore, the menu-list query above runs only when an administrator opens the permission list on the admin page to configure permissions.
>
> In the example above, the list of Objects is supplied using the knex connection provided inside the permission module. I did this only because my permission model and user model reside in the same database, making it convenient to share the connection. As long as the returned list has the correct format, nothing prevents the implementation from ignoring that knex connection and querying another database—or even a non-relational source such as MongoDB or the filesystem—instead.

## How Do We Check Those Permissions?

The next issue was how to check these permissions. The simplest approach would be to make the list of PAs directly queryable from Koa routers, but this would put the same permission-checking `if` statement in every router. I have an extreme aversion to duplicating similar code, so this was not an acceptable approach.

The best solution seemed to be generating permission-checking middleware inside the RBAC module and performing the checks in that middleware. As soon as I came up with the idea, however, I realized that it was impossible. User information can be obtained through the `ctx` parameter if auth middleware runs beforehand, but when an Object is involved, we need to know which Object the router is trying to access. That Object might be supplied in a query, a parameter, or a POST body; the request might even contain only conditions for querying the Object rather than its exact primary key. Middleware that knows nothing about the API implementation therefore has no way to determine which Object is being accessed.

After thinking about it, I came up with the following idea. First, generate middleware for each Action. As mentioned earlier, user information is easy to obtain. In a permission module with no Object, where permissions consist only of Actions, the Module and Action uniquely determine the Permission, so the permission check can be performed. The middleware performs this check and returns `401 Unauthorized` if the user does not have permission.

When an Object was involved, I injected a `checkPermssion` function into `ctx`, making it possible to run the check inside the router in the form `ctx.checkPermission(object)`...or so I thought.

## But What If There Are Multiple Objects?

There was a fatal flaw in the approach of injecting the `checkPermission` function: what happens when there are multiple Objects? When retrieving a list of boards, for example, some boards should be visible while others should not, as described earlier. This would require retrieving the list of boards and then calling `checkPermission` on every single board. That would be a very, very inefficient implementation.

After wrestling with this problem for a long time, I came up with a reasonably good idea: instead of injecting a function that checks a single Object, inject a function that retrieves every allowed Object. The router can then retrieve the allowed Objects and filter them easily using the SQL `IN` operator.

> The reason I inject a “function that retrieves the list of allowed Objects,” rather than the “list of allowed Objects” itself, is to avoid unnecessary database queries. As I will explain later, there are cases in which permissions cannot be controlled through RBAC alone. Additional authorization systems, such as ABAC, must then be introduced. In such cases, access may already have been denied before Object permissions are checked. If so, there is no need to check Object permissions at all, so I designed the router to perform that check only when necessary.
>
> Retrieving every allowed Object may seem inefficient at first glance, but it is actually more efficient because it reduces the number of database queries. If the previous method required N+1 database queries, the current method requires only two. Database queries have high latency, so fewer queries are always better; the current method is therefore more efficient.

Below is a router with an Object that applies everything described above.

```js
const MenuPermission = RBAC.getRBACModule('menu', ['get'], async knex => {
  const menus = await knex.select('menu_pk', 'name').from('menu');
  return menus.map(x => ({ id: x.menu_pk, name: x.name }));
});

router.get('/', MenuPermission.middlewares.get, async (ctx) => {
  const allowedObjects = await ctx.getAllowedObjects();
  // allowedObjects are actually list of primary keys.
  const query = ctx.knex.select([
    'menu_pk',
    'parent_pk',
    'name',
    'url'
  ])
    .from('menu')
    .whereIn('menu_pk', allowedObjects)
    .orderBy('order', 'desc');
  // omitted
  ctx.body = result;
});
```

Below is a router without an Object.

```js
const SomePermission = RBAC.getRBACModule('some', ['list', 'read', 'delete']);

router.get('/some/router',
  SomePermission.middlewares.list,
  async ctx => {
  	const data = ctx.knex.select().from('some_table')
    ctx.body = data;
  });
```

In the examples above, middleware names such as `Permission.middlewares.get` are long and hurt readability. They are written that way for the sake of the examples; they can easily be shortened by assigning the middleware to a new variable.

## What About Separating It from the User Model?

The implementation above assumes that the middleware already knows the user's information. In reality, this creates a dependency on the user model. The user model determines the variable and name under which user information is stored inside the middleware, and the source code of the authorization system would have to change accordingly. To eliminate this dependency, I made the RBAC module's initializer accept a function that extracts user information—that is, the information corresponding to the Subject in RBAC—from Koa's `ctx` object.

```js
// ../config/rbacConfig.js
const RBAC = require("../libs/rbac");
const ENV = require('../env.json');

function getSubject(ctx) {
  if(!ctx.session) return -1; // -1 means users without login.
  if(!ctx.session.user) return -1;
  return ctx.session.user.user_pk;
}

const rbac = new RBAC(ENV.db, getSubject);

module.exports = rbac;
```

When using the RBAC module in practice, we do not import the RBAC module directly; instead, we import and use this configuration file. This completely separates the user model from the authorization model.

> In other words, the RBAC module (`../libs/rbac`) exports a class, while the configuration file exports an instance of that class.

This means that the authorization model could be turned into a library right now and applied not only to our club website, but to other services as well.

## What About the Concept of an “Owner”?

So far, we have discussed RBAC, but RBAC cannot actually be used in every situation. If someone has permission to delete a particular post, that permission should (apart from administrators) be granted only to the person who wrote the post. In other words, the permission varies according to the “relationship between the Object and the Subject.” RBAC, however, has only N:M relationships between Objects and Roles and between Permissions and Roles; there is no direct relationship between an Object and a Subject. Granting permissions based on such a relationship is therefore impossible in principle, so checks like this must be handled by introducing Attribute-Based Access Control (ABAC) or a similar system.

> In practice, it would be possible to create one Role per user, each containing just that single user. But for the same reason discussed earlier with the “ideal authorization system,” this would cause the number of permissions to explode and make them impossible to manage.

I thought about this problem for a long time. In the end, however, I concluded that apart from a few deletion APIs like the one above, there were not many places that truly needed ABAC. I therefore decided to implement those checks directly in the message board system's source code without introducing another authorization system. If many more such cases arise, of course, I will implement a separate ABAC system then.

# Conclusion

I implemented an RBAC policy model based on Koa. Although the implementation above is well modularized, it does technically have a very slight dependency on the Koa library. Still, it would be extremely easy to extend it to support Express and similar frameworks, or even turn it into a completely independent service (by separating the database and exposing it through an API). With that in mind, I think it is fair to say that it has no dependency in any practical sense.

> Knex is used only internally, so it is not a dependency. By “dependency” above, I mean a constraint imposed on the consumer in order to use the authorization library I designed.
