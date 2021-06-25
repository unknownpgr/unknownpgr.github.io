---
title: 쿠버네티스 클러스터 구축[1] - 가상 머신
category: kubernetes

---

![Kubernetes](imgs/favicon.png)

바로 전 포스트를 보시면 아시겠지만 이번에 괜찮은 성능의 미니 컴퓨터를 하나 구매하게 됐습니다. 이걸 구매한 주요 이유 중 하나가 쿠버네티스 공부였습니다. 그래서 쿠버네티스를 한 번 설치해봤고 그 과정을 정리하려고 합니다.

# Vagrant

사실 저는 이전에 쿠버네티스를 아주 약간 건드려본 적이 있습니다. 그때는 잘 기억은 나지 않지만 뭔가 설치를 잘못 했어서 한참을 고생하다 포기했었습니다. 그때는 제가 가상 머신을 쓸 생각을 못 했어서 그냥 호스트 컴퓨터에 쿠버네티스를 깔았다 지웠다를 반복했었습니다. 그러나 이번에는 그런 일이 일어나지 않도록 Vagrant를 이용하여 가상 머신을 구축한 후 그 위에서 쿠버네티스 설치를 진행하였습니다.

Vagrant는 일종의 Infrastructure as Code (IaC) 기반의 가상 머신 관리 도구입니다. IaC은 그 이름처럼 어떤 인프라를 코드 형태로 관리할 수 있는 체계를 말합니다. 이때 코드라 함은 `yaml`이나 `json`이 될 수도 있고 말 그대로 `python` 등 스크립트가 될 수도 있습니다. Vagrant는 `Vagrantfile`이라는 설정  파일로부터 가상 머신을 생성할 수 있도록 해 줍니다. 그러므로 `Vagrnatfile`만 가지고 있다면 언제나 똑같은 가상 머신을 생성할 수 있습니다. 그래서 똑같은 환경의 가상 머신을 여러 개 만들거나 동일한 환경에서 여러 번 테스트를 진행해야 할 때 아주 유용합니다. 그리고 이 `Vagrantfile`은 `Dockerfile`처럼 그냥 하나의 텍스트 파일이므로 Git으로 형상 관리를 수행할 수도 있습니다.

`Dockerfile`과 `Vagrantfile`에 약간의 차이가 있다면 `Dockerfile`은 독자적인 언어를 사용하지만 `Vagrantfile`은 그냥 Ruby언어로 작성된 스크립트라는 점입니다. 물론 충분히 직관적이라서 루비 언어를 전혀 몰라도 쉽게 이해할 수 있도록 되어 있습니다.

하지만 Vagrant 그 자체는 가상 머신이나 가상화 프로그램이 아닙니다. Vagrant는 VirtualBox, VMware와 같은 가상화 프로그램이나 AWS, GCP와 같은 플랫폼들과 상호작용하여 그것들의 가상 머신을 관리해줍니다. 그러므로 Vagrant를 사용하려면 VirtualBox등이 이미 설치되어있거나 AWS 등 플랫폼과 연동하는 작업이 필요합니다.

Vagrant는 디렉토리 단위로 가상 머신을 관리합니다. 어떤 디렉토리에 `Vagrantfile` 이라는 이름의 파일을 생성한 후, 거기에 적절한 설정을 적어 주고 `vagrant up` 명령어를 입력하면 `Vagrantfile`  에 적힌 설정대로 가상 머신이 생성되고 실행됩니다. 이렇게 생성된 가상 머신에는 `vagrant ssh` 명령어를 통해 접속할 수 있습니다.

이때 생성된 가상 머신의 정보는 `.vagrant`라는 숨김 디렉토리 안에 생성됩니다. 저는 겪은 적이 없지만, `Vagrantfile`을 잘못 수정하여 이전에 생성된 가상 머신과 충돌이 발생하는 일이 있다고 합니다. 그런 경우에는 `.vagrant` 디렉토리를 삭제하면 됩니다. 

## Vagrantfile 작성하기

