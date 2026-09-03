---
title: Thoughts on Imaginary Number Systems
tags:
  - math science
date: 2021-05-22T20:58:54.216Z
---

> This post was translated from Korean into English by AI.

Sometime around middle or high school, we learn what imaginary numbers are. Imaginary numbers can be thought of as an extension of the real numbers with respect to the square root operation. But as I was about to go to sleep today, a random thought occurred to me: couldn't we create other number systems in a similar way? Of course, mathematicians have already devised other number systems, such as the quaternions and octonions. And brilliant mathematicians must have thought about this a great deal since imaginary numbers first appeared, so the fact that no other particularly suitable systems have emerged clearly means it will not work no matter how hard you try. Still, I was curious about why it would not work, so I decided to give it a try myself.

# A New Number System

First, let us imagine a number that is undefined under existing operations, and then create a new number system that includes it.

## For Every Integer $x$, $x\times p=x+1$: A Number $p$

For example, $2p=3$ and $3p=4$. At first glance, this number system somehow...seems as though it might be well-defined. For instance:

- Powers can be defined, as in $2p^2=(2p)p=3p=4$.
- Reciprocals can be defined, as in $2/p=x\leftrightarrow2=px\leftrightarrow 2=x+1\leftrightarrow x=1$.
- Square roots can be defined, as in $2\sqrt p=\sqrt{2^2p}=\sqrt{5}$.
- Even exponentiation can be defined, as in $4^p=(2^2)^p=2^{2p}=2^3=8$.

You may already have sensed that something was strange around the square-root example, and indeed, this number system does not satisfy several important properties.

- Since $(1+1)p=2p=3\not=1p+1p=2+2=4$, it does not satisfy the distributive law.
- Since $2\times1\times p=(2\times1)\times p=2p=3\not=2\times(1\times p)=2\times2=4$, it does not satisfy the associative law either.

Therefore, such a number cannot be incorporated into the existing number system.

## A Number Such That $1/0=p$, or Equivalently $0p=1$: $p$

In fact, this is merely a more formal way of expressing the perennial question that comes up when people first learn about limits: "Why can't we define $1/0=\infin$?"

- To begin with, this does not cause any major problems with addition or subtraction either, since we can simply treat it like an unknown.
- The same is true of multiplication: we can treat it like an unknown and take a little extra care only when it is multiplied by 0 or in similar cases.

However, this system also fails to satisfy the distributive law.

- Since $(0+0)p=(0)p=1\not =0p+0p=1+1=2$, it does not satisfy the distributive law.

## Conclusion

From these few experiments, I learned that we cannot create a useful number system simply by loosely defining strange numbers, and that the imaginary numbers are a remarkably well-designed—or perhaps discovered—number system.
