---
title: Importance Sampling
tags:
  - math
date: 2023-09-01T13:53:39.200Z
---

> This post was translated from Korean into English by AI.

**Importance Sampling**: A method for estimating the expected value of $f(x)$ when $x\sim p(x)$, where $p(x)$ is a random variable that is difficult to sample from, by using a random variable $q(x)$ that is easy to sample from.

## Proof

$$
\begin{aligned}
\mathbb{E}_{x\sim p(x)}[f(x)] &= \int f(x)p(x)dx \\
&= \int f(x)\frac{p(x)}{q(x)}q(x)dx \\
&= \mathbb{E}_{x\sim q(x)}\left[\frac{p(x)}{q(x)}f(x)\right]
\end{aligned}
$$

## Example

For the probability distribution $p(x)=\frac{e^{-x^2}}{\sqrt{\pi}}$, suppose we want to estimate the expected value of $f(x)=x^2$ when $x\sim p(x)$.

Since $p(x)$ is difficult to integrate, it is not easy to sample from it.

- If a function is easy to integrate, it is possible to sample from it using the inverse of its cumulative distribution function and a uniform distribution on [0, 1].
- Of course, in practice, the function above is a normal probability density function with variance $1/\sqrt{2}$, and there are many sampling methods for it, so it can be sampled easily. For the sake of this example, however, let us assume that it is difficult.

Therefore, let us estimate the expected value of $f(x)$ by sampling from $q(x)=\mathcal{N}(0,1)$.

- The theoretical expected value is 0.5.

We can estimate the expected value with the following code.

```python
import numpy as np


def func(x):
    return x**2


def p(x):
    return np.exp(-(x**2)) / (np.sqrt(np.pi))


def q(x):
    # Return proboability density function of a normal distribution
    return np.exp(-(x**2) / 2) / (np.sqrt(2 * np.pi))


# Sample from a normal distribution, sample size = 10000
mu = 0
sigma = 1
sample_size = 100000
sample = np.random.normal(mu, sigma, sample_size)

# Calculate the expectation
expectation = np.mean(func(sample) * p(sample) / q(sample))
print(expectation)
```

The output is 0.5008740539678816, which is very close to 0.5.
