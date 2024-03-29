---
title: 유용한 SSH/SCP 명령어
tags:
  - tips
date: 2020-08-08T12:31:29.912Z
---

SSH / SCP 명령어는 주로 원격 서버에서 작업할 때 많이 쓰입니다. 알아 두면 유용한 명령어를 몇 개 정리해봤습니다.

- 아래에서 `로컬 머신`이라 함은 커맨드를 실행하는 바로 그 컴퓨터를 말하는 것입니다.
- 아래에서 `원격 서버`라 함은 내가 `로컬 머신`을 거쳐 제어하고자 하는 다른 컴퓨터를 말하는 것입니다.

### 원격 서버에 접속

```bash
ssh [username]@[hostname] -p [sshport]
ssh unknownpgr@my-webserver.server.io -p 1234
```

### 원격 서버에서 특정 명령어 실행

```bash
ssh [username]@[hostname] -p [sshport] command
ssh unknownpgr@192.168.0.2 -p 22 make
```

이렇게 하면 원격 서버에서 해당 커맨드가 실행된다.

### 원격 서버의 특정 포트와 포트포워딩
아래 예제들을 보면 `-N` 옵션이 붙어있는 것을 알 수 있는데, `-N` 옵션은 배쉬 셸을 띄우지 않는 옵션이다. 포트포워딩처럼 굳이 배쉬 셸을 쓸 필요 없을 때 유용하다.

```bash
ssh -N -L [localport]:[destserver]:[destport] [jumpserver]
ssh -N -L 9876:inta.server.com:80 public.server.com
```

아래의 예시를 실행하면 `localhost`의 `9876`포트를 `public.server.com`서버를 거쳐 `inta.server.com`서버의 `80`번 포트와 연결한다. 이는 보안 연결이 필요한 경우에 사용하면 좋다. 예를 들어, [code-server](https://github.com/cdr/code-server)에서도 다음과 같은 커맨드를 이용하여 code-server에 접속하는 것을 권장한다.

```bash
ssh -N -L 8080:127.0.0.1:8080 <instance-ip> #이렇게 한 후 브라우저에서 localhost:8080으로 접속한다.
```

### 원격 서버에서 로컬 머신으로 포트포워딩

```bash
ssh -R [remoteport]:[host]:[hostport] [remote]
ssh -R 8080:localhost:5000 remote.server.com
ssh -R 8080:www.google.com:80 remote.server.com
```

이 옵션은 좀 난해하다. 정확하게는 다음과 같이 작동한다.

> `remote` 서버의 `remoteport`포트가 로컬 머신을 거쳐서 `host`서버의 `hostport`로 연결되게 한다.

그러므로 두 번째 예시는 `remote.server.com`의 8080포트가 로컬 머신의 5000포트에 연결되도록 하며, 세 번째 예시는 `remote.server.com`의 8080번 포트가 로컬 머신을 거쳐서 `www.google.com`의 80번 포트에 연결되도록 한다. 따로 옵션을 주면 다양한 인터페이스에서 연결을 받을 수 있지만, 기본은 로컬호스트이다. 즉, 내가 웹브라우저로 `remote.server.com:8080`에 접속하면 접속이 되지 않지만, 원격 서버에서 `curl localhost:8080`으로 접속해보면 로컬 머신을 거쳐 원하는 목적 서버로 연결이 된다.

### 로컬 머신에서 원격 서버로 파일 전송하기

```bash
scp [local-file-path] [username]@[host]:[remote-file-path]
scp ~/file.txt unknownpgr@remote.server.com:"~/remote-path"
```

로컬 머신의 `local-file-path`에 있는 파일을 `host` 원격 서버의 `remote-file-path`디렉토리에 집어넣는다. 두번째 예시를 실행하면 로컬 머신의 `~/file.txt`파일이 `remote.server.com`서버의 `~/remote-path`디렉토리에 저장된다.

### 로컬 머신에서 원격 서버로 디렉토리 전송하기

```bash
scp -r [local-folder] [user]@[host]:[remote-dir]
```

위와 거의 똑같지만, 단일 파일이 아니라 디렉토리째로 복사한다.

### 원격 서버에서 로컬 머신으로 파일 전송하기

```bash
scp [user]@[host]:[remote-file] [local-dir]
```

이것 역시 로컬 머신에서 원격 서버로 전송하는 것과 완전히 똑같고, 순서만 바뀌었다. `host`원격 서버의 `remote-file`을 로컬 머신의 `local-dir`에 옮긴다. 마찬가지로 `-r`옵션을 주면 디렉토리째로 옮길 수 있다.
