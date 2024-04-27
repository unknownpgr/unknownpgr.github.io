---
title: ""
category:
date:
---

칼만 필터는 측정값을 통해 시스템의 상태를 추정하는 확률론적 방법이다. 칼만 필터를 설명하는 방법은 여러가지가 있다. 예를 들어 칼만 필터를 확장된 state observer로 해석하거나 low-pass filter와 high-pass filter의 결합으로 보기도 한다. 그러나 이 글에서는 가장 근본적이라고 생각되는 베이즈 필터의 근사로 칼만 필터를 설명하고자 한다.

## Multivariate Normal Distribution

칼만 필터는 벡터로 이루어진 상태와 그 관측 결과를 multivariate normal distribution으로 가정한다. 그러므로 칼만 필터를 이해하려면 앞서 이에 대한 이해가 필요하다.

### Normal Distribution

먼저 1차원 normal distribution은 다음과 같이 주어진다.

$$
x \sim N(\mu, \sigma^2) \Longleftrightarrow p(x) = \frac{1}{\sqrt{2\pi}\sigma} \exp\left(-\frac{1}{2}\left(\frac{x - \mu}{\sigma}\right)^2\right)
$$

이때 $\mu$는 평균, $\sigma^2$는 분산이다.

### Properties of Normal Distribution

정규분포는 좋은 성질들을 많이 가지고 있는데, 가장 중요한 성질 중 하나는 정규분포는 선형 결합에 대하여 닫혀있다는 것이다. 즉, $x_1 \sim N(\mu_1, \sigma_1^2)$, $x_2 \sim N(\mu_2, \sigma_2^2)$이면 임의의 상수 $a, b$에 대하여 $a x_1 + b x_2$도 정규분포를 따른다.

이것은 정규분포가 상수곱에 대해 닫혀있음을 보인 후 덧셈에 대해 닫혀있음을 보임으로서 쉽게 증명할 수 있는데, 상수곱에 대해 닫혀 있는 것은 매우 간단하므로 생략하고 덧셈에 대해 닫혀있음을 증명한다. 이것은 다양한 방법으로 보일 수 있는데 가장 직관적인 방법은 아래와 같이 직접 계산하여 보이는 것이다.

먼저 독립인 두 확률변수 $x_1 \sim p_1(x)$, $x_2 \sim p_2(x)$의 합$x = x_1 + x_2$의 확률밀도함수는 다음과 같이 두 확률밀도함수의 convolution으로 주어진다.

$$
p(x) = \int p_1(t) p_2(x - t) dt
$$

그러므로 여기에 정규분포의 확률밀도함수를 대입하면 다음과 같다.

$$
p(x) = \int \frac{1}{\sqrt{2\pi}\sigma_1} \exp\left(-\frac{1}{2}\left(\frac{t - \mu_1}{\sigma_1}\right)^2\right) \frac{1}{\sqrt{2\pi}\sigma_2} \exp\left(-\frac{1}{2}\left(\frac{x - t - \mu_2}{\sigma_2}\right)^2\right) dt
$$

이 적분을 풀 때는 먼저 $\exp$함수를 합치고 지수 부분을 전개하여 $t$에 대한 완전제곱꼴로 만든 후 다음의 공식을 사용하면 된다.

$$
\int \exp(-ax^2) dx = \sqrt{\frac{\pi}{a}}
$$

이 방법으로 적분을 풀면 다음과 같이 된다. 실제로는 이 계산을 하려면 지수 내부의 제곱을 전개해야 하는데, 이때 항이 많아 직접 계산하기가 매우 힘들기 때문에 `sympy`를 사용하여 계산했다.

$$
\frac{1}{2 \sqrt{\pi} \sqrt{\sigma_{1}^{2} + \sigma_{2}^{2}}}\sqrt{2} \exp\left(\frac{- \mu_{1}^{2} \sigma_{2}^{2} + \sigma_{1}^{2} \left(- \mu_{2}^{2} + 2 \mu_{2} x - x^{2}\right) + \frac{\left(\mu_{1} \sigma_{2}^{2} - \mu_{2} \sigma_{1}^{2} + \sigma_{1}^{2} x\right)^{2}}{\sigma_{1}^{2} + \sigma_{2}^{2}}}{2 \sigma_{1}^{2} \sigma_{2}^{2}}\right)
$$

