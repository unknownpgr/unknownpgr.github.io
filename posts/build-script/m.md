---
title: Build script
tags:
  - dev
  - tips
date: 2023-09-02T15:00:53.257Z
---

작은 프로젝트를 빌드할 때 유용한 도커 빌드 스크립트를 만들었습니다.

## Usage

아래와 같이 빌드 스크립트를 만듭니다.

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

- `shopt -s expand_aliases` 를 통해 alias를 사용할 수 있도록 합니다.
- `alias build='curl -sSL l.ist.sh/b | node - build'` 를 통해 `build` 명령어를 만듭니다. 이 명령어는 제 개인 서버에서 빌드 스크립트를 가져와 실행합니다.
- `build <directory> <registry>` 명령어는 다음과 같이 동작합니다.
  1. `directory` 디렉토리의 모든 파일을 읽어 해쉬값을 구합니다.
  1. 디렉토리 해쉬를 tag로 하여 이미지 이름을 만듭니다.
  1. `tmp`디렉토리 아래에 자동으로 생성되는 캐시를 확인하여 이미지가 존재하는지 확인합니다.
  1. 이미지가 존재하지 않는다면 `docker buildx`를 통해 이미지를 빌드합니다.
  1. 이미지를 푸시합니다.
  1. 이미지의 이름을 stdout으로 반환합니다.
- kubernetes resource 파일을 읽어 envsubst를 통해 환경변수를 치환합니다.
- 치환된 파일을 kubectl로 배포합니다.
