---
title: Studying Docker [3]
tags:
  - docker
date: 2021-01-09T08:47:20.287Z
---

> This post was translated from Korean into English by AI.

In this post, I will briefly cover Docker Compose.

I recently started using it because I needed to run several services together on a single machine. At first, I simply assigned a different port number to each server process, but as managing them became increasingly tedious, I decided to dockerize everything. Once I tried it, I found it so convenient that I wanted to organize what I had learned in a post.

# What Is Docker Compose?

> Compose is a tool for defining and running multi-container Docker applications. With Compose, you use a YAML file to configure your application’s services. Then, with a single command, you create and start all the services from your configuration. To learn more about all the features of Compose, see [the list of features](https://docs.docker.com/compose/#features).

According to Docker's official description, Docker Compose is a solution for running a multi-container Docker application—in other words, an application that uses multiple containers. One example would be a service divided into a frontend server and an API server. Docker Compose can be defined through a file in `YAML` format, and the entire service can be started with a single command: `docker-compose up`.

# Usage Example

As the saying goes, seeing is believing, so it would be helpful to look at an actual example. Below is the `docker-compose.yml` file I use to run a particular service.

```yaml
version: '3'
services:

  nginx:
    image: jwilder/nginx-proxy
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
    ports:
      - 80:80
      - 443:443

  service1:
    image: halverneus/static-file-server:latest
    environment:
      - VIRTUAL_HOST=service1.mydomain.com
      - FOLDER=/app
    volumes:
      - /srv/server-service1:/app
    expose:
      - 8080

 service2:
     image: unknownpgr/service2:latest
     environment:
       - VIRTUAL_HOST=service2.mydomain.com
       - FOLDER=/app
     volumes:
       - /srv/server-service2:/app
       - /var/log:/app/log
     expose:
       - 80
     entrypoint: ['node','/app/index.js']
```

First, `version: '3'` at the very top simply specifies the Docker Compose version. As of January 2021, Docker Compose has been released up to version 3.8. Because the available features differ slightly from one version to another, the version needs to be specified.

## Options

The `services` section below it is where the containers are actually defined. Each element under `services`—`nginx`, `service1`, and `service2`—represents a single container. The nested elements determine the properties of each container.

- Each container's `image` specifies which Docker image to use. As with `docker run`, Docker first looks for the image locally and then searches Docker Hub.
- `environment` contains the environment variables passed to each Docker image. I will explain the environment variables I configured below.
- `volumes` is equivalent to the `-v` option of `docker run`; it mounts a host directory inside a container. The order is `host:container`, so in the case of `service1`, it means mounting the host's `/srv/server-service1` directory at the `/app` directory inside the container.
- `ports` maps ports inside the container to ports outside it. This also follows the `host:container` order. For example, `80:123` maps port `123` inside the container to port `80` on the host.
- `expose` means exposing a port inside the container to the network. *However*, because Docker Compose connects all containers to the same network by default, this directive has no practical effect. It is still useful as a kind of flag, though, as explained below.
- `entrypoint` is the *one and only command* that runs when the Docker image is started. If you want to execute multiple commands, you need to have it run a shell script.
- Although it does not appear in the file above, an item called `command` is also frequently used. `command` acts like arguments appended to the command specified by `entrypoint`. For example, if `entrypoint` is `echo` and `command` is `hello world`, then `echo hello world` is executed when the container starts. Functionally, there is no difference between `command` and `entrypoint`, but `command` can be overridden. For this reason, the command itself is usually specified with `entrypoint`, while its default options are supplied through `command`. Then, when starting the container, you can provide only the `command` option to override that part while leaving the command itself unchanged, which is convenient.

## Explanation

In the example above, the `nginx` container is the most interesting. The server running this service uses a wildcard domain, which routes every subdomain to the server regardless of what appears before the assigned domain. For example, if the service above has been assigned `mydomain.com`, entering any subdomain—such as `service1.mydomain.com`, `service2.mydomain.com`, `asdf.fdsa.mydomain.com`, or `helloworld.mydomain.com`—will always route you to this server. The server can then inspect the requested domain and connect the request to a different service, even if the requests arrive through the same port. This technique is called a reverse proxy.

`nginx` provides features that make it easy to implement this kind of reverse proxy. The `nginx-proxy` container provides an even easier way to do so. Put simply, this container scans the Docker containers connected to the same network. It then finds containers that both have `expose` configured and possess a `VIRTUAL_HOST` environment variable. When a request arrives for the domain specified by a container's `VIRTUAL_HOST`, it forwards the request to that container. This is why the two containers below `nginx` in the example set a `VIRTUAL_HOST` environment variable along with a seemingly unnecessary `expose` directive.

## Result

As a result, I can now run all sorts of services on a single server without any fuss. I no longer need to worry about port numbers, and the advantages certainly do not end there. In particular, being able to simply restart a service whenever necessary without having to give it a second thought feels like a major benefit.