이때 지수 부분을 $x$에 대하여 잘 인수분해하면 아래와 같이 정리된다.

$$
\frac{1}{\sqrt{2\pi} \sqrt{\sigma_{1}^{2} + \sigma_{2}^{2}}}
\exp\left(- \frac{\left(x-(\mu_{1} + \mu_{2}) \right)^{2}}{2 (\sigma_{1}^{2} +  \sigma_{2}^{2})}\right)
$$

이것은 정규분포의 정의에 따라 평균이 $\mu_1 + \mu_2$이고 분산이 $\sigma_1^2 + \sigma_2^2$인 정규분포가 된다.

### Definition of Multivariate Normal Distribution

먼저 multivariate normal distribution은 다양한 정의를 가지고 있다. 이중 가장 일반적인 정의는 각 원소의 임의의 선형 결합이 정규분포가 되는 확률분포로 정의하는 것이다. 즉, $x \in \mathbb{R}^n$이 multivariate normal distribution을 따른다는 것은 임의의 벡터 $a \in \mathbb{R}^n$에 대하여 $a^T x$가 normal distribution을 따른다는 것이다. 이것은 기하학적으로는 $n$차원 분포의 임의의 단면이 정규분포가 된다는 것으로 이해할 수 있다.

이것과 동치인 다른 정의는 multivariate normal distribution을 서로 독립인 $n$개의 1차원 standard normal distribution의 선형 결합으로 간주하는 것이다. 즉, $x \in \mathbb{R}^n$이 multivariate normal distribution을 따른다는 것은 $k$개의 독립인 1차원 standard normal distribution $x_1, x_2, \ldots, x_k$로 이루어진 벡터 $z \in \mathbb{R}^k$에 대하여 $x = A z + \mu$로 표현할 수 있다는 것이다. 이때 $A$는 $n \times k$ 행렬이며, $\mu$는 $n$차원 벡터이다.

이것을 수식으로 표현하면 다음과 같다.

$$
\begin{align*}
x &\sim N(\mu, \Sigma) \Longleftrightarrow
\exists A \in \mathbb{R}^{n \times k}, \mu \in \mathbb{R}^n \text{ s.t. } x = A z + \mu, z \sim N(0, I) \\
\end{align*}
$$

### Properties of Multivariate Normal Distribution

두 번째 정의를 사용하면 여러 증명을 좀 더 편하게 할 수 있으므로 이를 사용할 것이다. 두 번째 정의를 사용할 때는 공분산 행렬 $\Sigma$와 $A$의 관계가 중요하다. 먼저 공분산의 정의는 다음과 같다.

$$
\Sigma = E[(x - \mu)(x - \mu)^T]
$$

이것은 공분산 행렬의 $i$행 $j$열 원소가 $i$번째 원소와 $j$번째 원소의 공분산임을 의미한다. 이제 $x = A z + \mu$를 여기에 대입하여 공분산 행렬을 계산하면 다음과 같다.

$$
\begin{align*}
\Sigma &= E[(A z + \mu - \mu)(A z + \mu - \mu)^T] \\
&= E[A z z^T A^T] \\
&= A E[z z^T] A^T \\
&= A I A^T \because z \sim N(0, I) \\
&= A A^T
\end{align*}
$$

이로부터 이 공분산 행렬은 반드시 역행렬을 가짐을 보일 수 있다.
이러한 행렬은 양의 정부호(positive definite) 행렬이 되는데, 양의 정부호란 임의의 영벡터가 아닌 벡터 $x \in \mathbb{R}^n$에 대하여 $x^T \Sigma x \gt 0$이 성립하는 것을 의미한다. 이는 다음과 같이 쉽게 보일 수 있다.

$$
x^T \Sigma x = x^T A A^T x = (A^T x)^T (A^T x) = \|A^T x\|^2 \gt 0
$$

$A^T x \neq 0$라는 것은 $A$의 열벡터가 선형독립이라는 것과 동치이다. 따라서 양의 정부호 행렬은 full rank이며 역행렬을 가진다.
따라서 임의의 multivariate normal distribution의 공분산 행렬은 반드시 양의 정부호 대칭 행렬이 되며, 따라서 반드시 역행렬을 가진다.

