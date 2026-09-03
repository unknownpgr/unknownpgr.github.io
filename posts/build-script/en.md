---
title: Build script
tags:
  - dev
  - tips
date: 2023-09-02T15:00:53.257Z
---

> This post was translated from Korean into English by AI.

I created a Docker build script that is useful for building small projects.

## Usage

Create a build script like the one below.

```bash
#!/bin/bash
shopt -s expand_aliases
alias build='curl -sSL l.ist.sh/b | node - build'

# Build images
export BACKEND_IMAGE=`build backend se.ction.link/blog-backend`
export FRONTEND_IMAGE=`build frontend se.ction.link/blog-frontend`

# Deploy with envsubst
cat kubernetes/resources.yaml | envsubst | kubectl apply -f -
```

## How it works

- `shopt -s expand_aliases` enables aliases.
- `alias build='curl -sSL l.ist.sh/b | node - build'` creates the `build` command. This command retrieves the build script from my personal server and runs it.
- The `build <directory> <registry>` command works as follows:
  1. It reads every file in the `directory` directory and calculates a hash.
  1. It uses the directory hash as the tag to create the image name.
  1. It checks the automatically generated cache under the `tmp` directory to determine whether the image exists.
  1. If the image does not exist, it builds the image with `docker buildx`.
  1. It pushes the image.
  1. It writes the image name to stdout.
- It reads the Kubernetes resource file and substitutes environment variables using envsubst.
- It deploys the substituted file with kubectl.
