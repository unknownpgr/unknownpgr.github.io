---
title: VPN으로 인한 네트워크 문제 해결
tags:
  - network
date: 2023-12-29T09:57:44.019Z
---

VPN을 다루던 중 네트워킹 문제가 발생했고, 해결한 경험을 정리합니다.

# Problem

상황은 다음과 같습니다.

- Server A와 Server B 사이에 통신을 하려고 합니다.
- Server A와 Server B는 서로 다른 private network에 있어 VPN을 통해서만 접근할 수 있습니다.
- VPN은 상용 VPN 네트워크를 사용합니다.
- Server B에는 VPN client가 설치되어 있고 작동 중입니다.
- Server B의 네트워크 및 VPN 설정 등은 건드릴 수 없습니다.
- Server A의 설정은 변경할 수 있으나, public IP를 얻는 것은 불가능합니다.
- 이 작업은 제 노트북(Host)에서 SSH로 서버에 접속하여 진행합니다.
- Host는 Server A와 같은 private network에 있습니다.

그래서 다음 과정을 시도했습니다.

1. Server A에 VPN client를 설치합니다.
2. Server A에서 VPN을 연결합니다.
3. Server A에서 Server B로 통신을 시도합니다.

그런데 이때 2번 과정을 수행하자마자 Server A에 접속되어있던 SSH가 끊어졌습니다.

## Diagnosis

여러 진단을 해 본 결과 다음과 같은 이유로 인해 문제가 발생했습니다.

- Server A에서 VPN을 연결하면, Server A에 VPN 네트워크 대역의 트래픽을 VPN 서버로 라우팅하는 라우팅 테이블이 추가됩니다.
- 그런데 우연히 Server A의 private network가 VPN 네트워크 대역의 subnet이었습니다.
- Host에서 Server A로 접속할 때는 Server A의 private network를 통해 접속했기 때문에 inbound traffic은 정상적으로 Server A로 전달됩니다.
- 그러나 outbound traffic은 Server A의 private network 대역이 VPN 네트워크 대역에 포함되어 있기 때문에 VPN 서버로 전달됩니다. routing table의 우선순위가 default gateway보다 높기 때문입니다.
- VPN 서버는 Host의 IP 주소를 알지 못하므로 라우팅이 실패하고, Host에서 Server A로 접속할 수 없게 됩니다.

## Solution

먼저 매번 테스트를 할 때마다 네트워크가 끊어지면 곤란하므로 컨테이너를 만들어서 테스트를 진행했습니다. 컨테이너를 사용하면 네트워크 네임스페이스를 분리하기 때문에 routing table 등이 격리되고, 따라서 호스트 머신에 영향을 주지 않습니다.

이때 문제를 조금 더 구체적으로 설명하면 다음과 같습니다.

- Server A에는 컨테이너 형태의 서비스가 실행 중입니다.
- 80번 포트를 개방한다고 가정하겠습니다.
- Server A의 private network ip 주소와 Server A가 할당받은 VPN ip 주소 모두에서 80번 포트로 접속이 가능해야 합니다.

이 문제를 해결하기 위해 다음과 같은 방법을 사용했습니다.

- VPN 클라이언트를 포함하는 컨테이너를 띄우고, 80번 포트를 포워딩합니다.
  - 이로부터 private network와 VPN 네트워크 대역 모두에서 80번 포트로 접속이 가능해집니다.
- 서비스 컨테이너의 네트워크 네임스페이스를 VPN 컨테이너의 네트워크 네임스페이스로 설정합니다.
  - `--net=container:<container-name>` 옵션을 사용하면 됩니다.
  - docker copmose를 사용한다면 `network_mode: "service:<container-name>"` 옵션을 사용할 수 있습니다.
  - 이 경우 두 컨테이너는 같은 network namespace를 사용하므로 포트 충돌이 발생할 수 있으므로 주의해야 합니다.
- Source IP address가 container network 대역일 경우 container network의 default gateway로 라우팅하는 routing rule을 추가합니다.
  - 이것은 일반 룰로는 만들 수 없고, policy based routing을 사용해야 합니다.
  - 다음과 같이 룰을 추가합니다.
    - `ip rule add from <container-network> table <table-name>`
    - `ip route add <server-a-private-network> via <container-gateway> dev <container-interface> table <table-name>`

마지막과 같이 할 수 있는 이유는 어떤 경로로 트래픽이 전달되는지에 따라 inbound traffic의 destination ip address, 즉 outbound traffic의 source ip address가 달라지기 때문입니다.

- Server A의 private network를 통해 접속할 경우 docker network에서는 NAT를 수행합니다.
  - 그러므로 destination ip address가 Server A의 private network ip address가 아닌 container network ip address가 됩니다.
- VPN 네트워크를 통해 접속할 경우, VPN 자체를 컨테이너 내부에서 연결했으므로 destination ip address가 VPN 네트워크 대역이 됩니다.
- TCP connection은 `src ip addr, src port, dst ip addr, dst port`로 식별되므로 outbound traffic의 source ip address 역시 이에 따라 달라집니다.
- 즉, outbound traffic의 source ip address에 따라, 심지어 그 destination이 두 네트워크 모두에 포함되는 경우라도, 다른 routing rule을 적용할 수 있습니다.

# References

- https://www.tldp.org/HOWTO/Adv-Routing-HOWTO/lartc.netfilter.html
- https://www.tldp.org/HOWTO/Adv-Routing-HOWTO/lartc.rpdb.multiple-links.html
- https://stackoverflow.com/questions/31435640/ip-route-add-by-specifying-source-address-in-the-same-network
- https://superuser.com/questions/376667/how-to-route-only-specific-subnet-source-ip-to-a-particular-interface