> 한 가지 예외 사항은 어떤 원소의 분산이 0인 경우이다. 이러한 경우를 퇴화(degenerate)라고 하며, 이 경우 공분산 행렬은 역행렬을 가지지 않는다. 그러나 이것은 특수한 경우이므로 여기서는 다루지 않는다.

다음으로 이로부터 multivariate normal distribution의 확률밀도함수를 구할 수 있다. 먼저 서로 독립이고 각각의 확률밀도함수가 표준 정규분포인 $n$차원 확률변수 $z$를 생각하자. $z$의 확률밀도함수는 단순히 각 원소의 확률밀도함수의 곱이므로 다음과 같다.

$$
\frac{1}{\sqrt{2\pi}} \exp\left(-\frac{1}{2} z_1^2\right) \frac{1}{\sqrt{2\pi}} \exp\left(-\frac{1}{2} z_2^2\right) \ldots \frac{1}{\sqrt{2\pi}} \exp\left(-\frac{1}{2} z_n^2\right)
$$

이것을 잘 정리하고 벡터 형식으로 표기하면 다음과 같다.

$$
\begin{align*}
&= \frac{1}{(2\pi)^{n/2}} \exp\left(-\frac{1}{2} (z_1^2 + z_2^2 + \ldots + z_n^2)\right)\\
p(z) &= \frac{1}{(2\pi)^{n/2}} \exp\left(-\frac{1}{2} z^T z\right) \\
\end{align*}
$$

다음으로 어떤 다변수 확률분포 $x$와 임의의 역변환이 존재하는 변환 $f$에 대하여 다음이 성립한다.

$$
\begin{align*}
y = f(x) \Rightarrow p(y) &= p(x) \left|\frac{\partial x}{\partial y}\right|\\
&= p(f^{-1}(y)) \frac{1}{|\det(J)|}
\end{align*}
$$

이때 $J$는 $f$의 Jacobian이다. 만약 $f$가 선형 변환이라면 Jacobian은 변환 행렬 $A$가 되며, 이때는 다음과 같이 주어진다.

$$
\begin{align*}
x\sim p(x) &\Rightarrow A x \sim \frac{1}{|\det(A)|} p(x)\\
\therefore y = A x &\Rightarrow p(y) = \frac{1}{|\det(A)|} p(A^{-1} y)
\end{align*}
$$

이제 이것을 앞서 구한 multivariate normal distribution에 적용해보자.

$$
\begin{align*}
z = A x + \mu \Rightarrow p(z) &= \frac{1}{|\det(A)|} p(A^{-1} (z - \mu))\\
&= \frac{1}{|\det(A)|} \frac{1}{(2\pi)^{n/2}} \exp\left(-\frac{1}{2} (A^{-1} (z - \mu))^T A^{-1} (z - \mu)\right)\\
&= \frac{1}{|\det(A)|} \frac{1}{(2\pi)^{n/2}} \exp\left(-\frac{1}{2} (z - \mu)^T (A A^T)^{-1} (z - \mu)\right)\\
\end{align*}
$$

앞서 보았듯 $A A^T = \Sigma$이므로 이를 대입하면 다음과 같은 multivariate normal distribution의 확률밀도함수를 얻는다.

$$
p(z) = \frac{1}{(2\pi)^{n/2}|\Sigma|^{1/2}} \exp\left(-\frac{1}{2} (z - \mu)^T \Sigma^{-1} (z - \mu)\right)
$$

여기서 $\det(A)=\det(\Sigma^{1/2})$임은 다음과 같이 보일 수 있다.

$$
\begin{align*}
\det(A)&=\det(A^T)\\
\det(AB) &= \det(A)\det(B)\\
\therefore |\det(\Sigma)| &= |\det(A A^T)| = |\det(A)|^2\\
\therefore |\det(A)| &= |\det(\Sigma)|^{1/2}
\end{align*}
$$

## Kalman Filter

먼저 베이즈 필터의 식은 다음과 같이 주어진다.

$$
\begin{align*}
p(x_t | z_{1:t})&= \frac{p(z_t | x_t) p(x_t | z_{1:t-1})}{\int p(z_t | x_t) p(x_t | z_{1:t-1}) dx_t}
\\
p(x_t | z_{1:t-1}) &= \int p(x_t | x_{t-1}) p(x_{t-1} | z_{1:t-1}) dx_{t-1}
\end{align*}
$$

