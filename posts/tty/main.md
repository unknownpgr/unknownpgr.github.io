---
title: TTY
tags:
  - linux
date: 2024-01-17T07:47:28.974Z
---

이번에 이것저것 개발하면서 TTY에 대해 자세히 알게 되어서 내용을 정리해둡니다.

## TTY

tty는 teletypewriter의 약자로, Unix 계열 운영체제에서 터미널이나 콘솔 등의 장치를 추상화한 인터페이스입니다. 좀 더 구체적으로는 그러한 인터페이스를 제공하는 디바이스 드라이버를 말합니다.

리눅스의 터미널 서브시스템은 다음과 같은 세 레이어로 이루어져 있습니다.

- Character device interface: 유저에게 character device 형태로 인터페이스를 제공합니다.
- Line discipline: 유저가 터미널을 통해 프로그램과 상호작용할 때 필요한 다양한 전처리를 제공합니다.
- TTY driver: 실제 터미널 장치, 혹은 pseudo terminal이라 불리는 가상 장치와 통신하는 드라이버입니다.

이중 character device interface는 이 글의 범위를 벗어나므로 생략하고, 나머지 두 레이어에 대해 살펴보겠습니다.

## Line Discipline

Line discipline layer(이하 LD)은 터미널을 사용할 때 당연하게 느껴지는 다양한 기능들을 제공합니다.

- 유저가 터미널에 텍스트를 입력하면 프로그램에서 별다른 처리를 하지 않아도 그 텍스트가 그대로 보이는데, 이것은 LD가 echo 기능을 제공하기 때문입니다. 만약 LD의 도움 없이 프로그램에서 직접 유저 입력을 받는다면 별도로 echo 기능을 제공하지 않는 한 마치 패스워드를 입력할 때처럼 입력한 텍스트가 화면에 보이지 않을 것입니다.

  - 실제로 readline 유틸리티나 vim, 패스워드를 받는 기능처럼 터미널을 직접 다뤄야 하는 프로그램은 LD의 여러 기능들을 끄고 구현됩니다.

- python의 `input`이나 C 언어의 `scanf` 함수 등을 보면 입력한 텍스트가 실시간으로 프로그램으로 전송되는 것이 아니라 엔터를 누르는 순간 한 번에 전송되는 것을 알 수 있습니다. 이것 역시 LD에서 내부에 버퍼를 두고 있기 때문입니다. 만약 이런 버퍼가 없었다면 백스페이스를 누르는 등 복잡한 기능들을 모든 프로그램에서 직접 구현해야 했을 것입니다.

- Ctrl+C(SIGINT), Ctrl+Z(SIGTSTP), Ctrl+S(SIGSTOP), Ctrl+Q(SIGCONT) 등의 제어 문자를 받아 시그널을 보내는 기능 역시 LD에서 제공합니다. 만약 LD에서 이러한 기능을 제공하지 않았다면 문자열 입력을 받지 않는 프로그램을 종료할 방법이 없었을 것입니다.

- 프로그램에서 문자열을 출력할 때 `\n` 문자만 출력해도 `\r\n`으로 변환되어 출력되는 것은 LD에서 이를 처리하기 때문입니다. LD에서 이 기능을 끄고 문자를 출력해보면 carriage return 문자가 출력되지 않아 텍스트가 계단처럼 출력되는 계단 현상 (staircase effect)이 발생합니다.

## Signal

이러한 기능들 중 시그널 처리에 관련된 부분은 특히 흥미롭습니다. tty 드라이버는 리눅스의 다양한 process group을 하나의 foreground process group과 나머지 background process group으로 분류합니다. 그 터미널의 foreground process group에 속한 프로세스들만이 터미널에 문자열을 출력하고 터미널로부터 입력을 받을 수 있습니다. 그리고 유저로부터 제어 문자가 입력되어 (e.g. Ctrl+C) tty 드라이버가 signal을 발생시키는 경우, 이 시그널은 foreground process group에 속한 프로세스들에게만 전달됩니다.

