---
title: 웹브라우저에서 검색할 때 어떤 일이 벌어지나?
tags:
  - computer structure
date: 2020-12-25T04:30:59.671Z
---

- 2021년 3월 28일 일부 업데이트합니다.
- 2021년 5월 27일 일부 업데이트합니다.

# 웹브라우저에서 일어나는 일들

어디서 듣기로, 기업에 입사할 때 이런 문제를 묻는 경우가 있다고 합니다.

> 웹 브라우저의 주소창에 http://google.com을 입력한 후 엔터를 누른다.
> 이후 웹 페이지가 표시될 때까지 일어나는 일을 아는 대로 설명해라.

저도 컴퓨터를 전공하면서 이런 것을 얼마나 상세히 대답할 수 있는지 궁금해져서 한 번 정리해보기로 했습니다.

아래 내용은 모두 UNIX/Linux 계열 운영체제를 기반으로 설명합니다.

## 하드웨어에서

먼저 키보드의 키가 눌리면, 내부의 스위치가 회로를 단락시킵니다. 그러면 하드웨어적으로 제작된 키보드 모듈에서 이를 감지하고 신호를 적절한 키코드로 인코딩하여 USB모듈로 전송합니다. 그러면 USB모듈에서는 USB 프로토콜에 따라 이 정보를 컴퓨터로 보냅니다.

- 아직 공부가 부족하여 키보드 모듈-키보드 내장 USB모듈 사이의 통신 프로토콜은 모릅니다.
- USB에 대해서도 상세히 알지 못하여(USB프로토콜은 I2C나 UART등과 다르게 매우 복잡합니다) 컴퓨터로 전송되는 과정은 설명하지 못하겠습니다.

그러면 컴퓨터에서는 USB신호를 받습니다. 이 신호는 컴퓨터의 USB 컨트롤러를 통해 수신되는데, USB 컨트롤러는 USB 송수신 처리를 위한 전용 하드웨어입니다. 이 모듈은 수신한 신호를 적절히 디코딩하여 CPU와 통신하게 됩니다.

USB 컨트롤러는 다양한 방법으로 CPU와 통신하는데, 대표적으로 Direct Memory Access (DMA)가 있습니다. USB 데이터를 받은 후에 CPU가 이것을 직접 읽어 오려고 하면 많은 클럭이 소모됩니다. 그러므로 USB 컨트롤러가 RAM에 직접 접근하여 미리 지정된 특정 부분에 데이터를 쓰면, 그 동안 CPU는 다른 일을 하고 있다가 쓰기가 끝나면 RAM에서 바로 데이터를 읽을 수 있습니다. 이렇게 직접 메모리에 데이터를 쓴다고 하여 이 방법을 DMA라 부르는 것입니다.

컴퓨터의 종류에 따라 그 통신 과정은 달라질 수 있습니다. 예컨대 우리가 사용하는 일반적인 컴퓨터의 경우, CPU가 Front-Side Bus (FSB)를 통해 north bridge와 연결되고, north bridge와 ram, south bridge가 버스를 통해 연결되며, south bridge가 USB 드라이버와 연결됩니다. 그러나 제가 좋아하는 ARM Cortex M4 MCU의 경우 Advanced High-performance Bus (AHB)를 통해 USB 컨트롤러와 core, RAM이 직접 연결되어있습니다.

이렇게 DMA를 통해 RAM에 데이터를 썼으면 CPU에게 알려주어야 합니다. 따라서 USB컨트롤러는 인터럽트 신호를 발생시킵니다. 이 인터럽트 신호 또한 컴퓨터의 종류에 따라 처리 과정이 달라집니다.

우리가 사용하는 일반적인 컴퓨터에서는 8259A와 같은 인터럽트 컨트롤러(이것 역시 하드웨어입니다)로 신호가 전달됩니다. USB 컨트롤러와 같은 다른 컨트롤러들과 인터럽트 컨트롤러는 IRQ라 하는 line으로 연결되어있습니다. IRQ 라인은 물리적으로는 그냥 1bit를 전송할 수 있는 도선입니다. 8259A칩과 같은 인터럽트 컨트롤러의 경우 IRQ 0~7까지 7개의 IRQ라인을 가지고 있으며, Master와 Slave 모드로 동작할 수 있어 두 개를 cascade 구조로 연결할 수 있고, Master의 IRQ2가 Slave의 인터럽트를 받아들이기 위해 사용되므로 총 15개의 인터럽트가 사용될 수 있습니다. Master는 결과적으로 INTR 라인을 통해 CPU에게 직접 시그널을 보냅니다. 이 INTR 라인 역시 그냥 하나의 도선입니다.