베이즈 필터는 시스템 모델과 관측 모델이 주어질 때 이로부터 상태를 추론하는 방법으로 이것은 수학적으로 최적의 추론을 제공한다. 그러나 베이즈 필터는 두 개의 적분으로 이루어져 있는데 임의의 확률분포에 대해 이 적분을 쉽게 계산할 수 있는 방법은 없다. 따라서 이 수식을 수학적으로 그대로 풀어서 사용하는 것은 불가능하고, 이를 풀 수 있는 형태로 근사하여야 한다. 파티클 필터는 저번 포스트에서 다뤘듯 베이즈 필터의 비모수적인 근사이며 따라서 확률분포와 모델에 대한 가정을 하지 않는다. 칼만 필터는 베이즈 필터의 모수적 근사로 시스템 모델과 측정 모델을 다음과 같이 선형 가우시안으로 가정한다.

$$
\begin{align*}
x_t &= F_t x_{t-1} + B_t u_t + \epsilon_t \\
z_t &= H_t x_t + \delta_t
\end{align*}
$$

여기서 각 변수의 의미는 다음과 같다.

- $x_t$: 상태 벡터
- $z_t$: 측정 벡터
- $u_t$: 제어 입력 벡터
- $\epsilon_t$: 상태 노이즈
- $\delta_t$: 측정 노이즈
- $F_t$: 상태 전이 행렬
- $B_t$: 제어 입력 행렬
- $H_t$: 측정 행렬

또한 상태 노이즈와 측정 노이즈는 다음과 같이 가우시안 분포를 따른다.

$$
\begin{align*}
\epsilon_t &\sim N(0, Q_t) \\
\delta_t &\sim N(0, R_t)
\end{align*}
$$

이제 이것을 이용하여 베이즈 필터에서 칼만 필터를 유도한다. 칼만 필터에서는 확률분포가 multivariate normal distribution을 따른다고 가정하므로 평균과 공분산 행렬만으로 확률분포를 결정할 수 있다. 따라서 칼만 필터는 상태의 평균 $\mu$와 공분산 $\Sigma$를 추정한다.

- 예측 단계에서는 현재 상태의 추정치 $\mu_{t-1|t-1}$와 $\Sigma_{t-1|t-1}$을 이용하여 다음 상태의 추정치 $\mu_{t|t-1}$와 $\Sigma_{t|t-1}$를 계산한다.
- 업데이트 단계에서는 측정값 $z_t$를 이용하여 현재 상태의 추정치 $\mu_{t|t}$와 $\Sigma_{t|t}$를 계산한다.

### Prediction Step

먼저 베이즈 필터의 상태 예측 단계는 다음과 같이 주어진다.

$$
p(x_t | z_{1:t-1}) = \int p(x_t | x_{t-1}) p(x_{t-1} | z_{1:t-1}) dx_{t-1}
$$

그러나 이때 $p(x_t | x_{t-1})$와 $p(x_{t-1} | z_{1:t-1})$가 가우시안 분포를 따르므로 이 적분은 다음과 같이 간단하게 계산된다.

$$
\begin{align*}
x_{t|t-1} &\sim N(\mu_{t|t-1}, \Sigma_{t|t-1}) \\
\mu_{t|t-1} &= F \mu_{t-1|t-1} + B u_{t} \\
\Sigma_{t|t-1} &= F \Sigma_{t-1|t-1} F^T + Q
\end{align*}
$$

증명은 다음과 같다. 먼저 평균은 같이 기댓값 연산 $E[x]$가 선형성을 가지는 것으로부터 간단히 구할 수 있다.

$$
\begin{align*}
\mu_{t|t-1} = E[x_{t|t-1}] &= E[F_t x_{t-1|t-1} + B_t u_t + \epsilon_t] \\
&= F_t E[x_{t-1|t-1}] + B_t u_t + E[\epsilon_t] \\
&= F_t \mu_{t-1|t-1} + B_t u_t
\end{align*}
$$

공분산 역시 정의에 따라 어렵지 않게 유도된다. 계산이 복잡하므로 증명에서 시간을 나타내는 아래첨자는 생략하고 다음과 같이 표기한다.