이러한 foreground process group은 다음과 시스템 콜을 사용하여 다룰 수 있습니다.

- `tcgetpgrp`: 주어진 터미널의 foreground process group을 가져옵니다.
- `tcsetpgrp`: 주어진 터미널의 foreground process group을 설정합니다.

예를 들어서 다음과 같은 스크립트를 실행하는 경우, Ctrl+C를 누르면 오류 없이 프로세스가 종료됩니다.

```python
import subprocess
import time
import sys
import os

print("Pgrp before command: ", os.tcgetpgrp(sys.stdout.fileno()), os.getpid())

cmd = "bash -c \"ping 1.1.1.1 -c 100\""
p = subprocess.Popen(cmd, shell=True)

print("Pgrp after command: ", os.tcgetpgrp(sys.stdout.fileno()), os.getpid())

try:
    time.sleep(99999)
except:
    pass
print(f"Exiting...")
```

실행 결과는 아래와 같습니다.

```
Pgrp before command:  287745 287745
Pgrp after command:  287745 287745
PING 1.1.1.1 (1.1.1.1) 56(84) bytes of data.
64 bytes from 1.1.1.1: icmp_seq=1 ttl=52 time=3.81 ms
64 bytes from 1.1.1.1: icmp_seq=2 ttl=52 time=3.77 ms
^C
--- 1.1.1.1 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1001ms
rtt min/avg/max/mdev = 3.765/3.786/3.808/0.021 ms
Exiting...
```

이는 파이썬 인터프리터, bash, ping 세 프로세스가 모두 foreground process group에 포함되기 때문입니다. Ctrl+C를 누르는 순간 모든 프로세스에 동시에 시그널이 전달되고, 파이썬 인터프리터는 exception을 무시하기 때문에 별다른 오류 표시 없이 프로세스가 종료됩니다.

그러나 다음과 같이 bash를 실행할 때 i옵션을 주게 되면 결과가 달라집니다.

```python
# 상략
cmd = 'bash -ci "ping 1.1.1.1 -c 100"'
p = subprocess.Popen(cmd, shell=True)
time.sleep(0.1) # Wait for subprocess to start
# 하략
```

결과는 아래와 같습니다.

```
Pgrp before command:  288343 288343
PING 1.1.1.1 (1.1.1.1) 56(84) bytes of data.
64 bytes from 1.1.1.1: icmp_seq=1 ttl=52 time=5.56 ms
Pgrp after command:  288345 288343
64 bytes from 1.1.1.1: icmp_seq=2 ttl=52 time=5.26 ms
64 bytes from 1.1.1.1: icmp_seq=3 ttl=52 time=5.70 ms
^C
--- 1.1.1.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2002ms
rtt min/avg/max/mdev = 5.259/5.505/5.702/0.184 ms
^C^C^C^C^C^C^C^C
```

Ctrl+C를 눌렀더니 ping 프로세스는 종료되었지만 파이썬 인터프리터는 종료되지 않는 것을 확인할 수 있습니다. bash의 `-i` 옵션은 interactive shell을 실행하도록 하는 옵션이고, 이 옵션을 사용하게 되면 bash가 자기 자신을 foreground process group으로 설정하기 때문입니다. 실제로 로그를 보면 foreground process group이 바뀐 것을 확인할 수 있습니다.

이 경우 잘못하면 이 프로세스가 영원히 살아있는 경우가 발생할 수 있습니다. 보통은 프로세스를 실행하는 경우 터미널을 끄게 되면 프로세스도 함께 종료됩니다. 터미널이 종료될 때 그 자식 프로세스들에게 `SIGHUP` 시그널이 전달되기 때문입니다. 그러나 `sudo` 권한으로 이런 스크립트를 실행하게 되면 터미널의 권한보다 스크립트의 실행 권한이 더 높아집니다. 그런 경우 커널은 시그널을 전달하지 않습니다. 이때 이런 프로세스가 CPU를 많이 사용한다거나 포트를 점유하게 되면 문제가 생길 수 있습니다.

