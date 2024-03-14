---
title: TTY
tags:
  - linux
date: 2024-01-17T07:47:28.974Z
---

> Translated with the help of ChatGPT and Google Translator

This time, while developing various things, I learned more about TTY, so I am organizing the contents.

##TTY

tty is an abbreviation for teletypewriter, and is an interface that abstracts devices such as terminals and consoles in Unix-based operating systems. More specifically, it refers to device drivers that provide such interfaces.

Linux's terminal subsystem consists of three layers:

- Character device interface: Provides an interface to the user in the form of a character device.
- Line discipline: Provides various preprocessing required when users interact with programs through the terminal.
- TTY driver: A driver that communicates with a real terminal device or a virtual device called a pseudo terminal.

Since the dual character device interface is beyond the scope of this article, we will omit it and look at the remaining two layers.

## Line Discipline

Line discipline layer (hereinafter referred to as LD) provides various functions that are taken for granted when using the terminal.

- When a user enters text in the terminal, the text is displayed as is without any special processing in the program. This is because LD provides the echo function. If the program receives user input directly without the help of LD, the entered text will not be displayed on the screen, just like when entering a password, unless an echo function is provided separately.

  - In fact, programs that require direct handling of the terminal, such as the readline utility, vim, and the function to receive passwords, are implemented with various functions of LD turned off.

- If you look at python's `input` or C language's `scanf` function, you can see that the entered text is not transmitted to the program in real time, but is transmitted all at once the moment you press Enter. This is also because LD has an internal buffer. If this buffer did not exist, complex functions such as pressing backspace would have to be implemented manually in every program.

- The function of sending signals by receiving control characters such as Ctrl+C (SIGINT), Ctrl+Z (SIGTSTP), Ctrl+S (SIGSTOP), and Ctrl+Q (SIGCONT) is also provided by LD. If LD did not provide this function, there would be no way to terminate a program that does not accept string input.

- When outputting a string in a program, even if only `\n` characters are output, they are converted to `\r\n` and output because LD processes them. If you turn off this function in LD and print text, the carriage return text is not printed, resulting in a staircase effect where the text is printed like stairs.

## Signal

Among these functions, those related to signal processing are particularly interesting. The tty driver classifies various process groups in Linux into one foreground process group and the remaining background process groups. Only processes belonging to the terminal's foreground process group can output strings to the terminal and receive input from the terminal. And when a control character is input from the user (e.g. Ctrl+C) and the tty driver generates a signal, this signal is delivered only to processes belonging to the foreground process group.

These foreground process groups can be handled using the following system calls.

- `tcgetpgrp`: Get the foreground process group of a given terminal.
- `tcsetpgrp`: Sets the foreground process group for the given terminal.

For example, if you run the following script, pressing Ctrl+C will terminate the process without error.

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

The execution result is as follows.

```
Pgrp before command: 287745 287745
Pgrp after command: 287745 287745
PING 1.1.1.1 (1.1.1.1) 56(84) bytes of data.
64 bytes from 1.1.1.1: icmp_seq=1 ttl=52 time=3.81 ms
64 bytes from 1.1.1.1: icmp_seq=2 ttl=52 time=3.77 ms
^C
--- 1.1.1.1 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1001ms
rtt min/avg/max/mdev = 3.765/3.786/3.808/0.021 ms
Exiting...
```

This is because all three processes, Python interpreter, bash, and ping, are included in the foreground process group. The moment you press Ctrl+C, a signal is sent to all processes at the same time, and since the Python interpreter ignores exceptions, the process terminates without displaying any errors.

However, if you give the i option when running bash as follows, the result will be different.

```python
# Layout
cmd = 'bash -ci "ping 1.1.1.1 -c 100"'
p = subprocess.Popen(cmd, shell=True)
time.sleep(0.1) # Wait for subprocess to start
# Halyak
```

The results are as follows:

```
Pgrp before command: 288343 288343
PING 1.1.1.1 (1.1.1.1) 56(84) bytes of data.
64 bytes from 1.1.1.1: icmp_seq=1 ttl=52 time=5.56 ms
Pgrp after command: 288345 288343
64 bytes from 1.1.1.1: icmp_seq=2 ttl=52 time=5.26 ms
64 bytes from 1.1.1.1: icmp_seq=3 ttl=52 time=5.70 ms
^C
--- 1.1.1.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2002ms
rtt min/avg/max/mdev = 5.259/5.505/5.702/0.184 ms
^C^C^C^C^C^C^C^C
```