`Vagrantfile`은 사실 일반적인 `Ruby` 스크립트입니다. 물론 저는 루비를 사용할 줄 모르기 때문에 그냥 느낌 가는 대로 작업했습니다. 아래는 제가 작성한 `Vagrantfile`입니다. 만약 아래 스크립트를 쓰고자 하신다면 아이피를 각자의 네트워크에 맞게 적절히 바꿔 주셔야 합니다.

```Ruby
Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/focal64"
  config.vm.network "public_network", ip: "172.30.1.100"
  config.vm.synced_folder '.', '/vagrant', disabled: true
  config.vm.provider "virtualbox" do |v|
    v.memory = 16384
    v.cpus = 4
  end
  config.disksize.size = '200GB'
  config.vm.provision "shell", path: "bootstrap.sh"
end
```

- `  config.vm.box = "ubuntu/focal64"` : 사용할 가상머신 이미지를 설정해줍니다.
- `config.vm.network "public_network", ip: "172.30.1.100"` : 호스트 머신과 Bridged Adapter 방식으로 연결하고 고정 아이피를 설정합니다. Bridged Adapter에 대해서는 아래에 설명되어 있습니다.
- `  config.vm.synced_folder '.', '/vagrant', disabled: true` : Vagrant는 기본적으로 `Vagrantfile`이 있는 폴더를 가상 머신 내부에 `/vagrant`  디렉토리에 마운트합니다. 이를 보안상의 이유로 해제하였습니다.
- `v.memory = 16384`, `v.cpus = 4` : 메모리와 CPU 개수를 설정해줍니다. 16GB, 4Core로 설정했습니다.
- `  config.disksize.size = '200GB'` : 디스크 사이즈를 결정해줍니다. `disksize` 플러그인을 따로 설치해줘야 작동합니다.
- `  config.vm.provision "shell", path: "bootstrap.sh"` 가상 머신이 만들어진 후 해당 쉘스크립트를 실행하도록 합니다.

아래는 `Vagrantfile`과 같은 디렉토리에 있는 `bootstrap.sh` 파일입니다.

```bash
ip route add default via 172.30.1.1
echo 'vagrant:some-password-for-vagrant' | sudo chpasswd
sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/g' /etc/ssh/sshd_config
systemctl restart sshd.service
curl -sfL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644
```

- `ip route add default via 172.30.1.1` : `172.30.1.1` 은 제가 사용하고 있는 공유기의 주소입니다. 이를 설정해주지 않으면 패킷을 내보낼 때 항상 호스트 머신을 거쳐서 가게 되므로 외부에서 접속이 불가능합니다.

- ```bash
  echo 'vagrant:some-password-for-vagrant' | sudo chpasswd
  sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/g' /etc/ssh/sshd_config
  systemctl restart sshd.service
  ```

  - 위 부분은 기본 사용자인 `vagrant`의 패스워드를 바꾼 후 패스워드를 통한 SSH 접속이 가능하도록 수정합니다.

- `curl -sfL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644` 마지막으로 경량화된 쿠버네티스인  `k3s`를 설치합니다.

### 가상 머신의 계정 설정과 삽질들

- Vagrant로 생성된 가상 머신은 기본 유저 이름과 패스워드가 대부분 `vagrant`이며 `Vagrantfile`에는 이걸 바꾸는 옵션이 **없습니다.**
  - Vagrant 공식 홈페이지의 SSH 설정 부분을 보면 유저 이름 설정으로 보이는 옵션이 있습니다. 그러나 이는 가상 머신 내부의 유저 이름을 바꾸는 것이 아니라 SSH에 접속할 때 사용할 유저 이름을 설정하는 옵션입니다. 그러므로 이걸 바꾸면 가상 머신에 접속할 수 없습니다.
  - 유저 이름을 바꾸기 위해서는 `Vagrantfile`에서 스크립트를 통해 새로운 유저를 생성하거나 기본 유저 `vagrant`의 이름을 변경해야 합니다.
  - 저는 이걸 헷갈려서 한두 시간 정도를...후...