이런 경우를 방지하려면 자식 프로세스가 종료된 이후 `tcsetpgrp` 시스템 콜을 사용해서 다시 foreground process group을 설정해주면 됩니다.

```python
# 상략

cmd = "bash -ci \"ping 1.1.1.1 -c 100\""
p = subprocess.Popen(cmd, shell=True)
p.wait() # Wait for subprocess to finish

# Set the terminal's foreground process group to this process's group
os.tcsetpgrp(sys.stdout.fileno(), os.getpid())

# 하략
```

> 이때 맨 처음의 스크립트에서는 `p.wait()` 함수를 사용하면 Ctrl+C를 눌렀을 때 오류가 발생합니다. 파이썬 인터프리터에도 시그널이 전달되었기 때문입니다. 그러나 이 경우에는 `os.tcsetpgrp()`를 실행하기 전까지는 파이썬 인터프리터에 시그널이 전달되지 않기 때문에 p.wait()를 사용할 수 있습니다.

그런데 실제로 이렇게 해 보면 `tcsetpgrp` 시스템 콜이 실행되는 순간 프로세스가 Stop상태가 되어 버립니다.

```
Pgrp before command:  279325 279325
PING 1.1.1.1 (1.1.1.1) 56(84) bytes of data.
64 bytes from 1.1.1.1: icmp_seq=1 ttl=52 time=4.37 ms
64 bytes from 1.1.1.1: icmp_seq=2 ttl=52 time=6.41 ms
^C
--- 1.1.1.1 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1002ms
rtt min/avg/max/mdev = 4.374/5.390/6.406/1.016 ms

[1]+  Stopped                 python3 asdf.py
```

이것은 정상적인 동작으로, `tcsetgprp`의 man page를 보면 다음과 같이 설명되어 있습니다.

> If tcsetpgrp() is called by a member of a background process group in its session, and the calling process is not blocking or ignoring SIGTTOU, a SIGTTOU signal is sent to all members of this background process group.

`bash` 프로세스가 foreground를 가져가면서 파이썬 인터프리터가 background process group이 되었고, 그래서 `SIGTTOU` 시그널이 전달되면서 프로세스가 Stop된 것입니다.

`fg` 커맨드로 프로세스를 다시 foreground로 가져올 수도 있고, 다음과 같이 이 시그널을 무시하도록 코드를 수정할 수 있습니다. Foreground process group의 변화를 확실히 알아보기 위해 ping 대신 python command를 사용하여 bash 내부에서 foreground process group을 출력해보겠습니다.

```python
# 상략

cmd = "bash -ci \"python3 -c 'import os; print(os.getpgrp(), os.getpid())'\""
p = subprocess.Popen(cmd, shell=True)
p.wait() # Wait for subprocess to finish

# Ignore SIGTTOU
signal.signal(signal.SIGTTOU, signal.SIG_IGN)
# Set the terminal's foreground process group to this process's group
os.tcsetpgrp(sys.stdout.fileno(), os.getpid())

print("Pgrp after command: ", os.tcgetpgrp(sys.stdout.fileno()), os.getpid())

# 하략
```

이때의 결과는 다음과 같습니다.

```
Pgrp before command:  59158 59158
59160 59160
Pgrp after command:  59158 59158
^CExiting...
```

## PTY

다음으로 tty 드라이버의 다른 흥미로운 기능인 pty에 대해 알아보겠습니다. Pty는 Pseudo terminal의 약자로 실제 터미널 장치를 모사할 수 있는 기능을 제공합니다. pty는 실제 하드웨어가 없는 터미널, 즉 GUI상의 터미널 프로그램이나 telnet, ssh등을 구현하기 위해 사용됩니다.

