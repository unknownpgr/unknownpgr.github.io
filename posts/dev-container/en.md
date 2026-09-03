---
title: Dev container
tags:
  - development
date: 2023-09-01T13:53:39.184Z
---

> This post was translated from Korean into English by AI.

Dev container is a tool that standardizes development environments, reducing the effort required to set them up.
It is easy to use through a VSCode extension.

- As its name suggests, a Dev container is a container for a development environment.
- All you need to do is place the appropriate configuration file in the `.devcontainer` folder at the project root.
- Then, with the VSCode extension, you can use a container image built from that configuration as your development environment.
- VSCode works by connecting to the container over SSH.
- You can also run a Dev container on a remote machine and connect to it. Various features, including port forwarding from within the Dev container, work seamlessly as well.

Below is the Dev container configuration file I like to use.

```json
{
  "name": "my-dev-container",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:16-bullseye",
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "mhutchie.git-graph",
        "esbenp.prettier-vscode",
        "streetsidesoftware.code-spell-checker",
        "wayou.vscode-todo-highlight",
        "GitHub.copilot",
        "dbaeumer.vscode-eslint",
        "yoavbls.pretty-ts-errors"
      ]
    }
  },
  "postCreateCommand": "scripts/init.sh",
  "remoteEnv": {
    "PATH": "${containerEnv:PATH}:/${containerWorkspaceFolder}/scripts"
  }
}
```

You can find more details about Dev container at the following links.

- [VSCode Dev container](https://code.visualstudio.com/docs/remote/containers)
- [Dev container json reference](https://containers.dev/implementors/json_reference/)
