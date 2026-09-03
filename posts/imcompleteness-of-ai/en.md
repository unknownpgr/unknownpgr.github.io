---
title: The Incompleteness of State-Machine AI — Why Can't ChatGPT Multiply?
tags:
  - ai
date: 2023-02-18T10:53:03.216Z
---

> This post was translated from Korean into English by AI.

With ChatGPT's recent meteoric rise, expectations for AI are growing. AI has now moved beyond theory and is being put to practical use in everyday life. In this post, however, I will examine ChatGPT's limitations and propose a way to overcome them.

# The Incompleteness of ChatGPT

Whether it is AI or a complex algorithm, every machine has computational limitations imposed by its structure.

No matter how complex a state machine is, it can ultimately process only inputs of finite length. Increasing the size of the machine can increase the length of the strings it can process, but a limit will always remain. For example, a state machine can never solve the problem of determining whether an arbitrary string contains equal numbers of a's and b's. This follows from the pigeonhole principle.

ChatGPT has an enormously complex architecture. But no matter how complex its architecture may be, it is still just one gigantic function and, at best, cannot go beyond a state machine. In other words, it cannot theoretically solve problems that require more than one step.

At first glance, ChatGPT appears to be quite capable of solving problems involving multiple steps. For example, it handles procedural problems like the one below quite well.

```
User: let a number k = 1. Repeat following operation 10 times.
- k = k * 2

ChatGPT: Sure! Here are the intermediate results after each iteration:

k = k * 2 = 2
k = k * 2 = 4
k = k * 2 = 8
k = k * 2 = 16
k = k * 2 = 32
k = k * 2 = 64
k = k * 2 = 128
k = k * 2 = 256
k = k * 2 = 512
k = k * 2 = 1024
So after 10 iterations, the value of k is 1024.
```

But this is only how it appears. Powers of two were likely well represented in the dataset, so this is merely something ChatGPT can handle easily.

Multiplication is, in fact, a procedural task, and an architecture like ChatGPT's therefore cannot solve multiplication problems. For example, ChatGPT usually gives the wrong answer to a question like the one below.

```
User: 314 * 159

ChatGPT: 314 * 159 = 49,826
```

The actual answer is 49926. This is because, for operations like this, ChatGPT is nothing more than a low-resolution lookup table.

Likewise, it cannot solve the problem mentioned earlier either.

```
User: Does following string contains same number of a and b?
- "aaaabb"

ChatGPT: No, the string "aaaabb" does not contain the same number of "a" and "b".

There are four "a"s and two "b"s in the string, so there are twice as many "a"s as "b"s. Therefore, the string does not contain the same number of "a" and "b".
```

It solves the problem well when the string is short, but

```
User: Does following string contains same number of a and b? If there are more 'a', say "More a", if there are more 'b', say "More b", If there are same "a" and "b", say "Same", and never say anything else.
- "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"

ChatGPT: Same.
```

it becomes easily confused when the string is long. The string actually contains 153 a's and 168 b's.

Similarly, even a relatively short string becomes difficult if it is complex.

```
User: Does following string contains same number of a and b? If there are more 'a', just say "More a", if there are more 'b', just say "More b", If there are same "a" and "b", just say "Same", and never say anything else.
- "char
bbbbbaabbabbaaaaaaab"

ChatGPT: More b
```

But the string above actually contains exactly 10 a's and 10 b's. This is because the problem cannot be solved with a lookup-table approach; iteration is the only option.

Of course, it cannot correctly perform a calculation like the one below either.

```
User: Calculate following. Just show me the answer without explanation.
10 + 11 - 32 + 96 - 34 +23 - 88

ChatGPT: 26
```

The actual answer is -14.

# Solution

This is because, unlike RNNs and similar architectures, ChatGPT is designed to solve a problem in a single step. AI models are also growing exponentially because, in an attempt to achieve greater performance with a single function or state machine, their parameter space is being excessively expanded.

Solving these problems requires an AI model structured like a Turing machine. Personally, I think this problem could be readily solved by using the attention mechanism to implement a write head, whereas attention currently serves only as a read head.

Traditionally, the model itself serves as memory, with data embedded in its parameters. This approach, however, could separate the parameters from memory, keep the model sufficiently small, and embed memory in a huge state vector corresponding to a Turing machine's tape. In other words, the model could take a big-state, small-model form. With this architecture, its performance could be improved as much as desired simply by increasing the size of the state vector.

This architecture is known as a Neural Turing Machine (NTM), and although it is being actively researched, there do not appear to have been any particularly remarkable results. I suspect this is because an NTM's ability to produce delayed output means that it can be trained only through reinforcement learning, making training considerably expensive.

Before I finish my military service, my goal is to build an NTM language model capable of performing the simple tasks presented above that ChatGPT cannot perform.
