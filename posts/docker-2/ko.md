---
title: Docker 공부해보기[2]
tags:
  - docker
date: 2020-08-08T10:39:45.846Z
---

저번 포스팅에서 도커가 무엇인지 간단히 정리했습니다. 이번 포스팅에서는 도커를 어떤 식으로 활용하는지, 또 그 장점이 무엇인지 정리해보도록 하겠습니다.

# 도커에 대한 개인적 생각

도커는 기본적으로 어떤 프로젝트에서도 이용할 수 있는 좋은 툴로 생각됩니다. 예를 들면 저는 지금 어떤 대회에 출품하기 위해 임베디드시스템을 개발해야 하는데, 해당 시스템은 ARM프로세서를 이용하므로 ARM Cross compiler를 사용해야 하며, 꼭 Ubuntu 16.04 버전을 사용해야 합니다. 물론 이 복잡한 설정 과정들은 모든 팀원들이 다 동일하게 수행해야만 합니다. 원래대로라면 팀원들이 노트북에 리눅스 운영 체제를 새로 깔고 복잡한 설정을 해야 하나 이 실행 환경을 도커 이미지로 만들어놓으면 한 명이 만들어놓은 이미지를 사용하여 모든 팀원들이 정확히 동일환 환경에서 개발이 가능합니다. 그러므로 나중에 코드를 통합할 때 환경 설정에 따라 충돌이 일어날 일이 없어 편리합니다.

특히 도커는 웹서비스를 개발할 때 두각을 드러냅니다. 웹서비스를 도커를 사용하여 개발하면, (모든 개발자의)개발 - 빌드 - 배포가 모두 동일한 환경에서 이루어질 수 있습니다. 그러므로 개발 환경을 세팅하는 데 드는 비용이 모두 사라집니다. 뿐만 아니라 여러 개의 서버에 도커 컨테이너를 올려서 트래픽을 분산시킬 수도 있습니다. 실행과 중단이 빠르므로 서버 업데이트시 지연시간이 거의 없다는 것도 장점입니다. 최근에는 서비스를 잘게 쪼개는 마이크로서비스 아키텍쳐가 많이 사용되고 있는데, 도커는 이런 경우에 최적의 솔루션이라고 생각됩니다.

---

아래 내용은 다음 서적을 참고했음을 밝힙니다.

- 도커 설치에서 운영까지(Docker Up & Running), 칼 마티아스, 션 P. 케인 지음, 박종영 역

# 도커를 적절히 사용하는 방법

> 다른 도구들처럼 도커 또한 다양한 사용 방식이 있지만, 어떤 것은 딱히 좋지 않을 수도 있다. 예를 들면, 유리병을 망치로 열 수는 있지만, 썩 좋은 방법은 아닌 것처럼 말이다.

## 컨테이너는 가상머신과 다르다

컨테이너는 가상머신과 다릅니다. 약간의 독립성이 추가된 프로세스라 보는 편이 맞습니다. 그러므로 단 한 줄의 명령어를 사용하기 위해 도커 컨테이너를 사용하는 것은 전혀 낭비가 아닙니다.

## 제한적인 고립화

컨테이너는 완전한 고립화를 지원하는 가상 머신과는 다릅니다. 호스트의 CPU와 메모리를 그대로 점유하고 사용합니다. 그러므로 컨테이너는 커널에 대한 해킹 공격에 호스트 컴퓨터와 똑같이 취약합니다. 따라서 컨테이너를 웹에 공개하거나 할 때에는 가상 머신과 다르게 보안에 신경을 더 쓸 필요가 있습니다.

## 무상태 어플리케이션

컨테이너는 휘발성입니다. 컨테이너가 삭제되면 컨테이너 내부에 저장된 정보는 모두 사라집니다. 그러므로 컨테이너에서 실행되는 어플리케이션은 상태가 없는(stateless) 어플리케이션이 적절합니다. 예를 들어 데이터베이스 관리 시스템(DBMS)등은 컨테이너에서 실행하기 적합한 프로세스가 아닙니다. 만약 DB등을 통해 정보를 저장할 필요가 있다면, 컨테이너 외부에 DB서버를 두고 컨테이너에서는 처리만 하는 편이 바람직합니다.

# 도커 워크플로의 장점

> ... 그러므로 애플리케이션 간에 도구를 만들어 공유하기도 쉬워진다. 세상에 장점만 있고 단점이 없는 것은 존재하지 않는다지만, 도커는 정말 놀랍게도 단점이 거의 없다. 도커를 써서 얻을 수 있는 장점 몇 가지를 아래에 나열해 보겠다.

## OS, 소프트웨어, 의존성이 하나로 통합됨

과거에는 소프트웨어 개발을 위해 개발 환경을 일일이 맞춰야만 했습니다. 특히 여러 개발자들이 참여하고, 수많은 라이브러리들에 의존성을 가지는 경우 개발에 참여하기 위해 개발환경을 세팅하는 것부터가 상당히 힘든 일이었습니다. 그러나 도커를 사용하게 되면서 OS, 개발하는 소프트웨어 그 자체, 의존성이 모두 하나의 이미지로 통합되었습니다. 개발 환경을 설정하려면 Git 리포지토리를 pull한 후, `Dockerfile`을 빌드하기만 하면 됩니다.

## 재빌드 필요 없음

저번 글에서 설명한 것과 같이 도커 이미지는 컨테이너에 대한 모든 정보를 다 담고 있습니다. 그러므로 도커 이미지에 빌드된 어플리케이션까지 포함한다면, 빌드, 테스트, 배포 전 과정에서 처음 딱 한 번만 빌드를 수행하면 되며, 이후에는 이미 빌드된 어플리케이션이 포함된 이미지를 가져다 쓰기만 하면 됩니다.

## 자원 낭비 없음

가상 머신을 구동하기 위해서는

1. 가상 머신들을 관리하는 하이퍼바이저(hypervisor)가 필요함
2. VM이 실행될 때 커널(kernel)이 하드웨어 자원을 점유함.
3. 실행 / 종료시 커널을 올리고 내려야 하므로 시간이 오래 걸림

등의 단점이 있습니다. 그러나 도커 컨테이너는 호스트 컴퓨터의 커널을 직접 사용하는 하나의 프로세스에 불과하므로, 컨테이너를 위한 별도의 커널이 필요 없습니다. 따라서 실행이나 종료가 매우 빠르게 이루어질 수 있습니다. 도커 컨테이너 역시 VM과 같이 메모리나 CPU점유율을 제한할 수 있어서, 컨테이너가 과도한 자원을 점유할까봐 걱정할 필요가 없습니다.