$$
\begin{align*}
\Sigma_{t|t-1} &= \hat\Sigma &
\Sigma_{t-1|t-1} &= \Sigma\\
\mu_{t|t-1} &= \hat\mu &
\mu_{t-1|t-1} &= \mu\\
x_{t|t-1} &= \hat x &
x_{t-1|t-1} &= x\\
\epsilon_t &= \epsilon
\end{align*}
$$

그러면 다음과 같이 주어진다.

$$
\begin{align*}
\hat\Sigma &= E[(\hat x - \hat\mu)(\hat x - \hat\mu)^T] \\
&= E[(F x + B u + \epsilon - F \mu - B u)^T (F x + B u + \epsilon - F \mu - B u)] \\
&= E[(F (x - \mu) + \epsilon)(F (x - \mu) + \epsilon)^T] \\
&= E[F (x - \mu)(x - \mu)^T F^T + F (x - \mu) \epsilon^T + \epsilon (x - \mu)^T F^T + \epsilon \epsilon^T] \\
&= F E[(x - \mu)(x - \mu)^T] F^T + E[\epsilon \epsilon^T] \\
&= F \Sigma F^T + Q
\end{align*}
$$

### Update Step

이제 측정 업데이트 단계를 살펴보자. 측정 업데이트 단계는 다음과 같이 주어진다.

$$
p(x_t | z_{1:t}) = \frac{p(z_t | x_t) p(x_t | z_{1:t-1})}{\int p(z_t | x_t) p(x_t | z_{1:t-1}) dx_t}
$$

이 식은 계산하기 대단히 어렵다. 그러나 실제로는 아래와 같이 위 식이 가우시안 분포임을 보일 수 있다. 이에 따라 이 식은 전부 계산할 필요가 없고 오직 평균과 분산만을 조사하면 된다.

1. 이 식의 분모는 $x_t$에 대하여 상수다.
2. 이 식의 분자는 $x_t$에 대하여 $\exp(-x_tTAx_t)$꼴이 된다. 그러므로 그 적분이 1이기만 하면 이 분포는 가우시안 분포가 된다.
3. 이 식은 분모가 $x_t$에 대하여 분자를 적분한 형태다. 그러므로 이 식을 $x_t$에 대해 적분하면 분명히 1이 된다.
4. 가우시안 분포는 평균과 분산만으로 결정되므로, 이 식을 전부 계산할 필요 없이 오직 평균과 분산만 계산하면 된다.

먼저 사전확률분포와 측정 모델의 확률밀도함수는 다음과 같다.

$$
\begin{align*}
p(x_t | z_{1:t-1}) &= \frac{1}{(2\pi)^{n/2}|\Sigma_{t|t-1}|^{1/2}} \exp\left(-\frac{1}{2} (x_t - \mu_{t|t-1})^T \Sigma_{t|t-1}^{-1} (x_t - \mu_{t|t-1})\right) \\
p(z_t | x_t) &= \frac{1}{(2\pi)^{m/2}|R_t|^{1/2}} \exp\left(-\frac{1}{2} (z_t - H_t x_t)^T R_t^{-1} (z_t - H_t x_t)\right)
\end{align*}
$$

그러므로 이들의 곱은 다음과 같다.

$$
\begin{align*}
p(z_t | x_t) p(x_t | z_{1:t-1})
&= \frac{1}{(2\pi)^{n/2}|\Sigma_{t|t-1}|^{1/2} (2\pi)^{m/2}|R_t|^{1/2}} \exp\left(-\frac{1}{2} \left((x_t - \mu_{t|t-1})^T \Sigma_{t|t-1}^{-1} (x_t - \mu_{t|t-1}) + (z_t - H_t x_t)^T R_t^{-1} (z_t - H_t x_t)\right)\right) \\
% 전개
&= \frac{1}{(2\pi)^{n/2}|\Sigma_{t|t-1}|^{1/2} (2\pi)^{m/2}|R_t|^{1/2}} \exp\left(-\frac{1}{2} \left(x_t^T \Sigma_{t|t-1}^{-1} x_t - 2 x_t^T \Sigma_{t|t-1}^{-1} \mu_{t|t-1} + \mu_{t|t-1}^T \Sigma_{t|t-1}^{-1} \mu_{t|t-1} + z_t^T R_t^{-1} z_t - 2 z_t^T R_t^{-1} H_t x_t + x_t^T H_t^T R_t^{-1} H_t x_t\right)\right)\\
% x에 대한 항들을 모아서 정리
&= \frac{1}{(2\pi)^{n/2}|\Sigma_{t|t-1}|^{1/2} (2\pi)^{m/2}|R_t|^{1/2}} \exp\left(-\frac{1}{2} \left(x_t^T (\Sigma_{t|t-1}^{-1} + H_t^T R_t^{-1} H_t) x_t - 2 x_t^T (\Sigma_{t|t-1}^{-1} \mu_{t|t-1} + H_t^T R_t^{-1} z_t) + z_t^T R_t^{-1} z_t + \mu_{t|t-1}^T \Sigma_{t|t-1}^{-1} \mu_{t|t-1}\right)\right)\\
\end{align*}
$$

