---
title: Quine
tags:
  - algorithm
date: 2021-04-05T21:27:20.117Z
---

> This post was translated from Korean into English by AI.

# Introduction

 While browsing the internet, I happened to stumble across something called a quine. A quine is a program whose source code, when executed, prints itself. The most obvious quine is an empty source file. Since an empty source file prints nothing, it can be said to print itself. Of course, you are not allowed to use `string` execution functions such as `eval` or `exec`, `reflection`, simply read the file, use external libraries, and so on.

# Source Code

I wrote a quine with the following Python code.

```python
def decode(s):
    s = s.replace("\\", "\\\\")
    s = s.replace('"', '\\"')
    s = s.replace("'", "\\'")
    s = s.replace('''
''', '\\n')
    return s


def self_print(x):
    print(f'''{x}

self_print(
    "{decode(x)}")''')


self_print(
    "def decode(s):\n    s = s.replace(\"\\\\\", \"\\\\\\\\\")\n    s = s.replace(\'\"\', \'\\\\\"\')\n    s = s.replace(\"\'\", \"\\\\\'\")\n    s = s.replace(\'\'\'\n\'\'\', \'\\\\n\')\n    return s\n\n\ndef self_print(x):\n    print(f\'\'\'{x}\n\nself_print(\n    \"{decode(x)}\")\'\'\')")

```

When you run the code above, its output is perfectly identical to itself.

## Logical Derivation

I had never heard anything about how to implement a quine, so I started entirely from scratch. As a result, my approach may differ somewhat from that of other implementations.

The function above began with the following idea.

> What if the language itself had a function called self_print(x), whose output was
>
> self_print("x")
>
> ?

If so, the following code would be a quine.

```python
self_print("any string")
```

Of course, Python has no such function. Therefore, we need to define the `self_print` function ourselves.

```python
def self_print(x):
	# ~~~

sef_print("any string")
```

But a problem arises here. Because the definition of the `self_print` function itself is not printed, this is not a quine. To turn it into one, the output must include the definition of the `self_print` function itself. There are two ways to do this.

1. Put a string that defines the `self_print` function inside the `self_print` function.
2. Put a string that defines the `self_print` function outside the `self_print` function.

If you think about it, you can see that the first option is impossible. Suppose it takes $n$ characters to define the `self_print` function. Simply enclosing that definition in quotation marks would require $n+2$ characters. But because this string would then have to be included in the definition of the `self_print ` function again, we would need $n+2 < n$, which is a contradiction.

 Therefore, the string must exist outside the `self_print` function, and it must be passed into `self_print `. The obvious way to do this is to use a parameter of the `self_print` function.

 Now the function can access its own definition from within itself. All that remains is to include it in the output. In other words, we can do the following.

```python
def self_print(x):
    print(f'''{x}

self_print(
    "{x}")''')
```

With this implementation, it becomes a quine when `self_print` receives a string representing the definition of `self_print` as its argument.

 There is just one minor problem: string escaping. To put a double quotation mark inside a string literal declared with double quotation marks, or to represent a line break, it must be escaped. But when output is produced with `print`, all the escape characters have already been processed. We therefore need to add a step that re-escapes the escaped string. Adding that part—the `decode` function in the source code above—produces the same result as the code shown above.