라즈베리파이나 모바일 기기 등에서 사용하는 MCU는 System on Chip (SoC)라고 해서 이런 기기들이 모두 프로세서 내부에 내장되어있습니다. 예를 들어 상기한 Cortex M4 MCU의 경우 Nested Vector Interrupt Controller (NVIC)이라는 인터럽트 컨트롤러가 아예 코어 바로 옆에 붙어있습니다. 이 경우 모든 인터럽트는 NVIC을 통해서 처리됩니다. 예를들어서 Core에서 발생하는 System Exception과 같은 인터럽트 역시 코어가 자체적으로 처리하는 것이 아니라, 먼저 signal을 NVIC에게 보내면 NVIC이 이를 처리합니다. 굳이 이렇게 복잡하게 구성된 이유는 NVIC의 경우 Interrupt Vector Register를 통해 인터럽트의 우선순위를 사용자가 마음대로 조정할 수 있도록 하기 위해서입니다.

코어는 INTR 라인을 통해 인터럽트 시그널을 받으면 일반적으로 미리 지정된 특정한 주소로 점프하여 인터럽트 루틴이 실행되며, 이는 context change와 유사하게 CPU의 일반 레지스터 및 컨텍스트를 스택에 저장한 후 지정된 주소로 분기하는 방식으로 이루어집니다. 이후의 처리는 일반적으로 커널에서 이루어지나, 상기한 NVIC의 경우 NVIC 자체에 인터럽트에 따라 어떤 주소로 분기할지 정해진 인터럽트 벡터 레지스터가 있어 프로세서가 커널의 개입 없이 적절한 인터럽트 서비스 루틴을 실행합니다.

## 커널에서

상기한 바와 같이 적절한 서비스 루틴이 실행되면 커널은 어떤 인터럽트인지를 알아낸 후 적절한 처리를 수행해야 합니다. NVIC의 경우 각 인터럽트마다 다른 서비스 루틴이 실행되므로 이를 별도로 처리할 필요가 없지만, 고정된 서비스 루틴이 실행되는 경우 어떤 인터럽트 요청 (Interrupt Request, IRQ)이 서비스 루틴을 실행시켰는지 알아낼 필요가 있습니다. 일단 저는 리눅스 시스템만 공부했기 때문에, 리눅스 커널을 기준으로 설명하겠습니다. 이 경우 커널은 인터럽트 상태 레지스터 (ISR)를 읽게 되는데, 이는 CPU 내부의 레지스터가 아닌 인터럽트 컨트롤러의 레지스터입니다.

컴퓨터의 종류에 따라 이 레지스터를 읽어오는 방법도 달라집니다. I/O Space라고 하여, 이런 외부 장치를 위한 주소 공간이 따로 있는 경우에는 특수한 instruction을 사용하여 레지스터를 읽어올 수 있습니다. 대표적으로 x86 코어가 I/O space를 따로 가지고 있는데, 이 경우 일반적인 `MOV` instruction으로는 CPU 외부의 레지스터에 접근할 수 없으며, `IN AL, DX` (Input byte from I/O port in DX into AL) 등의 특수한 instruction을 사용해야만 합니다.

반대로 앞서 언급한 Cortex M4 MCU는 Memory Mapped IO를 사용합니다. 그러므로 모든 주소 공간은 메인 메모리 주소 공간과 같은 공간으로 통합되어 있고, `MOV` 등 일반적인 어셈블리가 사용가능할 뿐만 아니라 C언의의 포인터 연산을 사용해서도 외부 레지스터에 접근할 수 있어 편리합니다.

구체적으로는, 코어가 인터럽트 신호(INTR signal)를 받으면 다시 (INTA, Interrupt Accepted) 신호를 보냅니다. INTA역시 하드웨어적으로 구현된 시그널로, INTR와 마찬가지로 단일 라인입니다. INTA 신호를 받으면 인터럽트 컨트롤러가 Data Bus에 적절한 인터럽트 번호를 전송합니다.