> 이때 일부 $x_t$에 대한 항들이 $x_t^T$에 대한 항으로 바뀌었는데, 이는 그 항들이 스칼라이므로 전치해도 변하지 않기 때문이다.

이제 이것을 전개된 가우시안 분포의 확률밀도함수와 비교함으로써 위 확률밀도로부터 평균과 표준편차를 구할 수 있다. 평균이 $m$이고 공분산행렬이 $P$인 가우시안 분포의 확률밀도함수는 다음과 같다.

$$
\begin{align*}
p(x) &= \frac{1}{(2\pi)^{n/2}|P|^{1/2}} \exp\left(-\frac{1}{2} (x - m)^T P^{-1} (x - m)\right) \\
&= \frac{1}{(2\pi)^{n/2}|P|^{1/2}} \exp\left(-\frac{1}{2} \left(x^T P^{-1} x - 2 x^T P^{-1} m + m^T P^{-1} m\right)\right)
\end{align*}
$$

이로부터 $x^T(\bullet)x$의 계수의 역행렬이 공분산이 되고, $-2x^T(\bullet)$의 계수의 왼쪽에 공분산을 곱하면 평균이 된다는 것을 알 수 있다. 이로부터 처음 식의 공분산은 다음과 같다.

$$
\Sigma_{t|t} = (\Sigma_{t|t-1}^{-1} + H_t^T R_t^{-1} H_t)^{-1}
$$

또한 평균은 다음과 같다.

$$
\mu_{t|t} = \Sigma_{t|t} (\Sigma_{t|t-1}^{-1} \mu_{t|t-1} + H_t^T R_t^{-1} z_t)
$$

즉, 사후확률분포는 다음과 같이 주어진다.

$$
\begin{align*}
x_{t|t} &\sim N(\mu_{t|t}, \Sigma_{t|t}) \\
\mu_{t|t} &= \Sigma_{t|t} (\Sigma_{t|t-1}^{-1} \mu_{t|t-1} + H_t^T R_t^{-1} z_t) \\
\Sigma_{t|t} &= (\Sigma_{t|t-1}^{-1} + H_t^T R_t^{-1} H_t)^{-1}\\
\end{align*}
$$

### Summary

이제 update step과 prediction step을 종합하여 칼만 필터를 정리하면 다음과 같다.

$$
\begin{align*}
\text{Prediction Step} \\
\mu_{t|t-1} &= F \mu_{t-1|t-1} + B u_t \\
\Sigma_{t|t-1} &= F \Sigma_{t-1|t-1} F^T + Q \\
\text{Update Step} \\
\mu_{t|t} &= \Sigma_{t|t} (\Sigma_{t|t-1}^{-1} \mu_{t|t-1} + H_t^T R_t^{-1} z_t) \\
\Sigma_{t|t} &= (\Sigma_{t|t-1}^{-1} + H_t^T R_t^{-1} H_t)^{-1}\\
\end{align*}
$$

### Comparison with General Form

그런데 이 글에서 구한 식은 일반적으로 설명한 칼만 필터의 식과 다르다. 심지어 이 식에서는 Kalman Gain조차 찾을 수 없다. 실제로 위키피디아의 칼만 필터 항목을 보면 prediction step과 update step은 다음과 같아서, (기호 표기법이 약간 다르기는 하지만) prediction step은 이 글에서 유도한 것과 똑같은 반면 update step은 단계도 더 많을 뿐더러 식 형태 자체가 완전히 다르다.

