---
title: trace-cmd 및 ftrace 이해하기
category: computer structure
---

이 글에서는 `ftrace` 및 `ftrace`의 커맨드라인 유틸리티인 `trace-cmd`의 동작 원리를 이해하고, 이를 사용하여 리눅스 커널 트레이싱을 해 보고자 합니다.

![Commands To Check Bad Sectors On Hard Disk In Linux | Itsubuntu.com](imgs/Free_Linux_Tutorials.png)


# ftrace 이해하기

## ftrace란?

 `ftrace` 란 linux에서 제공하는 일종의 프레임워크입니다. `ftrace`는 `strace` 등과 다르게 하나의 프로그램이 아니고 리눅스에서 제공하는 기능의 일종이라서, 안타깝게도 `ftrace ping 8.8.8.8` 과 같은 느낌으로 간단하게 사용할 수는 없습니다.

`ftrace`는 `/sys/kernel/debug/tracing` 디렉토리에 있는 파일시스템에 접근하여 읽거나 쓰는 방식으로 작동합니다. 예를 들어서, 아래와 같이 `do_page_fault` 함수 호출을 tracing할 수 있습니다.

```bash
cd /sys/kernel/debug/tracing
echo function > current_tracer
echo do_page_fault > set_ftrace_filter
cat trace
```