실제 터미널 디바이스가 연결된 경우 그 구조는 아래와 같습니다.

```
실제 하드웨어 - 하드웨어 디바이스 드라이버 - tty 디바이스 드라이버 - 프로그램
```

마찬가지로 pty의 구조는 아래와 같습니다.

```
프로그램 - pty 디바이스 드라이버 - tty 디바이스 드라이버 - 프로그램
```

그러므로 pty는 두 개의 서로 다른 프로그램을 연결해주며, 따라서 각 프로그램에서 각각 물리 디바이스와 터미널 character device file에 대응되는 file descriptior를 하나씩 가지게 됩니다.

이때 물리 디바이스에 대응되는 쪽, 즉 일반적인 유저가 사용하는 쪽을 master, pty에 대응되는 쪽, 즉 터미널을 읽는 프로세스가 사용하는 쪽을 slave라고 부릅니다. 이러한 master-slave의 쌍을 pty pair라고 부릅니다.

pty pair의 동작은 내부적으로 LD가 적용되는 bidirectional pipe와 유사하다고 생각할 수 있습니다. 그래서 master에 쓰는 내용은 slave로 전달되고 slave에서 쓰는 내용이 master로 전달됩니다. 다만 bidirectional pipe와는 다르게 LD에서 내부 버퍼 등을 사용하여 다양한 처리를 진행한 후 전달된다는 차이점이 있습니다.

리눅스에서 이러한 pty는 `devpts`라는 가상 파일시스템을 통해 제공됩니다. `devpts`는 master를 `/dev/ptmx`에, slave를 `/dev/pts/<n>`에 연결합니다. 이때 `<n>`은 pty이 생성될 때마다 1씩 증가하는 숫자입니다. Slave device file은 pty pair당 하나씩 생성되며 master의 경우 `/dev/ptmx`라는 특별한 파일 하나만이 사용됩니다. `/dev/ptmx`파일은 open할 때마다 새로운 pty pair를 생성하여 그 master의 file descriptor를 반환합니다.

원래는 이 ptm descriptor를 통해 pts descriptor를 얻고, 또 권한을 설정해주는 번거로운 과정이 필요합니다. 그러나 python에서는 `os.openpty`라는 함수를 사용하여 편리하게 pty pair의 file descriptor를 얻을 수 있습니다.

아래는 앞서 살펴봤던 스크립트를 pty를 사용하도록 수정한 것입니다.

```python
import subprocess
import time
import sys
import os

print("Pgrp before command: ", os.tcgetpgrp(sys.stdout.fileno()), os.getpid())

master, slave = os.openpty()

cmd = 'bash -ci "ping 1.1.1.1 -c 100"'
p = subprocess.Popen(
    cmd,
    shell=True,
    stdin=slave,
    stdout=slave,
    stderr=slave,
    close_fds=True,
)

time.sleep(1)

print("Pgrp after command: ", os.tcgetpgrp(sys.stdout.fileno()), os.getpid())

try:
    time.sleep(99999)
except:
    pass
print(f"Exiting...")
```

실행 결과는 아래와 같습니다.

```
Pgrp before command:  292251 292251
Pgrp after command:  292251 292251
^CExiting...
```

이전과 다르게 foreground process가 변경되지 않았습니다. 왜냐하면 stdin, stdout을 pts로 설정했기 때문에 부모 프로세스와 다른 터미널을 사용하기 때문입니다. 같은 이치로 ping 커맨드의 출력 역시 표시되지 않으며 Ctrl+C를 눌렀을 때에도 부모 프로세스에 정상적으로 시그널이 전달되어 프로세스가 종료됩니다.

출력을 확인하려면 다음과 같이 대기하는 코드를 수정하면 됩니다.

