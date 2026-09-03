---
title: TTY
tags:
  - linux
date: 2024-01-17T07:47:28.974Z
---

> This post was translated from Korean into English by AI.

While working on various development projects recently, I learned more about TTYs, so I am writing down what I learned here.

## TTY

TTY stands for teletypewriter. In Unix-like operating systems, it is an interface that abstracts devices such as terminals and consoles. More specifically, it refers to the device driver that provides such an interface.

Linux's terminal subsystem consists of the following three layers.

- Character device interface: Provides users with an interface in the form of a character device.
- Line discipline: Provides various kinds of preprocessing required when users interact with programs through a terminal.
- TTY driver: A driver that communicates with either a physical terminal device or a virtual device called a pseudo-terminal.

The character device interface is beyond the scope of this post, so I will omit it and look at the other two layers.

## Line Discipline

The line discipline layer (hereafter LD) provides many of the features we take for granted when using a terminal.

- When a user enters text in a terminal, the text appears as typed even if the program does not do anything special. This is because the LD provides echo functionality. If a program received user input directly without the LD's help, the entered text would not appear on the screen—just like when entering a password—unless the program implemented echo functionality separately.

  - In fact, programs that need to control the terminal directly, such as the readline utility, Vim, and password input features, are implemented with several LD features disabled.

- With Python's `input` or C's `scanf` function, you can see that entered text is not sent to the program in real time; instead, it is sent all at once when Enter is pressed. This is also because the LD maintains an internal buffer. Without such a buffer, every program would have to implement complex features such as handling the Backspace key itself.

- The LD also handles control characters such as Ctrl+C (SIGINT), Ctrl+Z (SIGTSTP), Ctrl+S (SIGSTOP), and Ctrl+Q (SIGCONT), and sends signals in response. If the LD did not provide these features, there would be no way to terminate a program that does not accept string input.

- When a program outputs a string, even if it outputs only a `\n` character, it is converted to `\r\n` because the LD handles the conversion. If you disable this feature in the LD and output text, the carriage return character is not emitted, causing the text to appear like a staircase—a phenomenon known as the staircase effect.

## Signal

Of these features, the part related to signal handling is especially interesting. The TTY driver classifies Linux's various process groups into one foreground process group and the remaining background process groups. Only processes in that terminal's foreground process group can output text to and receive input from the terminal. When the user enters a control character (e.g., Ctrl+C) and the TTY driver generates a signal, that signal is delivered only to processes in the foreground process group.

The foreground process group can be managed using the following system calls.

- `tcgetpgrp`: Gets the foreground process group of the given terminal.
- `tcsetpgrp`: Sets the foreground process group of the given terminal.

For example, when you run the following script, pressing Ctrl+C terminates the process without an error.

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

The output is as follows.

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

This is because all three processes—the Python interpreter, Bash, and ping—belong to the foreground process group. The moment Ctrl+C is pressed, the signal is delivered to all the processes simultaneously. Because the Python interpreter ignores the exception, the process terminates without displaying any particular error.

However, the result changes if Bash is run with the `-i` option, as shown below.

```python
# omitted above
cmd = 'bash -ci "ping 1.1.1.1 -c 100"'
p = subprocess.Popen(cmd, shell=True)
time.sleep(0.1) # Wait for subprocess to start
# omitted below
```

The output is as follows.

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

You can see that pressing Ctrl+C terminates the ping process, but not the Python interpreter. Bash's `-i` option runs an interactive shell, and when this option is used, Bash sets itself as the foreground process group. The log indeed shows that the foreground process group has changed.

In this situation, the process can end up running forever if things go wrong. Normally, when a terminal in which a process is running is closed, the process terminates along with it. This is because a `SIGHUP` signal is delivered to the terminal's child processes when the terminal exits. However, if a script like this is run with `sudo`, the script runs with higher privileges than the terminal. In that case, the kernel does not deliver the signal. Problems can arise if such a process uses a lot of CPU or occupies a port.

To prevent this, after the child process exits, you can set the foreground process group again using the `tcsetpgrp` system call.

```python
# omitted above

cmd = "bash -ci \"ping 1.1.1.1 -c 100\""
p = subprocess.Popen(cmd, shell=True)
p.wait() # Wait for subprocess to finish

# Set the terminal's foreground process group to this process's group
os.tcsetpgrp(sys.stdout.fileno(), os.getpid())

# omitted below
```

> In the very first script, using the `p.wait()` function causes an error when Ctrl+C is pressed. This is because the signal is also delivered to the Python interpreter. In this case, however, the signal is not delivered to the Python interpreter until `os.tcsetpgrp()` is executed, so `p.wait()` can be used.

