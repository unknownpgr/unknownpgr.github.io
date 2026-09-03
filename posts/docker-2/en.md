---
title: Learning Docker [2]
tags:
  - docker
date: 2020-08-08T10:39:45.846Z
---

> This post was translated from Korean into English by AI.

In the previous post, I briefly explained what Docker is. In this post, I will discuss how Docker can be used and what its advantages are.

# My Personal Thoughts on Docker

I think Docker is fundamentally a great tool that can be used for any project. For example, I am currently developing an embedded system for a competition. Because the system uses an ARM processor, it requires an ARM cross-compiler and must use Ubuntu 16.04. Of course, every member of the team has to go through the exact same complicated setup process. Ordinarily, the team members would have to install a new Linux operating system on their laptops and complete the complicated setup. However, if the runtime environment is packaged as a Docker image, every team member can use the image created by one person and develop in exactly the same environment. This is convenient because it prevents environment-specific conflicts when the code is integrated later.

Docker is particularly useful when developing web services. When a web service is developed with Docker, development (for every developer), builds, and deployment can all take place in the same environment. This eliminates all of the overhead involved in setting up a development environment. In addition, Docker containers can be deployed across multiple servers to distribute traffic. Another advantage is that containers start and stop quickly, so server updates cause almost no downtime. Microservice architectures, which divide a service into small components, have become widely used in recent years, and I believe Docker is the ideal solution for such cases.

---

The content below draws on the following book.

- *From Docker Installation to Operation (Docker Up & Running)*, by Karl Matthias and Sean P. Kane, translated by Park Jong-young

# How to Use Docker Properly

> Like other tools, Docker can be used in many different ways, but some may not be particularly good. For example, you can open a glass bottle with a hammer, but that does not make it a very good method.

## Containers Are Different from Virtual Machines

Containers are different from virtual machines. It is more accurate to think of them as processes with a degree of isolation added. Therefore, using a Docker container to run a single command is not wasteful at all.

## Limited Isolation

Containers are not like virtual machines, which provide complete isolation. They directly occupy and use the host's CPU and memory. This means containers are just as vulnerable as the host computer to attacks targeting the kernel. Therefore, when exposing a container to the web, for example, you need to pay more attention to security than you would with a virtual machine.

## Stateless Applications

Containers are ephemeral. When a container is deleted, all information stored inside it disappears. Therefore, stateless applications are best suited to running in containers. Database management systems (DBMSs), for example, are not well suited to running in containers. If you need to store information in a database or similar system, it is preferable to place the database server outside the container and let the container handle only the processing.

# Advantages of the Docker Workflow

> ... This also makes it easier to create and share tools across applications. They say nothing in the world has advantages without disadvantages, but remarkably, Docker has almost no disadvantages. Below, I will list some of the advantages Docker offers.

## OS, Software, and Dependencies Integrated into One

In the past, developers had to configure their development environments individually before they could develop software. When multiple developers were involved and the project depended on numerous libraries in particular, simply setting up the development environment before joining the project was a considerable challenge. With Docker, however, the OS, the software being developed, and its dependencies are all integrated into a single image. To set up the development environment, all you need to do is pull the Git repository and build the `Dockerfile`.

## No Need to Rebuild

As explained in the previous post, a Docker image contains all the information about a container. Therefore, if the Docker image also includes the built application, you need to build it only once at the beginning of the build, test, and deployment process. After that, you can simply use the image containing the already-built application.

## No Waste of Resources

Running virtual machines has drawbacks such as the following:

1. A hypervisor is required to manage the virtual machines.
2. When a VM runs, its kernel occupies hardware resources.
3. Starting and stopping takes a long time because the kernel must be loaded and unloaded.

However, a Docker container is merely a single process that directly uses the host computer's kernel, so it does not require a separate kernel of its own. As a result, it can start and stop very quickly. Like VMs, Docker containers can also have their memory and CPU usage limited, so there is no need to worry about a container consuming excessive resources.
