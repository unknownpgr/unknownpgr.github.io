---
title: Useful SSH/SCP Commands
tags:
  - tips
date: 2020-08-08T12:31:29.912Z
---

> This post was translated from Korean into English by AI.

SSH / SCP commands are most often used when working with remote servers. Here are a few useful commands worth knowing.

- Below, `local machine` refers to the computer on which you are running the command.
- Below, `remote server` refers to another computer that you want to control through the `local machine`.

### Connecting to a Remote Server

```bash
ssh [username]@[hostname] -p [sshport]
ssh unknownpgr@my-webserver.server.io -p 1234
```

### Running a Specific Command on a Remote Server

```bash
ssh [username]@[hostname] -p [sshport] command
ssh unknownpgr@192.168.0.2 -p 22 make
```

This runs the given command on the remote server.

### Forwarding a Port to a Specific Port on a Remote Server
As you can see in the examples below, the `-N` option is included. This option prevents a Bash shell from being opened. It is useful when you do not need a Bash shell, such as when forwarding ports.

```bash
ssh -N -L [localport]:[destserver]:[destport] [jumpserver]
ssh -N -L 9876:inta.server.com:80 public.server.com
```

Running the example above connects port `9876` on `localhost` to port `80` on `inta.server.com` through the `public.server.com` server. This is useful when a secure connection is required. For example, [code-server](https://github.com/cdr/code-server) also recommends connecting to code-server with a command like the following.

```bash
ssh -N -L 8080:127.0.0.1:8080 <instance-ip> # After doing this, open localhost:8080 in your browser.
```

### Forwarding a Port from a Remote Server to the Local Machine

```bash
ssh -R [remoteport]:[host]:[hostport] [remote]
ssh -R 8080:localhost:5000 remote.server.com
ssh -R 8080:www.google.com:80 remote.server.com
```

This option can be a little confusing. More precisely, it works as follows.

> It makes the `remoteport` port on the `remote` server connect through the local machine to `hostport` on the `host` server.

Therefore, the second example connects port 8080 on `remote.server.com` to port 5000 on the local machine, while the third example connects port 8080 on `remote.server.com` through the local machine to port 80 on `www.google.com`. Additional options can be used to accept connections on various interfaces, but the default is localhost. In other words, opening `remote.server.com:8080` in my web browser will not work, but running `curl localhost:8080` on the remote server will connect through the local machine to the desired destination server.

### Transferring a File from the Local Machine to a Remote Server

```bash
scp [local-file-path] [username]@[host]:[remote-file-path]
scp ~/file.txt unknownpgr@remote.server.com:"~/remote-path"
```

This places the file at `local-file-path` on the local machine into the `remote-file-path` directory on the `host` remote server. Running the second example saves the `~/file.txt` file from the local machine in the `~/remote-path` directory on the `remote.server.com` server.

### Transferring a Directory from the Local Machine to a Remote Server

```bash
scp -r [local-folder] [user]@[host]:[remote-dir]
```

This is almost identical to the command above, except that it copies an entire directory rather than a single file.

### Transferring a File from a Remote Server to the Local Machine

```bash
scp [user]@[host]:[remote-file] [local-dir]
```

This is also exactly the same as transferring from the local machine to the remote server, except that the order is reversed. It moves `remote-file` from the `host` remote server to `local-dir` on the local machine. Likewise, adding the `-r` option lets you transfer an entire directory.