$$
\begin{align*}
\text{Prediction Step} \\
\hat{\mathbf{X}}_{k|k-1} &= \mathbf{F}_k \hat{\mathbf{X}}_{k-1|k-1} + \mathbf{B}_k \mathbf{u}_{k-1}\\
\mathbf{P}_{k|k-1} &= \mathbf{F}_k \mathbf{P}_{k-1|k-1} \mathbf{F}_k^\top + \mathbf{Q}_{k-1}\\
\text{Update Step} \\
\tilde{\mathbf{y}}_k &= \mathbf{z}_k - \mathbf{H}_k\hat{\mathbf{x}}_{k|k-1} \\
\mathbf{S}_k &= \mathbf{H}_k \mathbf{P}_{k|k-1} \mathbf{H}_k^\top + \mathbf{R}_k \\
\mathbf{K}_k &= \mathbf{P}_{k|k-1} \mathbf{H}_k^\top \mathbf{S}_k^{-1} \\
\hat{\mathbf{x}}_{k|k} &= \hat{\mathbf{x}}_{k|k-1} + \mathbf{K}_k\tilde{\mathbf{y}}_k \\
\mathbf{P}_{k|k} &= (\mathbf{I} - \mathbf{K}_k \mathbf{H}_k) \mathbf{P}_{k|k-1} \\
\end{align*}
$$

그러나 다음과 같이 update step또한 동일한 식의 다른 형태임을 보일 수 있다.

먼저 공분산이 같음을 보이기 위해 일반적인 형식의 update step에서 Kalman Gain을 포함하여 공분산행렬을 전개하면 아래와 같다.

$$
\begin{align*}
\mathbf{P}_{k|k} &= \mathbf{P}_{k|k-1} - \mathbf{P}_{k|k-1} \mathbf{H}_k^\top (\mathbf{H}_k \mathbf{P}_{k|k-1} \mathbf{H}_k^\top + \mathbf{R}_k)^{-1} \mathbf{H}_k \mathbf{P}_{k|k-1} \\
\end{align*}
$$

다음으로 이 글에서 유도한 update step의 공분산행렬에 Woddbury matrix identity를 적용할 것이다. Woodbury matrix identity는 다음과 같은 항등식이다.

$$
(A + UCV)^{-1} = A^{-1} - A^{-1} U (C^{-1} + V A^{-1} U)^{-1} V A^{-1}
$$

여기서

$$
\begin{align*}
A &= \Sigma_{t|t-1}^{-1} \\
U &= H_t^T \\
C &= R_t^{-1} \\
V &= H_t
\end{align*}
$$

라고 두면

$$
(\Sigma_{t|t-1}^{-1} + H_t^T R_t^{-1} H_t)^{-1}
= \Sigma_{t|t-1} - \Sigma_{t|t-1} H_t^T (R_t + H_t \Sigma_{t|t-1} H_t^T)^{-1} H_t \Sigma_{t|t-1}
$$

가 되어서 이는 위의 update step의 공분산행렬과 같음을 알 수 있다.

같은 방법으로 평균도 다음과 같이 같음을 보일 수 있다. 위와 동일하게 일반적인 형식의 update step에서 평균을 전개하면 다음과 같다.

$$
\begin{align*}
\hat{\mathbf{x}}_{k|k} &= \hat{\mathbf{x}}_{k|k-1} + \mathbf{P}_{k|k-1} \mathbf{H}_k^\top (\mathbf{H}_k \mathbf{P}_{k|k-1} \mathbf{H}_k^\top + \mathbf{R}_k)^{-1} \tilde{\mathbf{y}}_k \\
&= \hat{\mathbf{x}}_{k|k-1} + \mathbf{P}_{k|k-1} \mathbf{H}_k^\top (\mathbf{H}_k \mathbf{P}_{k|k-1} \mathbf{H}_k^\top + \mathbf{R}_k)^{-1} (\mathbf{z}_k - \mathbf{H}_k\hat{\mathbf{x}}_{k|k-1}) \\
&= \hat{\mathbf{x}}_{k|k-1} + \mathbf{P}_{k|k-1} \mathbf{H}_k^\top (\mathbf{H}_k \mathbf{P}_{k|k-1}
\mathbf{H}_k^\top + \mathbf{R}_k)^{-1} \mathbf{z}_k - \mathbf{P}_{k|k-1} \mathbf{H}_k^\top (\mathbf{H}_k \mathbf{P}_{k|k-1} \mathbf{H}_k^\top + \mathbf{R}_k)^{-1} \mathbf{H}_k\hat{\mathbf{x}}_{k|k-1} \\
\end{align*}
$$