위 코드를 보면, 먼저 `tracer`를 `function`으로 설정하고 있습니다. `tracer`란 트레이싱을 실제로 수행하는 플러그인을 말하는데, `function`으로 설정하면 모든 function call을 수집하고, `event`로 설정하면 모든 이벤트를 수집하는 방식입니다. 그 다음 줄의 `set_trace_filter`는 그 이름에서 알 수 있듯, 트레이싱되는 것들 중 일부만을 선택하겠다는 의미입니다. 이 경우에는 `do_page_fault` 함수만을 수집했습니다. 마지막으로 `trace` 파일을 읽음으로써 실제 트레이싱을 수행합니다. 아래는 `ftrace`의 사용 예시입니다. ([출처](https://lwn.net/Articles/365835/))

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

## ftrace의 동작 원리

이 `ftrace`는 그러면 어떻게 동작하는 걸까요? 유저 스페이스에서 동작하는 프로그램을 디버깅하는 것도 쉽지 않은데 커널에서 수행되는 작업들을, 그것도 여러 cpu에서 수행되는 작업들을 전부 수집하기란 쉽지 않아 보입니다. (사실 저는 `ftrace`에 대해 알기 전까지는 이런 작업이 가능하다는 것 자체를 몰랐습니다.) 심지어 `ftrace`를 사용한다고 해서 프로세스의 실행 속도가 엄청나게 느려지거나 하지도 않습니다. (물론 어느 정도 느려지기는 합니다만, 약 20~30%정도밖에 느려지지 않는다고 합니다.)

[위키백과](https://en.wikipedia.org/wiki/Ftrace#cite_note-9)와 여러 인터넷 자료들을 찾아 본 결과([자료 1](https://jvns.ca/blog/2017/03/19/getting-started-with-ftrace/), [자료 2](https://elinux.org/images/d/d6/Measuring-function-duration-with-ftrace.pdf), [자료 3](https://www.kernel.org/doc/Documentation/trace/ftrace.txt)), 자세하지는 않지만 대강의 작동 원리를 파악할 수 있었습니다.

### Function Entry Tracing

먼저 function entry tracing의 경우 애초에 커널이 컴파일될 때 특수한 instruction이 삽입됩니다. 구체적으로는 커널을 컴파일할 때  `gcc`에서 `-pg` 옵션을 주면 함수가 호출될 때 `mcount`라는 함수를 호출하는 instruction을 삽입합니다. 구체적으로는 아래와 같습니다.

```asm
mov ip, lr
bl 0 <mcount>
andeq r0, r0, r8, lsr #32
```

이 `mcount`라는 함수는 실제로 사용되는 함수는 아니며, 나중에 다른 함수로 대체될, 아무것도 하지 않는 function stub입니다.

이렇게 컴파일이 끝난 후, `recordmcount`라는 프로그램이 실행됩니다. 이 프로그램은 C 오브젝트의 ELF header를 파싱하여  `.text` 섹션(실제로 코드가 저장되는 섹션)에서 `mcount`함수를 호출하는 위치를 전부 찾아냅니다. 그리고 `__mcount_loc`이라는 섹션을 생성하여 이 섹션에 `mcount` 함수를 호출하는 위치를 전부 기록하고, 이것을 다시 원래 오브젝트에 링크합니다. 

이후 커널이 부팅될 때, SMP가 초기화되기 전에 `ftrace`에 의해 이 부분이 전부 `NOP` (아무것도 하지 않는 instruction)으로 바뀝니다. 모듈의 경우에는 모듈이 로드되기 전에 이 과정이 수행됩니다. `ftrace`에는 트레이싱이 가능한 함수들의 목록이 저장되는 `available_filter_functions`  리스트가 있는데, 모듈의 경우에는 추가적으로 이 리스트에 모듈의 함수들이 등록됩니다. 물론 모듈이 unload될 때에는 이 리스트에서 모듈에 포함된 함수들을 삭제합니다.

부팅이 끝난 후 나중에 `ftrace`가 enable 되면 앞서 `NOP`으로 대체했던 instruction들을 다시 원래대로 돌리는 작업이 수행됩니다. 구체적으로는 다시 원래의 `mcount`를 호출하는 instruction들을 복구하되, 이번에는 기존의 function stub인 `mcount`를 호출하는 대신 `ftrace`에 구현되어있는 새로운 `mcount`를 호출하도록 합니다. 이 새로운 `mcount`는 stack frame 구조를 파악해서 tracing을 수행해주는 유용한 기능을 가지고 있습니다. (마치 Java에서 실제 함수 대신 interface 함수를 사용하는 것과 비슷하다고 보시면 되겠습니다.)

(제가 참고한 자료들을 보면 Multi core CPU에서 race condition 방지를 위한 방법까지 포함돼 있지만, 이는 생략하겠습니다.)

이렇게 함으로써 함수 호출을 트레이싱할 수 있게 되는 것입니다.

### Function Exit Tracing

그런데 `ftrace`는 함수 호출 뿐만이 아니라 함수 리턴 역시 트레이싱할 수 있는 기능을 가지고 있습니다. `gcc`의 `-pg`옵션은 오직 함수 호출 부분에만 `mcount`를 삽입해주고, 함수 리턴 부분은 건드리지 않습니다. 그러면 함수 리턴은 어떻게 트레이싱이 가능한 걸까요?

이는 `ftrace`의 `mcount`에 의해 이루어집니다. 즉, 컴파일 타임이 아니라 런타임에 작동하는 것입니다. 이 부분은 설명이 좀 복잡하니 예시를 들면서 설명하겠습니다.

- 먼저 어떤 커널 함수 `void someFunction()`이 `ftrace`에 의해 구현된 `mcount`를 호출한다고 가정합니다.
- 어느 시점에 `someFunction`이 호출되었는데, 호출된 후 리턴해야 할 주소를 `someFunction_ret`이라 가정합니다.
-  `ftrace`에는 함수의 리턴을 트레이싱할 수 있는 특수한 함수가 있는데, 이를 `functionExitTracer`라 부르기로 합니다.

그러면 함수가 호출될 때 다음 작업이 이루어집니다.

1. `someFunciton`의 stack frame이 구성됩니다.
2. `someFunction` 위치로 점프합니다.
3. `mcount`가 호출됩니다.
4. `mcount`에서는 `someFunction`의 stack frame을 분석하여 그 리턴 주소인 `someFunction_ret`을 찾아내어 저장합니다.
5. `mcount`에서는 `someFunction`의 stack frame에서 리턴 주소를 찾아낸 후, 그것을 `functionExitTracer`의 주소로 수정합니다. 즉, `someFunction`이 종료될 때에는 `someFunction_ret`으로 점프하는 것이 아니라 `functionExitTracer`로 점프하게 됩니다.
6. `someFunction`이 종료되고 `functionExitTracer`로 점프합니다.
7. `functionExitTracer`에서 함수 반환 트레이싱 작업을 수행합니다.
8. `functionExitTracer`가 리턴될 때에는 앞서 4번 단계에서 저장해두었던 `someFunction_ret`으로 점프합니다.

이러한 과정을 통하여 함수 반환을 트레이싱할 수 있게 되는 것입니다.

# trace-cmd

이제 본격적으로 kernel tracing을 해 보도록 하겠습니다. `trace-cmd`는 `ftrace`를 좀 더 편리하게 사용할 수 있도록 만들어 둔 커맨드라인 유틸리티로 `sudo apt-get install trace-cmd` 커맨드를 통해 간단히 설치할 수 있습니다.

## 사용법

 `trace-cmd`는 크게 record, report라는 두 가지 단계를 통해 트레이싱을 수행합니다.

먼저 record 단계에서는 `ftrace`를 이용하여 트레이싱을 수행하고, 그 내용을 `trace.dat`이라는 파일에 저장합니다. 이 파일에는 `raw`데이터가 들어 있습니다. 아래와 같이 실행할 수 있습니다. 

```bash
trace-cmd record host google.com # 특정 프로그램을 시작과 동시에 트레이싱
trace-cmd record # Ctrl+C를 누를 때까지 트레이싱
```

다음으로 report 단계에서는 `trace.dat`파일을 읽어서 그 내용을 예쁘게 출력해줍니다. 아래와 같이 실행할 수 있습니다.

```
trace-cmd report
```

물론 `trace-cmd`는 이 두 가지 말고도 다양한 모드를 지원합니다. [trace-cmd man page](https://man7.org/linux/man-pages/man1/trace-cmd.1.html)를 읽어보시면 모든 기능이 상세히 설명되어 있습니다. 그리고 `trace-cmd`의 record 역시 다양한 옵션을 제공합니다. 이 옵션들 역시 [trace-cmd-record man page](https://man7.org/linux/man-pages/man1/trace-cmd-record.1.html)를 읽어보시면 상세히 설명되어있습니다. 그래서 이 글에서는 몇 가지 유용한 옵션만을 설명하고자 합니다.

`-p` : 어떤 트레이서를 사용할지 설정합니다. `function` 트레이서는 이 옵션을 주지 않을 때 선택되는 기본 트레이서로, 모든 function call을 트레이싱합니다. `function_graph`는 function call  및 function exit을 트레이싱하여 보여줍니다.

`-F` : `trace-cmd`는 기본적으로 모든 CPU의 모든 프로세스를 트레이싱합니다. 그러므로 실제로 트레이싱된 결과를 보면 온갖 프로세스가 섞여있을 뿐만 아니라, 문맥 교환 관련 호출들도 다 트레이싱됩니다. 이는 문맥 교환 등을 고려할 때에는 좋은 방법이겠지만, 한 프로세스의 동작을 보기에는 적합하지 않습니다. `-F` 옵션을 주면 특정 프로그램을 인자로 줘서 트레이싱할 때, 오직 그 프로세스만을 트레이싱합니다. (아무 프로그램도 인자로 주지 않고 실행할 때에는 사용할 수 없습니다.)

`-P` : `-F`와 유사한데, 인자로 주어진 프로그램이 아니라 특정 PID를 가진 프로세스를 트레이싱합니다. 이미 실행 중인 프로세스를 트레이싱하고 싶을 때 유용합니다.

`-c` : 특정 프로세스를 트레이싱할 때 그 자식 프로세스까지 함께 트레이싱합니다. `-P`나 `-F` 옵션과 함께 사용할 수 있습니다.

## 예시

`trace-cmd`를 사용하여 `host google.com` 를 실행하고, 트레이싱해보겠습니다.

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

이제 트레이싱 된 결과를 확인해보겠습니다. 그냥 `report`를 수행하면 내용이 너무 길어서 보기 힘들기 때문에, 결과를 파일에 쓰도록 하겠습니다.

```
~$ sudo trace-cmd report > trace.txt
~$ ls -al --block-size k
total 63316K
...
-rw-r--r-- 1 root       root       16468K May 29 10:20 trace.dat
-rw-rw-r-- 1 unknownpgr unknownpgr 22707K May 29 10:23 trace.txt
```

1.6M짜리 raw 파일과 2.2M짜리 report 파일을 얻었습니다. 이 파일을 살펴보면 프로그램이 커널 내에서 어떻게 동작하는지 알 수 있습니다. 예를 들어, 아래와 같은 소켓 생성 부분을 찾을 수 있었습니다.

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

# 결론

이 포스팅에서는 리눅스 커널 트레이싱 도구인 `trace-cmd`의 작동 원리를 살펴보고, 커맨드라인 유틸리티인 `trace-cmd`를 통해 실제로 프로세스의 커널 트레이싱을 수행해봤습니다. 재밌네요. 오늘도 리눅스 커널에 대한 이해가 깊어졌습니다. ㅎㅎ

다음에는 이를 이용하여 저번에 작성했던 [웹브라우저에서 검색할 때 어떤 일이 벌어지나?](/posts/internal-steps) 글을 좀 더 자세하게 업데이트해볼까 합니다.

## TMI

자료조사 하다 보니 폭발해버린 탭들....

![image-20210529195650458](imgs/image-20210529195650458.png)
