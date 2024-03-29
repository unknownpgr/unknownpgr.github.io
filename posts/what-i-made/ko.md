---
title: 만들어본 것들
tags:
  - dev
date: 2023-09-03T06:15:42.023Z
---

이 글에서는 제가 만들었던 것들을 간단히 정리해두려고 합니다. 저는 필요한 것을 직접 만들어 문제를 해결할 수 있는 능력을 중요하게 생각하는데, 막상 다른 사람들에게 소개하려고 하니 정리가 잘 안 됐던 적이 많았기 때문입니다.

### 일기장

일기장은 제가 필요에 따라 개발을 배워가면서 만든, 유용하게 사용하고 있는 첫 번째 프로그램이자, 만들면서 가장 많은 것을 배운 프로그램입니다. 말 그대로 제 일기이므로 공개하지 못하는 점이 아쉽습니다.

### [부동산 중개업무 프로그램](https://real-estate.unknownpgr.com/)

공인중개사 업무를 하시는 부모님을 도와드리기 위해 만든 서비스입니다. 현재는 개인용 서비스이지만, 전역 후 비즈니스로 발전시킬 계획입니다.

### [더폼](https://the-form.io/)

더폼은 현재 MAU 1만 정도를 기록하고 있는 설문조사 서비스입니다. 소프트웨어 마에스트로 과정을 진행하며 만들었습니다.

### [Route53 DDNS](https://github.com/unknownpgr/route53-ddns)

AWS Route53의 DNS 서비스를 이용해서 동적 DNS를 구현했습니다. 특정 시간마다 현재 IP와 가장 최근에 업데이트한 IP를 비교하여 IP가 달라진 경우 Route53의 A 레코드를 업데이트합니다. 컨테이너 형태로 쿠버네티스에 올려서 사용하고 있습니다.

### [EC2 Controller](https://github.com/unknownpgr/ec2-webui)

군에서 프로그래밍을 하기 위해 EC2 Windows desktop instance를 사용하고 있습니다. 인스턴스를 24시간 켜놓으면 비용이 과다하게 들고, 매번 콘솔에 접속해 켜고 끄기는 불편해서 웹 UI를 만들었습니다. EC2를 켜고 끄거나 하루 중 특정한 시간에 자동으로 켜지고 꺼지도록 설정할 수 있습니다.

### [HTTP Tunneling](https://github.com/unknownpgr/http-tunnelling)

사설망에 있는 HTTP 서버에 접속하기 위해 간단한 터널링을 수행하는 서버를 만들었습니다. 목적 서버에서 스크립트를 실행하면 URL이 발급되고, 해당 URL을 통해 사설망 내부의 서버에 접속할 수 있습니다.

### [블로그](https://unknownpgr.com)

이 블로그도 직접 만든 것 중 하나입니다. React+TS+Vite / Node.js+Koa 를 사용하고 있습니다.

### [SSH Brute-force Analyzer](https://github.com/unknownpgr/ssh-brute-force-analyzer)

제 서버에는 항상 수많은 SSH 브루트포스 공격이 들어옵니다. 그래서 이 공격을 분석해보고자 ssh처럼 보이는 가짜 서버를 열고 공격을 받아보는 프로그램을 만들었습니다. 공격자의 IP, 로그인하기 위해 시도한 계정, 비밀번호를 모두 기록합니다. 이를 통해 공격자의 행동 패턴을 분석할 수 있습니다.

### [Literature Review Checker](https://github.com/unknownpgr/literature-review-checker)

예전에 연구실에서 선행연구조사를 위해 수십~수백 개 규모의 논문들을 읽을 때, 주제와 무관한 논문을 빠르게 제외할 수 있도록 간단한 프로그램을 만들었습니다.

### [더치페이 계산기](https://github.com/unknownpgr/dutch-calc)

전에 여행을 가서 더치페이를 계산하느라 애먹은 적이 있습니다. 그래서 더치페이 계산기를 만들었습니다.

- 낱개 물건의 가격이 주어진 경우 (각자 물건을 하나씩 사고 계산은 한 명이 한 경우)와 전체 가격이 주어진 경우 (물건 하나를 한 명이 사서 여럿이 나눠 가진 경우, 음식 등)를 모두 계산할 수 있습니다.
- 각 멤버가 각 멤버에게 주어야 하는 가격을 계산해줍니다.

### [영화 서버](https://github.com/unknownpgr/movie-server)

지금은 사용하지 않지만, 전에는 군에서 기가지니를 사용했었습니다. 기가지니를 사용하면 TV로 웹사이트에 접속할 수 있습니다. 그래서 영상을 올려 놓고 기가지니로 볼 수 있는 웹사이트를 만들었습니다.

- 리모컨 숫자 버튼을 사용하여 영상을 앞/뒤로 돌릴 수 있습니다.
- 자막이 있는 영상의 경우 자막 싱크를 맞추는 기능도 있습니다.
- 특히 간부가 갑자기 들어왔을 때를 대비해서 화면 전체를 빠르게 감추는 기능도 구현되어 있습니다.
- 이 사이트에서 유튜브 등으로 빠르게 이동할 수 있는 단축 링크 버튼이 있습니다.

### [시스템 볼륨 컨트롤러](https://github.com/unknownpgr/system-volume)

군 내 사이버지식정보방의 컴퓨터 중에는 볼륨 조절이 막혀 있는 것들이 있습니다. 키보드의 볼륨 키 이벤트를 전송하는 프로그램을 만들어서 시스템 볼륨을 조절할 수 있도록 했습니다.

### [vcf2csv](https://github.com/unknownpgr/vcf2csv)

입대하면서 훈련소에 들어가기 전 종이로 전화번호부를 만들기 위해 vcf 파일을 csv 파일로 변환하는 프로그램을 만들었습니다.

## 여담: 사용 중인 오픈소스

완성도 높은 오픈소스가 있는데도 모든 것을 직접 만드는 것은 바퀴를 재발명하는 일입니다. 저는 필요에 따라 다양한 오픈소스를 사용하고 있습니다.

- EC2 인스턴스에 접근하기 위해 `Guacamole`를 사용중입니다.
- 토렌트를 다운받을 때가 종종 있어 `qBittorrent Web UI`를 사용중입니다.
- [File Browser](https://filebrowser.org/)를 사용하여 파일을 관리하고 있습니다.
- 중요한 도커 이미지들을 관리하기 위해 `Harbor`를 사용중입니다.
