---
title: Understanding trace-cmd and ftrace
tags:
  - computer structure
date: 2021-05-29T10:56:39.790Z
---

> This post was translated from Korean into English by AI.

In this post, we will explore how `ftrace` and its command-line utility, `trace-cmd`, work, and use them to trace the Linux kernel.

![Commands To Check Bad Sectors On Hard Disk In Linux | Itsubuntu.com](imgs/Free_Linux_Tutorials.png)

# Understanding ftrace

## What Is ftrace?

`ftrace` is a framework provided by Linux. Unlike `strace` and similar tools, `ftrace` is not a standalone program but a feature provided by Linux, so unfortunately it cannot be used as simply as something like `ftrace ping 8.8.8.8`.

`ftrace` works by reading from and writing to the filesystem under `/sys/kernel/debug/tracing`. For example, you can trace calls to the `do_page_fault` function as follows.

```bash
cd /sys/kernel/debug/tracing
echo function > current_tracer
echo do_page_fault > set_ftrace_filter
cat trace
```

In the code above, the `tracer` is first set to `function`. A `tracer` is a plugin that actually performs the tracing. When set to `function`, it collects every function call; when set to `event`, it collects every event. As its name suggests, `set_trace_filter` on the next line means that we want to select only some of the items being traced. In this case, only the `do_page_fault` function is collected. Finally, the actual trace is obtained by reading the `trace` file. Below is an example of using `ftrace`. ([Source](https://lwn.net/Articles/365835/))

```
    [tracing]# echo function > current_tracer
    [tracing]# cat current_tracer
    function

    [tracing]# cat trace | head -10
    # tracer: function
    #
    #           TASK-PID    CPU#    TIMESTAMP  FUNCTION
    #              | |       |          |         |
                bash-16939 [000]  6075.461561: mutex_unlock <-tracing_set_tracer
              <idle>-0     [001]  6075.461561: _spin_unlock_irqrestore <-hrtimer_get_next_event
              <idle>-0     [001]  6075.461562: rcu_needs_cpu <-tick_nohz_stop_sched_tick
                bash-16939 [000]  6075.461563: inotify_inode_queue_event <-vfs_write
              <idle>-0     [001]  6075.461563: mwait_idle <-cpu_idle
                bash-16939 [000]  6075.461563: __fsnotify_parent <-vfs_write
```

## How ftrace Works

So how does `ftrace` work? Debugging programs running in user space is difficult enough; collecting every operation performed in the kernel, especially those running across multiple CPUs, hardly seems easy. (In fact, before I learned about `ftrace`, I did not even know that this was possible.) What is more, using `ftrace` does not make a process run dramatically slower. (There is, of course, some slowdown, but it is said to be only around 20–30%.)

After looking through [Wikipedia](https://en.wikipedia.org/wiki/Ftrace#cite_note-9) and various online resources ([Resource 1](https://jvns.ca/blog/2017/03/19/getting-started-with-ftrace/), [Resource 2](https://elinux.org/images/d/d6/Measuring-function-duration-with-ftrace.pdf), [Resource 3](https://www.kernel.org/doc/Documentation/trace/ftrace.txt)), I was able to get a rough, if not detailed, understanding of how it works.

### Function Entry Tracing

For function entry tracing, special instructions are inserted when the kernel itself is compiled. Specifically, passing the `-pg` option to `gcc` when compiling the kernel inserts an instruction that calls a function named `mcount` whenever a function is invoked. More specifically, it looks like this.

```asm
mov ip, lr
bl 0 <mcount>
andeq r0, r0, r8, lsr #32
```

The `mcount` function is not one that is actually used; it is a function stub that does nothing and will later be replaced by another function.

Once compilation is complete, a program called `recordmcount` is run. This program parses the ELF headers of the C objects and locates every call to the `mcount` function in the `.text` section (the section where the actual code is stored). It then creates a section named `__mcount_loc`, records every location that calls `mcount` in that section, and links it back into the original object.

Later, when the kernel boots, `ftrace` replaces all of these instructions with `NOP`s (instructions that do nothing) before SMP is initialized. For a module, this process is performed before the module is loaded. `ftrace` has an `available_filter_functions` list containing all functions that can be traced; for modules, their functions are also registered in this list. Naturally, when a module is unloaded, the functions it contains are removed from the list.

After booting is complete, when `ftrace` is enabled, the instructions that were previously replaced with `NOP`s are restored. More precisely, the original instructions that call `mcount` are restored, but this time they call a new `mcount` implementation in `ftrace` instead of the original `mcount` function stub. This new `mcount` has the useful ability to inspect the stack frame structure and perform tracing. (You can think of it as similar to writing Java code against an interface rather than a particular object: when that code later runs, an actual object is supplied in place of the empty interface.)

(The resources I consulted also cover how race conditions are prevented on multi-core CPUs, but I will omit that here.)

This is what makes it possible to trace function calls.

### Function Exit Tracing

However, `ftrace` can trace not only function calls but also function returns. The `-pg` option in `gcc` inserts `mcount` only at function entry points and does not touch function returns. So how can function returns be traced?

This is handled by `ftrace`'s `mcount`. In other words, it works at runtime, not at compile time. This part is a bit complicated to explain, so I will walk through an example.

- First, suppose that a kernel function named `void someFunction()` calls the `mcount` implemented by `ftrace`.
- Suppose that at some point `someFunction` is called, and that the address to which it should return afterward is `someFunction_ret`.
- `ftrace` has a special function capable of tracing function returns; let us call it `functionExitTracer`.

The following steps then take place when the function is called.

1. The stack frame for `someFunciton` is constructed.
2. Execution jumps to the location of `someFunction`.
3. `mcount` is called.
4. `mcount` analyzes the stack frame of `someFunction`, finds its return address, `someFunction_ret`, and saves it.
5. After finding the return address in the stack frame of `someFunction`, `mcount` changes it to the address of `functionExitTracer`. In other words, when `someFunction` finishes, it jumps to `functionExitTracer` rather than to `someFunction_ret`.
6. `someFunction` finishes and jumps to `functionExitTracer`.
7. `functionExitTracer` performs function-return tracing.
8. When `functionExitTracer` returns, it jumps to `someFunction_ret`, which was saved in step 4.

This process makes it possible to trace function returns.

# trace-cmd

Now let us get into kernel tracing in earnest. `trace-cmd` is a command-line utility designed to make `ftrace` easier to use, and it can be installed simply by running `sudo apt-get install trace-cmd`.

## Usage

`trace-cmd` performs tracing in two main stages: record and report.

In the record stage, it uses `ftrace` to perform tracing and stores the results in a file named `trace.dat`. This file contains `raw` data. You can run it as follows.

```bash
trace-cmd record host google.com # Trace a specific program from the moment it starts
trace-cmd record # Trace until Ctrl+C is pressed
```

Next, in the report stage, it reads the `trace.dat` file and displays its contents in a nicely formatted form. You can run it as follows.

```
trace-cmd report
```

Of course, `trace-cmd` supports many modes besides these two. The [trace-cmd man page](https://man7.org/linux/man-pages/man1/trace-cmd.1.html) explains all of its features in detail. The record mode of `trace-cmd` also provides a wide range of options, which are described in detail on the [trace-cmd-record man page](https://man7.org/linux/man-pages/man1/trace-cmd-record.1.html). For that reason, this post will cover only a few useful options.

`-p`: Sets which tracer to use. The `function` tracer is selected by default when this option is omitted, and it traces every function call. `function_graph` traces and displays both function calls and function exits.

`-F`: By default, `trace-cmd` traces every process on every CPU. Consequently, the trace output contains not only all sorts of intermingled processes but also every call related to context switching. This may be useful when context switching and similar behavior matter, but it is not suitable for examining a single process. When you provide a particular program as an argument, the `-F` option traces only that process. (It cannot be used when no program is supplied as an argument.)

`-P`: Similar to `-F`, but traces a process with a particular PID rather than the program supplied as an argument. This is useful when you want to trace a process that is already running.

`-c`: When tracing a particular process, this also traces its child processes. It can be used together with the `-P` or `-F` option.

## Example

Let us run and trace `host google.com` using `trace-cmd`.

```
~$ sudo trace-cmd record -F -p function_graph host google.com
  plugin 'function_graph'
google.com has address 142.250.206.238
google.com has IPv6 address 2404:6800:400a:804::200e
google.com mail is handled by 40 alt3.aspmx.l.google.com.
google.com mail is handled by 20 alt1.aspmx.l.google.com.
google.com mail is handled by 30 alt2.aspmx.l.google.com.
google.com mail is handled by 50 alt4.aspmx.l.google.com.
google.com mail is handled by 10 aspmx.l.google.com.
CPU 1: 13674 events lost
CPU0 data recorded at offset=0x644000
    3977216 bytes in size
CPU1 data recorded at offset=0xa0f000
    6316032 bytes in size
```

Now let us examine the trace results. Running `report` directly produces output that is far too long to read comfortably, so we will write the results to a file.

```
~$ sudo trace-cmd report > trace.txt
~$ ls -al --block-size k
total 63316K
...
-rw-r--r-- 1 root       root       16468K May 29 10:20 trace.dat
-rw-rw-r-- 1 unknownpgr unknownpgr 22707K May 29 10:23 trace.txt
```

We obtained a 1.6 MB raw file and a 2.2 MB report file. Examining these files reveals how the program operates inside the kernel. For example, I was able to find the following section where a socket is created.

```
           |  do_syscall_64() {
           |    __x64_sys_socket() {
           |      __sys_socket() {
           |        __sock_create() {
           |          security_socket_create() {
           |            apparmor_socket_create() {
           |              _cond_resched() {
0.255 us   |                rcu_all_qs();
0.709 us   |              }
1.335 us   |            }
2.130 us   |          }
           |          sock_alloc() {
           |            new_inode_pseudo() {
           |              alloc_inode() {
           |                sock_alloc_inode() {
           |                  kmem_cache_alloc() {
           |                    _cond_resched() {
0.225 us   |                      rcu_all_qs();
0.712 us   |                    }
0.251 us   |                    should_failslab();
0.803 us   |                    memcg_kmem_get_cache();
0.348 us   |                    memcg_kmem_put_cache();
3.821 us   |                  }
0.240 us   |                  __init_waitqueue_head();
5.003 us   |                }
           |                inode_init_always() {
           |                  make_kuid() {
0.330 us   |                    map_id_range_down();
0.867 us   |                  }
           |                  make_kgid() {
0.236 us   |                    map_id_range_down();
0.686 us   |                  }
0.495 us   |                  security_inode_alloc();
0.240 us   |                  __init_rwsem();
4.147 us   |                }
10.211 us  |              }
0.248 us   |              _raw_spin_lock();
11.224 us  |            }
0.240 us   |            get_next_ino();
12.585 us  |          }
0.255 us   |          try_module_get();
           |          inet_create() {
           |            sk_alloc() {
           |              sk_prot_alloc() {
           |                kmem_cache_alloc() {
           |                  _cond_resched() {
0.225 us   |                    rcu_all_qs();
0.682 us   |                  }
0.225 us   |                  should_failslab();
0.870 us   |                  memcg_kmem_get_cache();
0.225 us   |                  memcg_kmem_put_cache();
3.476 us   |                }
0.225 us   |                page_poisoning_enabled();
           |                security_sk_alloc() {
           |                  __kmalloc() {
0.233 us   |                    kmalloc_slab();
           |                    _cond_resched() {
0.221 us   |                      rcu_all_qs();
0.743 us   |                    }
0.225 us   |                    should_failslab();
0.232 us   |                    memcg_kmem_put_cache();
3.454 us   |                  }
3.945 us   |                }
0.225 us   |                try_module_get();
9.709 us   |              }
0.225 us   |              __init_waitqueue_head();
0.237 us   |              mem_cgroup_sk_alloc();
0.240 us   |              cgroup_sk_alloc();
12.446 us  |            }
           |            sock_init_data() {
0.237 us   |              init_timer_key();
0.885 us   |            }
           |            tcp_v4_init_sock() {
           |              tcp_init_sock() {
           |                tcp_init_xmit_timers() {
           |                  inet_csk_init_xmit_timers() {
0.225 us   |                    init_timer_key();
0.248 us   |                    init_timer_key();
0.225 us   |                    init_timer_key();
1.639 us   |                  }
           |                  hrtimer_init() {
0.342 us   |                    __hrtimer_init();
0.810 us   |                  }
           |                  hrtimer_init() {
0.232 us   |                    __hrtimer_init();
0.686 us   |                  }
4.136 us   |                }
0.228 us   |                jiffies_to_usecs();
           |                tcp_assign_congestion_control() {
0.228 us   |                  try_module_get();
1.005 us   |                }
6.896 us   |              }
7.567 us   |            }
0.450 us   |            __cgroup_bpf_run_filter_sk();
23.693 us  |          }
0.252 us   |          try_module_get();
0.266 us   |          module_put();
           |          security_socket_post_create() {
0.566 us   |            apparmor_socket_post_create();
1.268 us   |          }
43.083 us  |        }
           |        get_unused_fd_flags() {
           |          __alloc_fd() {
0.372 us   |            _raw_spin_lock();
0.371 us   |            expand_files();
1.785 us   |          }
2.314 us   |        }
           |        sock_alloc_file() {
           |          alloc_file_pseudo() {
           |            d_alloc_pseudo() {
           |              __d_alloc() {
           |                kmem_cache_alloc() {
           |                  _cond_resched() {
0.229 us   |                    rcu_all_qs();
0.675 us   |                  }
0.221 us   |                  should_failslab();
0.742 us   |                  memcg_kmem_get_cache();
0.307 us   |                  memcg_kmem_put_cache();
3.341 us   |                }
0.394 us   |                d_set_d_op();
4.789 us   |              }
5.464 us   |            }
0.330 us   |            mntget();
           |            d_instantiate() {
0.341 us   |              security_d_instantiate();
0.251 us   |              _raw_spin_lock();
           |              __d_instantiate() {
0.330 us   |                d_flags_for_inode();
0.244 us   |                _raw_spin_lock();
1.357 us   |              }
3.018 us   |            }
           |            alloc_file() {
           |              alloc_empty_file() {
           |                __alloc_file() {
           |                  kmem_cache_alloc() {
           |                    _cond_resched() {
0.236 us   |                      rcu_all_qs();
1.174 us   |                    }
0.221 us   |                    should_failslab();
0.799 us   |                    memcg_kmem_get_cache();
0.225 us   |                    memcg_kmem_put_cache();
3.870 us   |                  }
           |                  security_file_alloc() {
           |                    kmem_cache_alloc() {
           |                      _cond_resched() {
0.225 us   |                        rcu_all_qs();
0.660 us   |                      }
0.217 us   |                      should_failslab();
0.319 us   |                      memcg_kmem_put_cache();
2.423 us   |                    }
           |                    apparmor_file_alloc_security() {
           |                      _cond_resched() {
0.225 us   |                        rcu_all_qs();
0.690 us   |                      }
1.173 us   |                    }
4.388 us   |                  }
0.222 us   |                  __mutex_init();
9.401 us   |                }
10.335 us  |              }
11.119 us  |            }
21.465 us  |          }
22.151 us  |        }
           |        fd_install() {
0.293 us   |          __fd_install();
0.727 us   |        }
69.727 us  |      }
70.260 us  |    }
0.229 us   |    fpregs_assert_state_consistent();
71.509 us  |  }
```

# Conclusion

In this post, we examined how the Linux kernel tracing framework `ftrace` works and used the command-line utility `trace-cmd` to trace a process inside the kernel. This is fascinating. Today, once again, I deepened my understanding of the Linux kernel. Haha.

Next time, I may use this to expand my previous post, [What Happens When You Search in a Web Browser?](/posts/internal-steps), with a more detailed account.

## TMI

All the tabs that exploded while I was doing the research....

![image-20210529195650458](imgs/image-20210529195650458.png)