다음으로 이 글에서 유도한 update step의 평균에 앞서 유도한 공분산행렬의 결과를 대입하면 다음과 같다.

$$
\begin{align*}
\mu_{t|t} &= \Sigma_{t|t} (\Sigma_{t|t-1}^{-1} \mu_{t|t-1} + H_t^T R_t^{-1} z_t) \\
&= (\Sigma_{t|t-1} - \Sigma_{t|t-1} H_t^T (R_t + H_t \Sigma_{t|t-1} H_t^T)^{-1} H_t \Sigma_{t|t-1}) (\Sigma_{t|t-1}^{-1} \mu_{t|t-1} + H_t^T R_t^{-1} z_t) \\
&= \mu_{t|t-1} + \Sigma_{t|t-1} H_t^T R_t^{-1} z_t - \Sigma_{t|t-1} H_t^T (R_t + H_t \Sigma_{t|t-1} H_t^T)^{-1} H_t \mu_{t|t-1} - \Sigma_{t|t-1} H_t^T (R_t + H_t \Sigma_{t|t-1} H_t^T)^{-1} H_t \Sigma_{t|t-1}H_t^T R_t^{-1} z_t \\

&= \mu_{t|t-1}
+ \Sigma_{t|t-1} H_t^T(R_t^{-1} - (R_t + H_t \Sigma_{t|t-1} H_t^T)^{-1} H_t \Sigma_{t|t-1}H_t^T R_t^{-1}) z_t
- \Sigma_{t|t-1} H_t^T (R_t + H_t \Sigma_{t|t-1} H_t^T)^{-1} H_t \mu_{t|t-1}
\end{align*}
$$

이때 두 번째 항의 괄호 안의 부분은 다음과 같이 정리된다.

$$
\begin{align*}
& R_t^{-1} - (R_t + H_t \Sigma_{t|t-1} H_t^T)^{-1} H_t \Sigma_{t|t-1}H_t^T R_t^{-1} \\
&= (I - (R_t + H_t \Sigma_{t|t-1} H_t^T)^{-1} H_t \Sigma_{t|t-1}H_t^T) R_t^{-1} \\
&= (I - (R_t + H_t \Sigma_{t|t-1} H_t^T)^{-1} H_t \Sigma_{t|t-1}H_t^T - (R_t + H_t \Sigma_{t|t-1} H_t^T)^{-1} R_t + (R_t + H_t \Sigma_{t|t-1} H_t^T)^{-1} R_t ) R_t^{-1} \\
&= (I - (R_t + H_t \Sigma_{t|t-1} H_t^T)^{-1}(R_t + H_t \Sigma_{t|t-1} H_t^T) + (R_t + H_t \Sigma_{t|t-1} H_t^T)^{-1} R_t ) R_t^{-1} \\
&= (I - I + (R_t + H_t \Sigma_{t|t-1} H_t^T)^{-1} R_t ) R_t^{-1} \\
&= (R_t + H_t \Sigma_{t|t-1} H_t^T)^{-1} R_t R_t^{-1} \\
&= (R_t + H_t \Sigma_{t|t-1} H_t^T)^{-1}
\end{align*}
$$

이것을 다시 원래 식에 대입하면 다음과 같다.

$$
\begin{align*}
\mu_{t|t} &= \mu_{t|t-1}
+ \Sigma_{t|t-1} H_t^T(R_t + H_t \Sigma_{t|t-1} H_t^T)^{-1} z_t
- \Sigma_{t|t-1} H_t^T (R_t + H_t \Sigma_{t|t-1} H_t^T)^{-1} H_t \mu_{t|t-1} \\
\end{align*}
$$

이것은 앞서 얻은 일반적인 형식의 update step의 평균과 같다. 따라서 이 글에서 유도한 방식과 일반적인 방식, 즉 칼만 게인을 사용하는 방식은 정확히 같음을 알 수 있다.

## Conclusion

이 글에서는 베이즈 필터로부터 곧바로 칼만 필터를 유도하고 이것이 일반적으로 사용되는 칼만 필터와 동등함을 보였다. 이를 통해 칼만 필터를 베이즈 필터의 모수적 근사로 이해할 수 있었다.
