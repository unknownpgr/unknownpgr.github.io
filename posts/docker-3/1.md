---
title: Docker 공부해보기[3]
tags:
  - docker
date: 2021-01-09T08:47:20.287Z
---

이번 포스팅에서는 도커 컴포즈에 대해 간단히 다뤄보겠습니다.

이번에 한 머신에서 여러 서비스를 같이 돌릴 일이 있어 사용하게 됐습니다. 처음에는 그냥 각 서버 프로세스의 포트 번호만 다르게 해서 사용하다가, 갈수록 관리가 귀찮아지기에 아예 도커라이즈를 해 버렸는데요. 해 보니 너무나 편리해서 이걸 글로 잘 정리해두고자 포스팅을 해봅니다.

# 도커 컴포즈란?

> Compose is a tool for defining and running multi-container Docker applications. With Compose, you use a YAML file to configure your application’s services. Then, with a single command, you create and start all the services from your configuration. To learn more about all the features of Compose, see [the list of features](https://docs.docker.com/compose/#features).

 도커 공식 설명에 따르면, 도커 컴포즈란 multi-container docker application, 즉 컨테이너 여러 개를 사용하는 어플리케이션을 구동하기 위한 솔루션입니다. 예를 들어 어떤 서비스가 frontend서버와 api서버로 나뉘어 구동되고 있는 경우가 해당될 수 있겠습니다. 이러한 도커 컴포즈는 `YAML`형식의 파일을 통해 정의할 수 있으며, 서비스 전체를 `docker-compose up`이라는 커맨드 하나만으로 구동할 수 있습니다.

# 사용 예시

백문이 불여일견이라고, 직접 예시를 보면 더욱 좋을 것 같습니다. 아래는 제가 어떤 서비스를 돌리기 위해 사용하고 있는 `docker-compose.yml`파일입니다.

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

먼저 제일 위에 있는 version:'3'은 그냥 도커 컴포즈의 버전입니다. 도커 컴포즈는 2021년 1월 현재 3.8버전까지 출시되어 있는데, 버전별로 사용가능한 기능이 약간씩 차이가 있어 명시해줄 필요가 있습니다.

## 옵션들

그 아래 `services` 항목부터가 본격적으로 컨테이너를 정의하는 부분입니다. `services`의 각 요소 `nginx`, `service1`, `service2`는 각각이 하나의 컨테이너입니다. 그 아래 세부 요소들이 각 컨테이너의 속성을 결정합니다.

- 각 컨테이너의 `image`는 어떤 도커 이미지를 사용할 것인지를 지정하며, `docker run`을 할 때와 동일하게 먼저 로컬에서 이미지를 찾아본 후 docker hub를 탐색합니다.
- `environment`는 각 도커 이미지에 주어질 환경 변수입니다. 제가 설정한 환경 변수에 대해서는 아래에서 설명하겠습니다.
- `volumes`는 `docker run`의 `-v`옵션과 동일한 것으로, 호스트 디렉토리를 컨테이너 내부 디렉토리에 마운트합니다. `host:container`순서이므로, `service1`의 경우 호스트의 `/srv/server-service1`디렉토리를 컨테이너 내부의 `/app`디렉토리에 마운트하겠다는 의미가 됩니다.
- `ports`는 컨테이너 내부의 포트와 컨테이너 외부의 포트를 연결합니다. 이것 역시 `host:container`순서로, 예를 들어 `80:123`이라고 하면 컨테이너 내부의 `123`번 포트를 호스트의 `80`번 포트에 연결한다는 의미입니다.
- `expose`는 컨테이너 내부의 포트를 네트워크에 공개하겠다는 의미입니다. *그런데* docker compose를 사용하면 기본적으로 모든 컨테이너가 같은 네트워크에 연결되므로 이 명령어는 실제로는 아무런 의미가 없습니다. 그러나 이 명령어는 일종의 flag로 유용하게 사용됩니다. 아래에서 설명합니다.
- `entrypoint`는 도커 이미지가 띄워졌을 경우 수행될 *딱 하나의 명령어*입니다. 만약 여러 개의 명령어를 실행하고 싶다면 쉘 스크립트를 실행하도록 해야 합니다.
- 위 파일에서는 보이지 않지만, `command`라는 항목도 자주 사용됩니다. `command`는 `entrypoint`에 지정된 명령어에 따라 붙는 인자같은 것입니다. 예를 들어 `entrypoint`가 `echo`이고 `command`가 `hello world`라면 컨테이너가 실행될 경우 `echo hello world`가 실행됩니다. `command`와 `entrypoint`는 기능적으로는 차이가 없습니다만, `command`의 경우 덮어쓰는 것이 가능합니다. 그래서 보통 `entrypoint`로 명령어를 지정하고, `command`로 기본 옵션을 줍니다. 그러면 실행 시 `command`옵션만 주면 명령어는 그대로 두고 `command`부분만 덮어쓸 수 있어 편리합니다.

## 설명

위 이미지에서는 `nginx`컨테이너가 제일 흥미롭습니다. 이 서비스를 구동하는 서버는 wildcard domain을 사용하는데, 이는 할당받은 도메인 앞에 어떤 서브도메인이 오더라도 전부 해당 서버로 라우팅해주는 기능입니다. 예를 들어 위 서비스의 경우 `mydomain.com`을 할당받은 경우로 `service1.mydomain.com`, `service2.mydomain.com`, `asdf.fdsa.mydomain.com`, `helloworld.mydomain.com`등 그 어떤 서브도메인을 입력하더라도 반드시 이 서버로 라우팅됩니다. 그러면 서버에서는 비록  같은 포트로 요청이 들어왔을지라도 요청한 도메인을 보고 서로 다른 서비스로 연결해줄 수 있습니다. 이러한 기술을 reverse proxy라 합니다.

`nginx`는 이런 reverse proxy를 쉽게 구현할 수 있는 기능을 제공합니다. 그리고 `nginx-proxy` 컨테이너는 이 쉬운 구현을 더 쉽게 구현할 수 있는 방법을 제공합니다. 이 컨테이너는, 간략히 설명하자면, 같은 네트워크에 연결된 도커 컨테이너들을 훑어봅니다. 그리고 그중 `expose`를 설정했으면서 `VIRTUAL_HOST` 환경 변수를 가진 컨테이너를 찾습니다. 그리고 그 컨테이너의 `VIRTUAL_HOST`에 해당하는 도메인으로 요청이 들어올 경우 그 컨테이너로 포워딩해줍니다. 위 예시에서 아래의 두 컨테이너가 `VIRTUAL_HOST`환경변수와 쓸데없어 보이는 `expose`를 설정한 이유가 여기에 있습니다.

## 결과

결과적으로 각종 서비스를 한 서버에서 부담없이 돌릴 수 있게 되었습니다. 포트 번호도 신경쓸 필요가 없고, 좋은 점이 한두 가지가 아니네요. 특히 서비스를 재시작할 필요가 있을 때 고민없이 그냥 하면 된다는 점이 참 큰 장점인 것 같습니다.