- Vagrant는기본적으로 Keyfile을 통해  SSH 접속을 하도록 되어 있습니다. **Password를 통한 접속은 대부분 불가능합니다.**
  - Vagrant 공식 홈페이지를 방문해보면 패스워드를 설정하는 옵션이 있습니다. 그러나 이것 역시 SSH로 접속할 때 사용할 패스워드를 설정하는 것이지 가상 머신 내부에서 패스워드를 설정하는 옵션은 아닙니다. 그러므로 이 옵션을 통해 패스워드를 설정하면 가상 머신에 접속할 수 없습니다.
  - 패스워드를 설정하기 위해서는 `Vagrantfile`에서 위와 같이 스크립트를 통해 패스워드를 설정한 후 `sshd_config`에서 패스워드를 통한 접속을 허용해줘야 합니다.
  - 이것 역시 가상 머신 내부의 패스워드 설정을 할 수 있는 것으로 헷갈려서...추가로 한두 시간을...
  - 제가 올바르게 이해한 것이 맞다면 가상 머신은 기본적으로 Keyfile을 사용한 접속만 가능하게 되어 있으며 그 Keyfile은 랜덤하게 생성되는 것이 아니라 그냥 이미지에 따라 고정된 값을 가집니다. 그리고 그 키파일은 사람들이 가상 머신을 사용할 수 있도록 모두 공개되어있습니다.
  - 그래서 옛날에는 Vagrant로 가상 머신을 생성하면 동일한 이미지로부터 생성된 가상 머신들은 모두 동일한 키를 가졌었고 그래서 보안상 매우 취약했습니다. 즉 관리자가 키파일을 바꾸는 과정을 잊어먹는다면 누구나 머신에 접속이 가능했었습니다.
  - 그래서 최신 버전의 Vagrant는 이런 문제를 해결하고자 가상 머신을 생성하면 먼저 그 고정된 키파일을 사용하여 가상 머신에 접속한 후 기존의 키를 Vagrant가 자체적으로 랜덤하게 생성한 키로 교체합니다.
- 위 `Vagrantfile`을 보면 쉘 스크립트를 실행하는 부분이 있습니다. 그런데 이 쉘 스크립트는 가상 머신이 완전히 생성된 후에 Vagrant가 가상 머신에 SSH를 통해 접속한 후 실행합니다.
  - 그러므로 `Vagrantfile`에서 SSH 유저 이름이나 패스워드 설정을 켜면 상기한 바와 같이 SSH 접속 자체가 불가능해지며 따라서 쉘 스크립트도 실행되지 않습니다.

### 가상 머신의 네트워크 모드와 삽질들

