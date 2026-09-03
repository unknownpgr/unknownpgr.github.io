---
title: Reality of Clean Architecture
tags:
  - development
date: 2023-04-10T07:01:03.591Z
---

> This post was translated from Korean into English by AI.

My previous post was written after I read *Clean Architecture* and came to understand dependency inversion. Wanting to put what I had learned into practice, I set out to refactor [The-Form](https://the-form.io), a service where I serve as CTO, toward a cleaner architecture. In fact, we currently have so many requests for new features that a major overhaul is necessary anyway. But when I tried to apply software development methodologies such as dependency inversion in the real world, I ran into one difficulty after another. So this time, I want to document those obstacles.

> None of these problems have been solved. For now, I have only organized the problems themselves.

# The Service Structure Is Not Ideal

Dependency inversion is fundamentally applied when components have been properly separated according to their levels of abstraction and instability, in order to align their dependencies accordingly. In other words, it can be regarded as restructuring component dependencies (since I am currently refactoring) so that the dependency graph becomes a Directed Acyclic Graph (DAG) whose edges point toward lower Instability.

The current implementation, however, was separated only by feature, not by level of abstraction or instability. For example, its structure is neatly divided by domain and concrete implementation: survey features, response features, and user features, as well as frontend and backend. But because development did not begin from the domain and instead proceeded incrementally, the characteristics of objects that ought to be abstract often depend on concrete implementations.

> I wish I had designed the service with these considerations in mind from the beginning, but at the time I did not understand architecture well enough. The domain was also unclear. For example, it was not even clear whether the service should focus on optimizing the creation and distribution of surveys or on providing statistical analysis and third-party integrations.

Trying to redesign it from the entities up at this stage means avoiding dependencies on concrete implementations—frameworks and databases, for example—while minimizing changes to the existing design. That makes it far more difficult than building it from scratch.

# There Is a Trade-off Between Performance and Structure

Perhaps I simply have more studying to do, but strictly following Clean Architecture seems to involve a trade-off between performance and architecture. Consider, for example, a service that displays stores and the ratings for each store.

- If the two are completely separated, a service that retrieves a list of stores along with their average ratings will have to make two queries.
- If the database is shared but the repositories are separated, and a join operation is used inside a repository, dependencies between components arise within the database, resulting in an architecture that is not clean at all.
- Using the same database and a single repository from the outset solves this problem. But with this approach, every domain that requires a join operation would end up crammed into one repository.
- In that case, redesign becomes difficult if domains are separated under the assumption that no join operation is needed and one later turns out to be necessary—or if the reverse happens.

It is also unclear what data repository functions should return. If they must return entities, they will have to return even useless fields, especially those produced by join operations. If they may instead return arbitrary data, then a return type will have to be defined for every repository function.

The problems above can be addressed to some extent by using an ORM or a query builder. This is because the ORM can be treated as the repository layer itself, allowing queries to be written directly in the service layer. In that case, however, using the repository requires knowledge of the database schema, which violates dependency inversion.

Now consider a service that requires complex operations. Examples include retrieving only the top ten ratings, retrieving only stores located within a particular grid square, or, in an RBAC implementation, retrieving only the resources that a user with a particular role can access. Implementing these operations in the service hurts performance, while implementing them as database queries puts business logic in the repository.

# The Domain Expands

As mentioned earlier, the domain was unclear when development first began. Following an agile approach, we added features as we learned about users' needs. As a result, we implemented a structure that was extensible to a certain degree, but it has now become difficult to extend the existing structure any further.

# The UI Does a Lot of Work

In a typical service, the UI would merely be a detail to worry about last and would not affect the service logic, whether that logic resides in the frontend or the backend. In surveys, however, the UI is enormously important. In effect, the UI *is* the service logic, the database is little more than a JSON store, and the backend—which could practically be implemented as a filesystem without much trouble—does nothing beyond managing data permissions and performs no meaningful computations. This makes it difficult to refer to other implementations for guidance.

# Where Should Authorization / Permission Go?

Authorization is also extremely difficult to handle. It determines only whether an operation should be permitted or denied; it is unrelated to the operation itself. Therefore, following SRP means that it should be separated. Otherwise, having to modify the service logic in order to change how permissions are checked would violate SRP.

But separating it is difficult because the service logic and Authorization are so closely intertwined. In simple cases, it is enough to know which user is trying to perform which Action. In other cases, however, a decision cannot be made without also knowing the resource that is the target object of that Action, or even the owner of that resource.

Separating them seems likely to make two independent components share a database, cause unnecessary queries, or create a cyclic dependency. Yet leaving them together seems to violate SRP.

If Authorization is separated into a component, it is also unclear where that component should reside. Placing authorization between the API and the service logic can create a security vulnerability if someone accidentally forgets the check. Putting it inside the service logic, on the other hand, couples it too tightly to the service, as discussed above, and scatters permission-checking code across too many places.

# Component Boundaries

Implementing every element independently does not necessarily produce good code. The-Form service, for example, uses a uuid library in three or four places. Rewriting components to eliminate their dependency on this uuid library would be overengineering that only increases the amount of code.

To avoid such overengineering, components must be divided according to SRP so that each performs only one role—or, more precisely, so that there is only one reason for a component to change. But determining those boundaries is remarkably ambiguous.

Consider, for example, the use case of reordering questions in a survey. In the implementation, changing the order of questions simply means changing their order within the array of questions contained in the survey object. This is clearly an interaction between the survey entity and the UI.

But the survey entity must not be manipulated directly from the UI. Doing so would not only prevent proper component separation, but would also couple the service logic too tightly to the UI. Because the service logic would be so tightly coupled to the UI, testing it would become extremely difficult.

On the other hand, implementing every array operation and every value assignment that can be performed on the survey object through getters and setters also feels like it would be overengineering.

# Conclusion

As always, nothing has been solved; I will have to try it first before I can know the outcome. For now, I am working to clearly understand the domain and write the entities and use cases.
