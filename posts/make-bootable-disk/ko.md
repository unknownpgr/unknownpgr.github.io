---
title: 최소한의 구성으로 부팅 가능한 이미지 만들어보기
tags:
  - embedded
date: 2023-12-05T03:31:09.435Z
---

어쩌다 보니 리눅스 이미지를 직접 만들게 됐습니다. 실제로는 Yocto를 사용할 예정인데, 그에 앞서 최소한으로 부팅 가능한 이미지를 만드려면 어떻게 해야 하는지가 궁금해서 찾아봤습니다.

# Make Minimal Bootable Disk

리눅스의 부팅 과정은 상당히 복잡하지만, 간단히 정리하자면 다음과 같습니다.

1. BIOS, 혹은 UEFI 등이 다양한 초기화를 수행한 후 부팅 가능한 디스크를 찾습니다.
1. 부팅 가능한 디스크의 MBR섹션, 혹은 GPT의 EFI 파티션에서 부트로더가 발견되면 부트로더를 실행합니다.
1. 부트로더는 initramfs와 커널을 로드합니다.
1. 커널은 메모리 관리를 비롯한 각종 초기화를 수행합니다.
1. 이후 initramfs에서 지정한 init 프로세스를 실행합니다.
1. init 프로세스는 루트 파일 시스템을 마운트하고, 필요한 서비스를 실행합니다.

그러므로 최소한으로 부팅 가능한 이미지를 만들기 위해서는 다음과 같은 것들이 필요합니다.

- 커널
- init 프로그램을 포함한 initramfs
- 부트로더

## 1. Linux Kernel

1. 커널을 다운받고 빌드합니다. 이때 기본으로 생성되는 config파일은 범용적으로 작동하지 않을 수 있으므로 우분투 등에서 제공하는 config 파일을 이용하면 좋습니다.
   - 우분투 등을 사용하고 있다면 `/boot/config-$(uname -r)` 명령어로 파일을 찾을 수 있습니다.
   - Credential 문제가 발생할 수 있습니다. 그 경우 아래 링크를 참조합니다.
     - https://askubuntu.com/questions/1329538/compiling-the-kernel-5-11-11/1329625#1329625
1. 커널은 `arch/x86/boot/bzImage`에 생성됩니다. (x86 아키텍처 기준)

## 2. Initramfs

1. initramfs를 만들기 위해 busybox를 다운받습니다.
   - `git clone git://busybox.net/busybox.git`
1. make를 사용해서 busybox를 빌드합니다.
   - `make defconfig`
   - `make`
1. `make install` 명령어를 사용해서 initramfs를 만듭니다. `_install` 디렉토리에 initramfs가 생성됩니다.
1. `_install` 디렉토리에 다음과 같은 `init` 스크립트를 추가합니다.
   ```bash
   #!/bin/sh
   mount -t proc none /proc
   mount -t sysfs none /sys
   mount -t devtmpfs none /dev
   exec /bin/sh
   ```
1. `chmod +x init` 명령어를 사용해서 `init` 스크립트를 실행 가능하게 만듭니다.
1. `_install` 디렉토리에서 `find . -print0 | cpio --null -ov --format=newc | gzip -9 > ../../initramfs.cpio.gz` 명령어를 사용해서 initramfs를 생성합니다.

## 3. Bootloader

1. 공 디스크를 준비한 후 `fdisk` 명령어를 사용해서 EFI 파티션을 만듭니다.
   - 호스트 디스크를 포맷하지 않도록 조심합니다.
   - 최소한으로 부팅 가능한 이미지를 만드는 것이 목적이기 때문에 나머지 파티션은 만들지 않습니다.
1. `mkfs.fat -F 32 /dev/sdXy` 명령어를 사용해서 EFI 파티션을 FAT32로 포맷합니다.
1. `mount /dev/sdXy /mnt` 명령어를 사용해서 EFI 파티션을 마운트합니다.
1. 커널과 initramfs를 EFI 파티션의 `boot` 디렉토리에 복사합니다. (e.g. `/mnt/boot`)
1. `grub-install --boot-directory=/mnt/boot --efi-directory=/mnt /dev/sdX` 명령어를 사용해서 GRUB를 설치합니다.

# References

- Overall instruction: https://medium.com/@ThyCrow/compiling-the-linux-kernel-and-creating-a-bootable-iso-from-it-6afb8d23ba22
- EFI system partition: https://wiki.archlinux.org/title/EFI_system_partition
- GRUB installation: https://wiki.archlinux.org/title/GRUB#Generate_the_main_configuration_file
  - Document for `grub-install`: http://man.he.net/man8/grub-install
- Kernel config: https://wiki.gentoo.org/wiki/Kernel/Configuration