When you press Ctrl+C, you can see that the ping process is terminated but the Python interpreter is not terminated. The `-i` option of bash allows you to run an interactive shell, and when you use this option, bash sets itself to the foreground process group. If you actually look at the log, you can see that the foreground process group has changed.

In this case, if done incorrectly, this process may live forever. Normally, when you run a process, turning off the terminal will terminate the process as well. This is because when the terminal terminates, the `SIGHUP` signal is sent to its child processes. However, if you run such a script with `sudo` privileges, the script's execution privileges will be higher than those of the terminal. In such cases, the kernel does not pass the signal. At this time, problems may arise if these processes use a lot of CPU or occupy ports.

To prevent this, after the child process terminates, use the `tcsetpgrp` system call to set the foreground process group again.

```python
# Layout

cmd = "bash -ci \"ping 1.1.1.1 -c 100\""
p = subprocess.Popen(cmd, shell=True)
p.wait() # Wait for subprocess to finish

# Set the terminal's foreground process group to this process's group
os.tcsetpgrp(sys.stdout.fileno(), os.getpid())

# Halyak
```

> At this time, if you use the `p.wait()` function in the first script, an error will occur when you press Ctrl+C. This is because the signal was also delivered to the Python interpreter. However, in this case, you can use p.wait() because the signal is not delivered to the Python interpreter until you run `os.tcsetpgrp()`.

However, if you actually do this, the process will be stopped the moment the `tcsetpgrp` system call is executed.

```
Pgrp before command: 279325 279325
PING 1.1.1.1 (1.1.1.1) 56(84) bytes of data.
64 bytes from 1.1.1.1: icmp_seq=1 ttl=52 time=4.37 ms
64 bytes from 1.1.1.1: icmp_seq=2 ttl=52 time=6.41ms
^C
--- 1.1.1.1 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1002ms
rtt min/avg/max/mdev = 4.374/5.390/6.406/1.016 ms

[1]+ Stopped python3 asdf.py
```

This is normal behavior, and the man page for `tcsetgprp` explains it as follows:

> If tcsetpgrp() is called by a member of a background process group in its session, and the calling process is not blocking or ignoring SIGTTOU, a SIGTTOU signal is sent to all members of this background process group.

As the `bash` process took the foreground, the Python interpreter became the background process group, so the `SIGTTOU` signal was sent and the process was stopped.

You can bring the process back to the foreground with the `fg` command, or you can modify your code to ignore this signal as follows: To clearly see the change in the foreground process group, let's print the foreground process group inside bash using the python command instead of ping.

```python
# Layout

cmd = "bash -ci \"python3 -c 'import os; print(os.getpgrp(), os.getpid())'\""
p = subprocess.Popen(cmd, shell=True)
p.wait() # Wait for subprocess to finish

#IgnoreSIGTTOU
signal.signal(signal.SIGTTOU, signal.SIG_IGN)
# Set the terminal's foreground process group to this process's group
os.tcsetpgrp(sys.stdout.fileno(), os.getpid())

print("Pgrp after command: ", os.tcgetpgrp(sys.stdout.fileno()), os.getpid())

# Halyak
```

The results at this time are as follows:

```
Pgrp before command: 59158 59158
59160 59160
Pgrp after command: 59158 59158
^CExiting...
```

##PTY

Next, let's look at another interesting feature of the tty driver: pty. Pty stands for pseudo terminal and provides the ability to simulate an actual terminal device. pty is used to implement a terminal without actual hardware, that is, a terminal program on a GUI, telnet, ssh, etc.

When an actual terminal device is connected, its structure is as follows.

```
Physical hardware - hardware device driver - tty device driver - program
```

Similarly, the structure of pty is as follows.

```
Program - pty device driver - tty device driver - program
```

Therefore, a pty connects two different programs, so each program has a file descriptor corresponding to a physical device and a terminal character device file.

