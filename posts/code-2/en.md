---
title: Useful File-Related Commands
tags:
  - tips
date: 2021-01-13T06:19:32.212Z
---

> This post was translated from Korean into English by AI.

As is well known, Linux manages everything as a file. When I first learned this, I simply thought, “Oh... I see...” and moved on. But as it turns out, far more things are implemented as files than I had imagined.

# Copying a Disk

In Linux, a disk device itself is represented as a file, with a path such as `/dev/sda`. What is interesting, though, is that the filesystem is a layer above the disk device. In other words, if you simply read the disk as a file, you can see all of the raw data beneath the filesystem. (With the right approach, it seems this could even be used to recover deleted data and the like.)

So, when you want to back up an entire disk to a file, you can do it with the `cat` command as shown below. (...) Let’s back up the `/dev/sda` device to a file, then restore it.

First, use the `chmod` command to change the permissions of `/dev/sda`.

```shell
sudo chmod 777 /dev/sda
```

Next, use the `cat` command to copy the disk into a backup file.

```shell
cat /dev/sda > sda.backup
```

Conversely, you can do the same thing when you want to restore this backup file to the original device.

```shell
cat sda.backup > /dev/sda
```

You can also use the same method to clone one disk to another.

```shell
cat /dev/sda > /dev/sdb
```

Of course, you need read and write permissions for both disks.

# Copying Files

However, you may want to copy only a specific directory rather than clone an entire disk. In that case, you can use the `cp` command, which also has many useful options worth knowing.

- `-r` : Copy recursively
- `-u` : Copy only when the destination file does not exist, or when the source file is newer than the destination file
- `-p` : Copy while preserving permissions, timestamps, and ownership
- `-a` : Copy recursively without preserving symbolic links, while preserving all metadata
- `-v` : Print logs

For backups, it is therefore useful to use the `-au` options as shown below.

```shell
cp -au [src] [dst]
```
