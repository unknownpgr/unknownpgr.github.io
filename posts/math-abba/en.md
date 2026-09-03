---
title: Which Is Greater, a^b or b^a?
tags:
  - math
date: 2021-01-01T03:27:09.638Z
---

> This post was translated from Korean into English by AI.

One day, out of the blue, I found myself wondering whether $e^\pi$ or $\pi^e$ was greater. Of course, it is easy to find out with a calculator, but I wanted to prove which one was greater without using one.

So, on a whim, I proved it.

Here is the proof.

---

Let us generalize the question and compare $a^b$ and $b^a$ for positive numbers $a$ and $b$.

$$
a^b>b^a\\
\leftrightarrow b\log a > a \log b
(\because x>y\leftrightarrow\log x> \log y)\\
\leftrightarrow \frac{b\log a}{ab}>\frac{a \log b}{ab}
(\because ab>0)\\
\leftrightarrow \frac{\log a}{a}>\frac{\log b}{b}
$$

Now, let

$$
f(x) = \frac{\log x}{x}
$$

Then

$$
f'(x)=\frac{1-\log x}{x^2}
$$

- Therefore, if $x\geq e$, we can see that $f(x)$ is monotonically decreasing.
- Thus, at least when $a,b\geq e$, the ordering of $a^b$ and $b^a$ is the reverse of the ordering of $a$ and $b$.
- Since $e\geq e$, $\pi \geq e$, and $\pi>e$, it follows that $\pi^e<e^\pi$.

Calculating the values confirms this: $e^\pi\sim23.14$ and $\pi^e\sim22.45$, so $e^\pi$ is slightly greater.