```python
import subprocess
import time
import sys
import os

print("Pgrp before command: ", os.tcgetpgrp(sys.stdout.fileno()), os.getpid())

master, slave = os.openpty()

cmd = 'bash -ci "ping 1.1.1.1 -c 100"'
p = subprocess.Popen(
    cmd,
    shell=True,
    stdin=slave,
    stdout=slave,
    stderr=slave,
    close_fds=True,
)

time.sleep(1)

print("Pgrp after command: ", os.tcgetpgrp(sys.stdout.fileno()), os.getpid())

try:
    while True:
        data = os.read(master, 1024)
        if not data:
            break
        os.write(sys.stdout.fileno(), data)
except:
    pass
print(f"Exiting...")
```

실행 결과는 아래와 같습니다.

```
Pgrp before command:  292942 292942
Pgrp after command:  292942 292942
bash: cannot set terminal process group (292942): Inappropriate ioctl for device
bash: no job control in this shell
PING 1.1.1.1 (1.1.1.1) 56(84) bytes of data.
64 bytes from 1.1.1.1: icmp_seq=1 ttl=52 time=5.35 ms
64 bytes from 1.1.1.1: icmp_seq=2 ttl=52 time=10.2 ms
64 bytes from 1.1.1.1: icmp_seq=3 ttl=52 time=9.19 ms
64 bytes from 1.1.1.1: icmp_seq=4 ttl=52 time=32.7 ms
^CExiting...
```

이전 예제들과 다르게 Ctrl+C를 눌렀을 때 ping 커맨드에서 보여주는 통계 부분이 보이지 않습니다. 이전 예제들에서는 자식 프로세스가 터미널에 직접 데이터를 출력했기 때문에 부모 프로세스가 종료된 후 데이터가 출력되더라도 표시되었지만, 이 경우에는 부모 프로세스가 ptm으로부터 데이터를 읽어 출력해주기 때문에 부모 프로세스가 종료되는 즉시 데이터 출력이 끊기기 때문입니다.

> bash: cannot set terminal process group ... 오류는 Popen 커맨드 내부에서 tty 디바이스 대신 pipe를 사용하여 stdin, stdout을 연결하기 때문인 것으로 보입니다. 아래와 같이 fork를 직접 사용하면 오류 없이 동일한 결과를 얻을 수 있습니다.

```python
import sys
import os

master, slave = os.openpty()

if os.fork() == 0:
    os.close(master)
    os.setsid()
    os.dup2(slave, 0)
    os.dup2(slave, 1)
    os.dup2(slave, 2)
    os.execvp("bash", ["bash", "-c", "-i", "ping 1.1.1.1 -c 100"])

os.close(slave)

try:
    while True:
        data = os.read(master, 1024)
        if not data:
            break
        os.write(sys.stdout.fileno(), data)
except:
    pass
print(f"Exiting...")
```

## Conclusion

이 글에서는 tty의 구조와 LD, pty에 대해 알아보았습니다.

- tty는 터미널을 추상화한 인터페이스입니다.
- LD는 터미널을 사용할 때 필요한 다양한 기능들을 제공합니다.
- pty는 실제 터미널 장치를 모사할 수 있는 기능을 제공합니다.

## References

- **Devpts**: https://en.wikipedia.org/wiki/Devpts
- **Process group**: https://biriukov.dev/docs/fd-pipe-session-terminal/3-process-groups-jobs-and-sessions
- **Pts**: https://man7.org/linux/man-pages/man4/ptmx.4.html
- **Pty**: https://www.rkoucha.fr/tech_corner/pty_pdip.html
- **Tty**: https://www.linusakesson.net/programming/tty/index.php
- **Tty**: https://www.linuxquestions.org/questions/programming-9/can-a-user-space-program-create-a-dev-tty-665621
- **Interactive mode**: https://unix.stackexchange.com/questions/257571
- **Python raw mode**: https://stackoverflow.com/questions/12231794
- **Tty siganl**: https://stackoverflow.com/questions/60193762
- **tcsetpgrp**: https://linux.die.net/man/3/tcsetpgrp
- **Signal**: https://unix.stackexchange.com/questions/258503