가상 머신은 여러가지 네트워크 모드를 가질 수 있습니다. 이중 가장 많이 사용되는 모드는 Network Address Translation (NAT) 모드와 Bridged Adapter 모드입니다. 이에 관해서는 [이 아티클](https://www.nakivo.com/blog/virtualbox-network-setting-guide/)에 정말 상세하게 설명이 돼 있어서 간단하게만 설명하겠습니다.

#### Network Address Translation (NAT)

NAT모드는 직관적으로 컴퓨터 내부에 가상 머신을 위한 가상 공유기를 하나 만드는 것으로 생각할 수 있습니다. (실제 공유기에서도 NAT을 사용하므로 실제로도 똑같기는 합니다.) 호스트 머신의 IP 주소를 외부 IP 주소로 하는 공유기를 만드는 것으로 생각하면 됩니다. 우리가 공유기 내부에서 공유기 자체 IP 주소에도 접근이 가능하고 (기본 게이트웨이를 통한 설정 페이지 접속을 말하는 것이 아니라 공유기가 가진 외부 IP 주소에 접근이 가능하다는 의미입니다.) 인터넷에도 접속이 가능하듯 이 방법을 사용하면 가상 머신 내부에서 호스트 머신에도 접속이 가능하고 인터넷에도 접속이 가능합니다.

공유기를 사용하면 공유기 내부에서 생성된 패킷들은 공유기 외부에서는 전부 공유기에서 생성된 패킷으로 보입니다. 이와 마찬가지로 NAT 모드를 사용한 가상 머신에서 생성된 패킷들은 호스트 외부에서는 전부 호스트로부터 생성된 것으로 보입니다. 

또한 공유기 외부에서 포트포워딩을 하지 않으면 공유기 내부에 접속이 불가능하듯이 NAT모드를 사용하면 호스트 머신이나 인터넷에서 가상 머신에 접근하는 것은 불가능합니다. 물론 호스트 머신에서 NAT모드를 사용하면서 포트포워딩을 해 주면 가능하기는 하지만 그런 경우 아래 설명한 Bridged Network 모드를 사용하면 훨씬 편합니다.

#### Bridged Adapter

Bridged Adapter 모드는 호스트의 어떤 랜카드를 통해 호스트가 접속되어있는 네트워크에 곧바로 가상 머신을 연결해버립니다. 그러므로 물리적으로는 하나의 기계인데 논리적으로는 두 개의 기기가 존재하게 됩니다. 실제로 위 `Vagrantfile`에서 볼 수 있듯 저는 공유기에 서버를 물려 놓고 가상 머신을 Bridged Adapter 방식으로 연결하였는데 이렇게 한 후 공유기의 네트워크 페이지를 보면 아이피도 두 개가 잡히고 MAC도 두 개가 잡힙니다.  가상 머신이 아니라 실제 물리 머신을 공유기에 병렬로 하나 더 연결하는 것과 같습니다.

그러므로 당연히 가상머신과 호스트 머신은 LAN을 통해 서로 접근이 가능하며 공유기에서 포트 포워딩을 해 주면 외부에서도 가상 머신에 접근할 수 있습니다.

이렇게만 보면 아무런 문제도 없어 보이지만 진짜 문제는 가상 머신 내부에 있습니다. 포트포워딩을 할 목적으로 `Vagrantfile`에서 ip를 수동으로 설정하였더니 DHCP가 전혀 작동하지 않았고 그래서 default gateway역시 자동으로 할당되지 않았습니다. 그런데 제가 설정한 것처럼 하면 기본으로 NAT모드가 설정되고 거기다 Bridged Adapter가 추가되는 형태로 가상머신 내부 네트워크가 구성됩니다. 그래서 마치 정상적으로 Bridged Adapter모드가 설정된 것처럼 인터넷이 잘 되기는 하는데 정작 외부에서 접속은 안 되는 희한한 상황이 발생합니다. 저는 그런 줄은 전혀 모르고 뭔가 Bridged Adapter 모드가 잘못 설정되었다고만 생각해서 또 한참을 헤멨었습니다.

올바른 방법은 DHCP를 설정하거나 제가 했던 것처럼 쉘 스크립트를 통하여 default gateway를 하나 더 추가해주는 것입니다. 

## 가상 머신에 접속하기

만약 `Vagrantfile`이 올바르게 작성되었다면 앞서 말한 바와 같이 `vagrant up` 커맨드를 사용하여 접속할 수 있습니다. 물론 위 `Vagrantfile`에서는 패스워드를 통한 접속을 허용하였으므로 `ssh vagrant@172.30.1.100` 커맨드로도 접속이 가능합니다.

# 참고문헌

- [https://www.nakivo.com/blog/virtualbox-network-setting-guide/](https://www.nakivo.com/blog/virtualbox-network-setting-guide/)
  - 가상 머신의 네트워크에 대해 아주 상세히 설명되어있습니다. 가상 머신 뿐만이 아니라 NAT이나 Bridge같은 일반적인 네트워크 개념을 잡기에도 아주 좋은 글이므로 꼭 읽어 보시기를 추천드립니다.
- [https://www.vagrantup.com/docs/index](https://www.vagrantup.com/docs/index)
  - 베이그란트 공식 독스.