이렇게 인터럽트 레지스터를 읽어왔으면 적절한 인터럽트 서비스 루틴을 실행해야 합니다. 커널은 인터럽트 번호 (IRQ 번호)를 인덱스로 사용하여 인터럽트 벡터 테이블에서 적절한 서비스 루틴을 찾은 후 실행합니다. 일부 기기는 인터럽트를 발생시킨 기기에 따라 IRQ가 고정되어있습니다. 예를 들어 플로피 디스크의 경우 항상 IRQ 6을 요청합니다. 그러나 최근 대부분의 기기들은 그렇지 않으며, 디바이스 드라이버가 탐사(probe)라는 과정을 통하여 동적으로 IRQ를 등록할 수 있습니다.

- 구체적으로 디바이스 드라이브의 Probe 과정이 어떻게 진행되는지는 나중에 작성하기로.

인터럽트 루틴이 실행될 때 원하는 처리를 전부 할 수 있으면 참 좋겠지만, 이러한 서비스 루틴들은 기존 CPU의 실행을 중단하고 실행되는데다 다른 인터럽트가 또 발생할 수 있기 때문에 최대한 빨리 할 일을 마치고 빠져나와야 합니다. 이를 위해 `Bottom Halves`, `Task Queues`, `Softirq`, `Tasklet`, `Work queues` 등 다양한 매커니즘이 제안되었습니다.

- 이중 몇 개만 설명하고자 하는데, 지금 머리가 터질 것 같으니 이것도 나중에 쓰기로

이러한 인터럽트 서비스 루틴들은 디바이스 드라이버가 등록하는 것이며, 디바이스 드라이버는 역할에 따라 적절한 처리를 수행합니다. 이후 인터럽트가 안전하게 끝나면 이제 대기 큐에 미리 정의돼있었던 이벤트가 동작합니다. 커널에서는 적절한 데이터 처리를 거친 후 특수한 커널 함수(`copy_to_user`)를 사용하여 키 정보를 유저 메모리로 복사합니다. 이는 커널 메모리는 실제 물리적 메모리 주소를 사용하는 반면, 유저 메모리는 페이징에 의해 이루어지는 가상 메모리 주소를 사용하므로 직접 복사가 불가능하기 때문입니다. 그리고 커널이 반환하면 CPU는 유저 모드로 동작하게 되며, 유저 프로세스가 다시 실행됩니다.

## 유저 프로세스에서

유저 프로세서에서는 키 값을 통하여 이 키가 엔터라는 것을 인지하고 작업을 시작합니다. 추후 이루어질 작업은 시간을 꽤 요구하기 때문에, UX를 방해하지 않기 위해 스레드를 만들어 스레드에서 작업이 이루어집니다. UNIX운영체제에서 스레드는 주소 공간을 공유하는 다른 프로세스에 불과해서, 실제로는 프로세스가 하나 만들어진다고 봐도 되겠습니다.

이렇게 만들어진 스레드에서는 주소창에 입력된 주소를 분석하여 그 주소가 `google.com`이고 프로토콜이 `http`임을 알게 됩니다. 만약 유저가 잘못된 주소를 입력했다면 (e.g. 프로토콜을 생략하거나, URL로 사용할 수 없는 문자가 사용되는 등) 이를 적절히 수정하는 작업 (e.g. 적절한 프로토콜을 자동으로 추가하거나, URL encode를 수행하는 등) 또한 이루어집니다. 그러면 브라우저에서는 적절한 http 요청을 구성하는데, 여기에는 요청한 주소, IP, 요청하는 파일, 브라우저 정보, 쿠키 등 다양한 정보가 담겨 있습니다.

### DNS

이때 만약 컴퓨터가 도메인 정보를 미리 알아서, `google.com`의 IP address를 알고 있다면 그리로 패킷을 송신합니다. 그러나 도메인 정보를 모르는 경우 DNS쿼리를 통해 해당 도메인이 가리키는 IP address를 알아 내야 합니다. 저는 이 과정이 커널에서 이루어지는 줄로 알고 있었는데, 조사 결과 어플리케이션 레벨에서 이뤄진다는 걸 알게 됐습니다. **리눅스 커널에는 DNS 질의와 관련된 커널 함수 등이 없습니다.**

먼저 도메인 탐색 과정은 커널 레벨에서 이뤄지는 것이 아니기 때문에, 각 프로그램마다 이를 구현하는 데에는 차이가 있습니다. 예를 들어 `ping` 명령어의 경우 `/etc/nsswitch.conf` 파일을 참조, `/etc/hosts`, `/etc/resolv.conf`, `/etc/hostname` 를 참조합니다. 반면 `host` 명령어의 경우 곧바로 `/etc/resolv.conf` 파일을 참조합니다.

