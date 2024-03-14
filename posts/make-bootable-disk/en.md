---
title: Create a bootable image with minimal configuration
tags:
  - embedded
date: 2023-12-05T03:31:09.435Z
---

> Translated with the help of ChatGPT and Google Translator

I happened to create a Linux image myself. Actually, I'm planning to use Yocto, but before that, I was curious about how to create a minimal bootable image, so I looked it up.

# Make Minimal Bootable Disk

The Linux booting process is quite complicated, but to summarize, it is as follows.

1. After the BIOS or UEFI performs various initializations, it searches for a bootable disk.
1. If a boot loader is found in the MBR section of a bootable disk or the EFI partition of a GPT, run the boot loader.
1. The bootloader loads the initramfs and kernel.
1. The kernel performs various initialization including memory management.
1. Afterwards, run the init process specified in initramfs.
1. The init process mounts the root file system and runs the necessary services.

Therefore, to create a minimal bootable image you will need the following:

-kernel

- initramfs containing the init program
- bootloader

## 1. Linux Kernel

1. Download and build the kernel. At this time, the config file created by default may not work for general purposes, so it is recommended to use the config file provided by Ubuntu, etc.
   - If you are using Ubuntu, etc., you can find the file with the `/boot/config-$(uname -r)` command.
   - Credential problems may occur. In that case, please refer to the link below.
     - https://askubuntu.com/questions/1329538/compiling-the-kernel-5-11-11/1329625#1329625
1. The kernel is created in `arch/x86/boot/bzImage`. (based on x86 architecture)

## 2. Initramfs

1. Download busybox to create initramfs.
   - `git clone git://busybox.net/busybox.git`
1. Build busybox using make.
   - `make defconfig`
   - `make`
1. Create an initramfs using the `make install` command. An initramfs is created in the `_install` directory.
1. Add the following `init` script to the `_install` directory.
   ```bash
   #!/bin/sh
   mount -t proc none /proc
   mount -t sysfs none /sys
   mount -t devtmpfs none /dev
   exec /bin/sh
   ```
1. Make the `init` script executable using the `chmod +x init` command.
1. In the `_install` directory, `find. -print0 | cpio --null -ov --format=newc | Create an initramfs using the gzip -9 > ../../initramfs.cpio.gz` command.

## 3. Bootloader

1. Prepare a blank disk and create an EFI partition using the `fdisk` command.
   - Be careful not to format the host disk.
   - Since the goal is to create a minimal bootable image, no remaining partitions will be created.
1. Format the EFI partition as FAT32 using the command `mkfs.fat -F 32 /dev/sdXy`.
1. Mount the EFI partition using the `mount /dev/sdXy /mnt` command.
1. Copy the kernel and initramfs to the `boot` directory on the EFI partition. (e.g. `/mnt/boot`)
1. Install GRUB using the `grub-install --boot-directory=/mnt/boot --efi-directory=/mnt /dev/sdX` command.

#References

- Overall instruction: https://medium.com/@ThyCrow/compiling-the-linux-kernel-and-creating-a-bootable-iso-from-it-6afb8d23ba22
- EFI system partition: https://wiki.archlinux.org/title/EFI_system_partition
- GRUB installation: https://wiki.archlinux.org/title/GRUB#Generate_the_main_configuration_file
  - Document for `grub-install`: http://man.he.net/man8/grub-install
- Kernel config: https://wiki.gentoo.org/wiki/Kernel/Configuration
