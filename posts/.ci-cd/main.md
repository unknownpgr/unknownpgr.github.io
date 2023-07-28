---
title: 소규모 팀 및 개인을 위한 CI/CD 구축
category: devops
---

# Motivation

저는 현재 개인 프로젝트를 하나 진행중이며, 그와 별개로 3인 규모의 작은 팀으로 프로덕트를 운영하고 있습니다.
이때 프로덕트 DevOps 운영을 위해 기존에는 이러한 방식을 사용했습니다.
- Master / Dev / Feat 세 종류의 브랜치로 Git-Flow 구성
- 로컬 실시간 hot-reloaded live server를 사용하며 개발
- GitHub workflow 기반으로
    - Dev branch push ==> 프로덕션 환경과 동일한 환경을 가진 테스트 서버에 배포
    - Master brach push ==> 프로덕션 서버에 배포
따라서 개발자는 로컬에서 개발하고, 테스트 서버에 배포하고, 마지막으로 프로덕션 서버에 배포하는 과정을 거치게 됩니다. 그런데 이렇게 작은 규모에서 Git기반의 배포를 하다 보니 불편한 점이 있었습니다.

- 