- `/etc/hosts`파일은 DNS가 작동할 수 없는 환경에서 hostname을 IP address로 변환하기 위한 lookup table입니다. 기본적으로는 `localhost`와 자신의 `hostname`(기기 이름)에 대한 변환만 적혀 있습니다.
- `/etc/hostname` 파일에는 말 그대로 hostname이 적혀 있습니다.
- `/etc/resolv.conf`파일에는 네임 서버의 주소들이 적혀 있습니다.

브라우저 역시 `/etc/resolv.conf` 파일에 적힌 DNS들에 질의할 것이고, 그 질의 자체는 역시 어플리케이션 레벨에서 이뤄질 것입니다. 물론 브라우저는 빠른 연결을 위해 내부적으로 캐시를 가지고 있을 것입니다. 적어도 크롬의 경우에는 내부적으로 도메인, IP간의 변환을 저장하고 있는 것이 분명한데, 왜냐하면 예전에 ARP Spoofing 공격을 시험해봤을 때 크롬은 보안 경고를 띄우면서 접속을 차단했기 때문입니다.

### Socket

이 요청 데이터가 인터넷으로 전송되기 위해서는 소켓을 생성해야 합니다. 브라우저에서는 제가 알기로 약 6개 정도의 소켓을 connection pool로 생성해두고 이용하는데, 이는 이 이상 소켓을 생성하게 되면 성능의 하락이 발생하기 때문이라고 합니다.

- 진짜 그런지 조사 필요!

이렇게 생성한 소켓은 Linux 운영체제에서는 하나의 파일로 인식되기 때문에 일반적인 write 연산을 통해서 커널에 데이터를 전달하게 됩니다. TRAP 명령어를 통해 프로세스가 커널 모드로 전환되고, 커널 코드는 유저 스페이스에서 커널 스페이스로 데이터를 복사해옵니다.

## 커널에서

### Socket Interface Layer

유저스페이스에서 생성된 데이터는 TCP/IP 방식을 따라 전송됩니다. 먼저 전달받은 데이터는 socket interface layer를 통해 transport layer로 전달됩니다. 이때 socket interface layer은 적절한 프로토콜에 해당하는 transport layer의 함수를 호출합니다. 우리는 TCP/IP 프로토콜을 사용하는 브라우저를 사용중이기 때문에 socket interface layer에서는 `tcp_sendmsg` 함수를 호출할 것입니다.

### Transport Layer

이제부터는 transport layer의 영역입니다. TCP를 사용중이므로 먼저 connection establish 단계가 수행됩니다. 정상적으로 connection이 생성된 경우, 실제 데이터 전송 과정이 이어집니다. 이 과정에 도달하면 user space에서 kernel space로 데이터 복사가 발생하며, `sk_buff` 구조체가 생성됩니다. 이 이전까지의 과정에서는 어플리케이션에서 생성한 데이터 자체는 복사되지 않으며, 데이터의 주소를 담고 있는 `io vector`만이 복사됩니다.

이 과정에서는 또한 packet segmentation이 이뤄집니다. Packet segmentation이란 전달해야 할 데이터가 Maximum Transmission Unit(MTU)보다 클 경우 이를 여러 개의 packet으로 쪼개는 것을 말합니다. 이후 `tcp_transmit_skb` 함수가 호출되고, 생성된 패킷의 포인터가 network layer (IP layer)로 전송됩니다.

### Network Layer

이 과정에서는 패킷에 IP header가 추가됩니다. Routing lookup table을 참조하여 어떤 network interface로 패킷을 전달할지가 결정되며, 이렇게 생성된 패킷은 서버로 전달돼야 하므로 data link layer로 전달됩니다.

물론 data link layer에서 받은 패킷 중 자신에게로 전달되는 패킷이 있다면 IP layer에서는 transport layer를 호출할 것입니다.

### Data Link Layer

데이터 링크 레이어에서는 단순히 IP Layer에서 받은 패킷을 하드웨어로 전송하기 전 중개하는 역할만을 합니다. 그래서 이 레이어를 queuing layer라 부르기도 합니다. 패킷은 적절히 queue에 들어가서 대기하다가 하드웨어, 이 경우에는 Network Interface Card (NIC)이 데이터를 받을 수 있게 되면 DMA를 통해 NIC에 전달됩니다. 이까지의 과정은 모두 process context에서 진행됩니다.

