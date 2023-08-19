---
title: 'Importance Sampling'
category: math science
date: 

---

**Importance Sampling** : 샘플링이 어려운 확률변수 $p(x)$에 대하여, 샘플링이 용이한 확률변수 $q(x)$를 통해 $x\sim p(x)$일 때 $f(x)$의 기댓값을 추정하는 방법.

## 증명

$$
\begin{aligned}
\mathbb{E}_{x\sim p(x)}[f(x)] &= \int f(x)p(x)dx \\
&= \int f(x)\frac{p(x)}{q(x)}q(x)dx \\
&= \mathbb{E}_{x\sim q(x)}\left[\frac{p(x)}{q(x)}f(x)\right]
\end{aligned}
$$

## 예시

확률분포 $p(x)=\frac{e^{-x^2}}{\sqrt{\pi}}$에 대하여, $x\sim p(x)$일 때 $f(x)=x^2$의 기댓값을 추정하고자 한다.

이때 $p(x)$는 적분이 어려운 함수이므로 이로부터 샘플링하기 쉽지 않다.
- 만약 적분이 간단한 함수인 경우 누적분포함수의 역함수를 통해 [0, 1]균등분포로부터 샘플링이 가능하다.
- 물론 실제로는 위 함수는 분산이 $1/\sqrt{2}$인 정규분포함수이며 많은 샘플링 방법이 있으므로 쉽게 샘플링할 수 있다. 그러나 예시를 위하여 어렵다고 가정하자.

따라서 $q(x)=\mathcal{N}(0,1)$로부터 샘플링하여 $f(x)$의 기댓값을 추정해보자.
- 이때 이론적인 기댓값은 0.5이다.

아래와 같은 코드를 통해 기댓값을 추정할 수 있다.

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

출력은 0.5008740539678816로, 거의 0.5에 가까운 값이다.