At this time, the side corresponding to the physical device, that is, the side used by general users, is called the master, and the side corresponding to the pty, that is, the side used by the process reading the terminal, is called the slave. This master-slave pair is called a pty pair.

The operation of a pty pair can be thought of as similar to a bidirectional pipe with LD applied internally. So, the content written to the master is transmitted to the slave, and the content written by the slave is transmitted to the master. However, unlike a bidirectional pipe, there is a difference in that it is delivered after various processing is performed in LD using an internal buffer, etc.

In Linux, these ptys are served through a virtual filesystem called `devpts`. `devpts` connects the master to `/dev/ptmx` and the slave to `/dev/pts/<n>`. In this case, `<n>` is a number that increases by 1 each time a pty is created. Slave device files are created one per pty pair, and for the master, only one special file called `/dev/ptmx` is used. Each time the `/dev/ptmx` file is opened, it creates a new pty pair and returns the file descriptor of its master.

Originally, a cumbersome process of obtaining a PTS descriptor through this PTM descriptor and setting permissions was required. However, in Python, you can conveniently obtain the file descriptor of a pty pair using the function called `os.openpty`.

Below is the script we looked at earlier modified to use pty.

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
     close_fds=True;
)

time.sleep(1)

print("Pgrp after command: ", os.tcgetpgrp(sys.stdout.fileno()), os.getpid())

try:
     time.sleep(99999)
except:
     pass
print(f"Exiting...")
```

The execution result is as follows.

```
Pgrp before command: 292251 292251
Pgrp after command: 292251 292251
^CExiting...
```

Unlike before, the foreground process has not changed. Because you have set stdin, stdout to pts, so it uses a different terminal than the parent process. In the same way, the output of the ping command is not displayed, and even when Ctrl+C is pressed, a signal is normally sent to the parent process and the process is terminated.

To check the output, you can modify the waiting code as follows:

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
     close_fds=True;
)

time.sleep(1)

print("Pgrp after command: ", os.tcgetpgrp(sys.stdout.fileno()), os.getpid())

try:
     whileTrue:
         data = os.read(master, 1024)
         if not data:
             break
         os.write(sys.stdout.fileno(), data)
except:
     pass
print(f"Exiting...")
```

The execution result is as follows.

```
Pgrp before command: 292942 292942
Pgrp after command: 292942 292942
bash: cannot set terminal process group (292942): Inappropriate ioctl for device
bash: no job control in this shell
PING 1.1.1.1 (1.1.1.1) 56(84) bytes of data.
64 bytes from 1.1.1.1: icmp_seq=1 ttl=52 time=5.35 ms
64 bytes from 1.1.1.1: icmp_seq=2 ttl=52 time=10.2 ms
64 bytes from 1.1.1.1: icmp_seq=3 ttl=52 time=9.19 ms
64 bytes from 1.1.1.1: icmp_seq=4 ttl=52 time=32.7 ms
^CExiting...
```

Unlike the previous examples, when you press Ctrl+C, the statistics displayed by the ping command are not visible. In the previous examples, the child process output data directly to the terminal, so the data was displayed even if it was output after the parent process terminated. However, in this case, because the parent process reads data from ptm and output it, the data is output as soon as the parent process terminates. This is because it breaks.

> bash: cannot set terminal process group ... The error appears to be because, inside the Popen command, a pipe is used instead of a tty device to connect stdin and stdout. If you use fork directly as shown below, you can get the same result without error.

```python
import sys
import os

master, slave = os.openpty()

if os.fork() == 0:
     os.close(master)
     os. setsid()
     os.dup2(slave, 0)
     os.dup2(slave, 1)
     os.dup2(slave, 2)
     os.execvp("bash", ["bash", "-c", "-i", "ping 1.1.1.1 -c 100"])

os.close(slave)

try:
     whileTrue:
         data = os.read(master, 1024)
         if not data:
             break
         os.write(sys.stdout.fileno(), data)
except:
     pass
print(f"Exiting...")
```

## Conclusion

In this article, we learned about the structure of tty, LD, and pty.

- tty is an interface that abstracts the terminal.
- LD provides various functions required when using the terminal.
- pty provides the ability to simulate a real terminal device.

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