### Physical Layer

이제부터는 physical layer에 영역에 속합니다. NIC은 받은 패킷을 잘 인코딩하여 프레임으로 만듭니다. 패킷에는 IP주소 등 3계층 이상의 데이터가 들어있고, 프레임에는 MAC address나 checksum등 3계층~2계층까지의 정보가 들어있습니다.

이렇게 만들어진 프레임은 라우터(게이트웨이)로 전송됩니다. 만약 라우터가 유선으로 직결되어있다면 라우터로 패킷을 바로 전송할 수 있습니다. 그러나 무선랜 등 다른 매체의 간섭이 있을 경우 다양한 충돌 대비 매커니즘이 사용됩니다. 제가 알기로는 무선 랜에서는 Carrier Sense Multiple Access / Collision Avoidance (CSMA/CA) 기법을 사용합니다. 이 경우 먼저 다른 디바이스들에게 프레임을 전송할 것임을 알리고(Request to Send, RTS), 이후 목적 디바이스가 프레임을 수신할 수 있다고 다시 알려주면 (Clear to Send, CTS) 미리 정해진 시간동안 독점적으로 carrier를 사용하며 데이터 전송이 이루어집니다. Ethernet의 경우 CSMA/CD기법을 사용하며, 이 경우 carrier를 사용하는 디바이스가 없을 경우 데이터를 전송합니다.

그런데 이 두 케이스 모두 한 번에 전송할 수 있는 데이터 양에 한계가 있습니다. IEEE 802.3 Ethernet 프로토콜에 따르면 최소 전송 가능한 데이터는 (프레임 전체로 따졌을 때) 64byte, 최대 전송 가능한 데이터는 1518byte입니다. 최소 데이터는 CSMA/CD의 효율적인 전송을 위해 필요하며, 최대 전송 가능한 데이터는 carrier의 무기한 독점을 막기 위해 필요합니다.

이는 우리가 일반적으로 전송하기를 원하는 수 킬로바이트에서 수 메가바이트의 데이터에 비해 턱없이 부족한 길이입니다. 따라서 데이터는 여러 조각으로 나누어져 전송되며, 수신측에서 순서를 고려하여 합칩니다. 여기에는 Sliding window를 사용하는 Automatic Repeat Request (ARQ)등의 방식이 사용됩니다.

라우터에서는 프레임을 받으면 순서대로 버퍼에 넣어두었다가 하나씩 꺼내어 처리합니다. 프레임을 꺼낸 후에는 다시 디코드하여 IP주소를 확인하고, 이후 IP주소에 맞는 다른 포트로 프레임을 다시 내보냅니다. 이 과정에서 3계층 정보는 그대로 유지되지만 2계층 정보는 매 hop마다 바뀝니다. 이는 3계층 정보는 출발지와 목적지 정보이고, 2계층 정보는 현재 라우터와 다음 라우터 위치이니 당연히 그렇게 됨을 알 수 있습니다.

이렇게 라우터를 여러 번 거친 후, 구글 서버에 도착하게 됩니다.

## 서버에서

서버에서는 보낼 때 했던 방식의 정확히 반대 방식으로 패킷을 받습니다. Physical layer, data link layer, network layer, transport layer를 거쳐 HTTP request가 서버로 전달됩니다. HTTP request에는 원하는 데이터가 무엇인지 적혀있으므로 서버는 해당하는 데이터를 보내줍니다. 이 경우에는 구글 웹 사이트의 html파일이 됩니다. 물론 이 과정에서 서버에서는 키보드 입력과 비슷하게 커널을 통한 파일시스템 접근, 네트워크 카드 접근 등이 이루어집니다. 이 경우에는 앞서 말한 키보드와 다르게 블록 디바이스 드라이버가 사용됩니다.

- 그런데 알려진 바에 따르면 구글에서는 SSD나 HDD등 일반적인 보조기억장치 대신 RAM DISK라는 신기한 장치를 사용한다고 합니다. 그래서 커널 아래에서 어떤 일이 벌어지는지는 잘 모르겠습니다.