However, if you actually try this, the process enters the Stopped state the moment the `tcsetpgrp` system call is executed.

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

This is expected behavior. The `tcsetgprp` man page explains it as follows.

> If tcsetpgrp() is called by a member of a background process group in its session, and the calling process is not blocking or ignoring SIGTTOU, a SIGTTOU signal is sent to all members of this background process group.

When the `bash` process took control of the foreground, the Python interpreter became a background process group. As a result, the process was stopped when the `SIGTTOU` signal was delivered.

You can bring the process back into the foreground with the `fg` command, or modify the code to ignore this signal as shown below. To make the changes to the foreground process group clear, I will use a Python command instead of ping and print the foreground process group from within Bash.

```python
# omitted above

cmd = "bash -ci \"python3 -c 'import os; print(os.getpgrp(), os.getpid())'\""
p = subprocess.Popen(cmd, shell=True)
p.wait() # Wait for subprocess to finish

# Ignore SIGTTOU
signal.signal(signal.SIGTTOU, signal.SIG_IGN)
# Set the terminal's foreground process group to this process's group
os.tcsetpgrp(sys.stdout.fileno(), os.getpid())

print("Pgrp after command: ", os.tcgetpgrp(sys.stdout.fileno()), os.getpid())

# omitted below
```

The output in this case is as follows.

```
Pgrp before command:  59158 59158
59160 59160
Pgrp after command:  59158 59158
^CExiting...
```

## PTY

Next, let us look at another interesting feature of the TTY driver: PTYs. PTY stands for pseudo-terminal and provides a way to emulate a physical terminal device. PTYs are used to implement terminals without physical hardware, such as GUI terminal programs, Telnet, and SSH.

When a physical terminal device is connected, its structure is as follows.

```
physical hardware - hardware device driver - TTY device driver - program
```

Similarly, the structure of a PTY is as follows.

```
program - PTY device driver - TTY device driver - program
```

Thus, a PTY connects two different programs, and each program has one file descriptor corresponding respectively to the physical device and the terminal character device file.

The side corresponding to the physical device—the side used by an ordinary user—is called the master. The side corresponding to the PTY—the side used by the process reading the terminal—is called the slave. This master-slave pair is called a PTY pair.

Internally, a PTY pair can be thought of as something similar to a bidirectional pipe with the LD applied. Data written to the master is therefore delivered to the slave, and data written to the slave is delivered to the master. Unlike a bidirectional pipe, however, the LD performs various processing operations using mechanisms such as its internal buffer before delivering the data.

On Linux, these PTYs are provided through a virtual filesystem called `devpts`. `devpts` connects the master to `/dev/ptmx` and the slave to `/dev/pts/<n>`. Here, `<n>` is a number that increments by one each time a PTY is created. One slave device file is created for each PTY pair, whereas masters all use a single special file, `/dev/ptmx`. Each time the `/dev/ptmx` file is opened, it creates a new PTY pair and returns the file descriptor for its master.

Normally, obtaining the PTS descriptor through this PTM descriptor and then setting its permissions requires a cumbersome series of steps. In Python, however, the `os.openpty` function provides a convenient way to obtain the file descriptors for a PTY pair.

The script below is a modified version of the script examined earlier that uses a PTY.

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

The output is as follows.

```
Pgrp before command:  292251 292251
Pgrp after command:  292251 292251
^CExiting...
```

Unlike before, the foreground process has not changed. This is because setting stdin and stdout to the PTS makes the subprocess use a different terminal from the parent process. For the same reason, the output of the ping command is not displayed, and pressing Ctrl+C delivers the signal normally to the parent process, causing it to terminate.

To see the output, modify the waiting code as follows.

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

The output is as follows.

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

Unlike in the previous examples, when Ctrl+C is pressed, the statistics section produced by the ping command is not shown. In the previous examples, the child process wrote data directly to the terminal, so the data was displayed even if it was output after the parent process terminated. In this case, however, the parent process reads data from the PTM and outputs it, so the output stops as soon as the parent process terminates.

> The `bash: cannot set terminal process group ...` error appears to occur because the `Popen` command connects stdin and stdout using pipes rather than a TTY device internally. Using `fork` directly, as shown below, produces the same result without the error.

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

In this post, we examined the structure of TTYs, LDs, and PTYs.

- A TTY is an interface that abstracts a terminal.
- The LD provides various features needed when using a terminal.
- A PTY provides a way to emulate a physical terminal device.

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
