---
title: Dev container
category: development
---

Dev container는 개발 환경을 표준화하여 개발 환경 설정에 드는 노력을 줄여 주는 도구입니다.
VSCode의 확장 프로그램을 통해 편리하게 사용할 수 있습니다.

- Dev container는 그 이름처럼 개발 환경을 위한 container를 말합니다.
- 프로젝트 루트의 `.devcontainer` 폴더 안에 적절한 설정 파일을 넣어주면 됩니다.
- 그리고 VSCode의 확장 프로그램을 사용하면 해당 설정에 따라 빌드된 컨테이너 이미지를 개발 환경으로 사용할 수 있습니다.
- VSCode는 해당 컨테이너에 SSH를 통해 접속하는 방식으로 동작합니다.
- 원격 머신에 Dev container를 띄워서 접속하는 것도 가능하며, Dec container 내부에서의 Port forwarding을 비롯하여 다양한 기능들이 자연스럽게 동작합니다.

아래는 제가 즐겨 사용하는 Dev container 설정 파일입니다.

```json
{
  "name": "my-dev-container",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:16-bullseye",
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:2": {},
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
    "PATH": "${containerEnv:PATH}:/workspaces/PROJECT_NAME/scripts"
  }
}
```