- 또 웹서버에서는 html파일 등을 정적으로 서비스할 수도 있지만 EJS나 Flask등을 사용하여 동적으로 서비스할 수도 있습니다. 구글 메인 페이지를 서비스할 때 이러한 server side rendering이 이루어지는지는 잘 모르겠습니다.
- 구글 서버에서는 Docker등 container를 사용하여 가상화를 하고 있고, 이를 통한 load balancing도 이루어지고 있습니다. 그러나 이 과정 역시 구체적으로 어떻게 동작하는지는 모릅니다. 다만 최신 Kubernetes는 Completely Fair Scheduler를 사용하여 스케줄링을 수행한다고 합니다.

결과적으로 이 데이터는 수신 과정의 정 반대 과정을 거쳐 사용자 컴퓨터로 돌아옵니다.

## 다시 네트워크에서

이때 유저가 public network에 바로 연결되어있다면 좋겠지만, 일반적으로는 private network에 연결되어있습니다. 그러므로 서버 측에서는 유저의 위치를 알지 못하고, gateway가 있는 router의 public address로 패킷을 전송합니다. 그러면 게이트웨이에 있는 Network Address Translation (NAT) Table에서 외부 포트에 해당되는 내부 포트로 패킷을 포워딩해줍니다.

## 다시 유저 프로세스에서

이제 유저는 전송 과정의 정 반대 과정을 거쳐 html파일을 받습니다. 이제 브라우저에서는 이 데이터를 파싱한 후 유저에게 렌더링해줍니다. 파싱 과정에서 다른 리소스를 요구하는 태그가 발견될 경우, 다시 이 모든 과정을 거쳐서 리소스를 로드한 후 DOM을 변경하고, 새로 렌더링합니다. 수행할 자바스크립트가 있으면 수행합니다. 이 과정은 물론 약간의 blocking이 있기는 하나, JavaScript에서 single thread로 동작합니다. 이를 위하여 event loop가 사용됩니다. (실제로는 file system이나 network등에서는 multithread 방식으로 동작하지만, 단일 스레드로 동작한다고 생각해도 됩니다.) Event loop는 간단하게는 call stack과 callback queue로 이루어지는데, 만약 DOM or Ajax등 비동기 작업이 필요할 경우 callback queue에 해당 작업을 push한 후 그냥 넘어갑니다. 이후 call stack이 모두 빌 경우 callback queue에서 하나를 꺼내어 수행합니다.

## 결과

이러한 과정을 거쳐서, 유저가 엔터 키를 누르면 브라우저에 구글 메인 화면이 표시됩니다.

# 참고문헌

- https://www.keil.com/pack/doc/CMSIS/Core/html/group__NVIC__gr.html
- https://www.motioncontroltips.com/what-is-nested-vector-interrupt-control-nvic/
- https://wiki.kldp.org/Translations/html/The_Linux_Kernel-KLDP/tlk7.html
- http://books.gigatux.nl/mirror/kerneldevelopment/0672327201/ch07lev1sec1.html
- https://docs.google.com/document/d/1VtcZkqtvVFxYowI0PG8O0PUDhvZm8wO_BiUmV7tGdwI/edit
- http://www.qnx.com/developers/docs/qnxcar2/index.jsp?topic=%2Fcom.qnx.doc.neutrino.prog%2Ftopic%2Ffreedom_IO_space_vs_memory_mapped.html
- https://datasheetspdf.com/pdf/45361/IntelCorporation/8259A/1
- https://en.wikipedia.org/wiki/Advanced_Microcontroller_Bus_Architecture
- https://www.cnx-software.com/wp-content/uploads/2014/09/STM32F7_Block_Diagram.png
- https://en.wikipedia.org/wiki/Northbridge_(computing)
- https://en.wikipedia.org/wiki/Southbridge_(computing)
- https://en.wikipedia.org/wiki/Intel_8259
- https://en.wikipedia.org/wiki/Programmable_interrupt_controller
- https://www.embien.com/blog/arm-interrupt-controllers/
- https://stackoverflow.com/questions/1723481/relation-between-usb-and-pci
- https://zwischenzugs.com/2018/06/08/anatomy-of-a-linux-dns-lookup-part-i/
- https://tldp.org/LDP/solrhe/Securing-Optimizing-Linux-RH-Edition-v1.3/chap9sec95.html
- https://en.wikipedia.org/wiki/Resolv.conf
- https://en.wikipedia.org/wiki/Packet_segmentation
- https://www.cs.dartmouth.edu/~sergey/netreads/path-of-packet/Network_stack.pdf
