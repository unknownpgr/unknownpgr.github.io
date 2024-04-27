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

### Properties

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
x_t &= A x_{t-1} + B u_t + \epsilon_t \\
z_t &= C x_t + \delta_t
\end{align*}
$$

여기서, $x_t$는 상태 벡터, $z_t$는 측정 벡터, $u_t$는 제어 입력 벡터, $\epsilon_t$는 상태 노이즈, $\delta_t$는 측정 노이즈이며, 상태 노이즈와 측정 노이즈는 각각 다음과 같은 확률분포를 따른다고 가정한다.

$$
\begin{align*}
\epsilon_t &\sim N(0, Q) \\
\delta_t &\sim N(0, R)
\end{align*}
$$

이것은 상태 노이즈와 측정 노이즈가 서로, 그리고 상태에 대해 독립이며 시간에 따라 변하지 않는다는 것을 가정한 것이다. 또한 이러한 시스템에서 $x_t$는 가우시안 분포를 따르게 되는데, 이것은 가우시안 분포의 선형 결합은 여전히 가우시안 분포가 되기 때문이다. 이때 $x_t$의 평균과 분산을 각각 $\mu_t$와 $\Sigma_t$라 하자. 그러면 $x_t$의 확률분포는 다음과 같이 주어진다.

$$
x_t \sim N(\mu_t, \Sigma_t)
$$

이제 이것을 이용하여 베이즈 필터에서 칼만 필터를 유도한다. 앞서 보았듯 베이즈 필터는 상태 예측과 측정 업데이트 두 단계로 이루어진다. 상태 예측 단계에서는 현재 상태의 추정치 $\mu_{t-1}$와 $\Sigma_{t-1}$을 이용하여 다음 상태의 추정치 $\mu_t$와 $\Sigma_t$를 계산한다. 측정 업데이트 단계에서는 측정값 $z_t$를 이용하여 상태의 추정치 $\mu_t$와 $\Sigma_t$를 업데이트한다.

먼저 상태 예측 단계는 다음과 같이 주어진다.

$$
p(x_t | z_{1:t-1}) = \int p(x_t | x_{t-1}) p(x_{t-1} | z_{1:t-1}) dx_{t-1}
$$

그러나 이때 $p(x_t | x_{t-1})$와 $p(x_{t-1} | z_{1:t-1})$가 가우시안 분포를 따르므로 이 적분은 다음과 같이 간단하게 계산할 수 있다.

$$
\begin{align*}
x_t &\sim N(\mu_t, \Sigma_t) \\
\mu_t &= A \mu_{t-1} + B u_t \\
\Sigma_t &= A \Sigma_{t-1} A^T + Q
\end{align*}
$$

먼저 평균은 다음과 같이 기댓값 연산 $E[x]$가 선형성을 가지는 것으로부터 간단히 구할 수 있다.

$$
\begin{align*}
\mu_t = E[x_t] &= E[A x_{t-1} + B u_t + \epsilon_t] \\
&= A E[x_{t-1}] + B u_t + E[\epsilon_t] \\
&= A \mu_{t-1} + B u_t
\end{align*}
$$

공분산은 약간 더 복잡하기는 하지만, 정의에 따라 어렵지 않게 유도된다.

$$
\begin{align*}
\Sigma_t = E[(x_t - \mu_t)(x_t - \mu_t)^T] &= E[(A x_{t-1} + B u_t + \epsilon_t - A \mu_{t-1} - B u_t)(A x_{t-1} + B u_t + \epsilon_t - A \mu_{t-1} - B u_t)^T] \\
&= E[(A (x_{t-1} - \mu_{t-1}) + \epsilon_t)(A (x_{t-1} - \mu_{t-1}) + \epsilon_t)^T] \\
&= E[A (x_{t-1} - \mu_{t-1})(x_{t-1} - \mu_{t-1})^T A^T + A (x_{t-1} - \mu_{t-1}) \epsilon_t^T + \epsilon_t (x_{t-1} - \mu_{t-1})^T A^T + \epsilon_t \epsilon_t^T] \\
&= A E[(x_{t-1} - \mu_{t-1})(x_{t-1} - \mu_{t-1})^T] A^T + E[\epsilon_t \epsilon_t^T] \\
&= A \Sigma_{t-1} A^T + Q
\end{align*}
$$

이제 측정 업데이트 단계를 살펴보자. 측정 업데이트 단계는 다음과 같이 주어진다.

$$
p(x_t | z_{1:t}) = \frac{p(z_t | x_t) p(x_t | z_{1:t-1})}{\int p(z_t | x_t) p(x_t | z_{1:t-1}) dx_t}
$$

이 식은 분모와 분자가 모두 지수에 행렬이 들어간 어려운 식이다. 그러나 이 식의 분모는 상수이며, 이 식의 분자는 $x_t$에 대하여 $\exp(-x_t^2)$꼴이 된다. 그러므로 이러한 확률분포는 가우시안 분포가 된다.

가우시안 분포는 평균과 분산만으로 결정되므로, 이 식을 전부 계산할 필요 없이 오직 평균과 분산만 계산하면 된다.

---

이제 측정 업데이트 단계를 살펴보자. 측정 업데이트 단계는 다음과 같이 주어진다.

$$
p(x_t | z_{1:t}) = \frac{p(z_t | x_t) p(x_t | z_{1:t-1})}{\int p(z_t | x_t) p(x_t | z_{1:t-1}) dx_t}
$$

분모의 값은 $p(z_t|z_{1:t-1})$이며 이것은 다음과 같다.

$$
\begin{align*}
p(z_t | z_{1:t-1}) &= \int p(z_t | x_t) p(x_t | z_{1:t-1}) dx_t \\
&= N(z_t|C \mu_t, C \Sigma_t C^T + R)
\end{align*}
$$

이것을 확률밀도함수 식으로 전개하면

$$
\begin{align*}
p(z_t | z_{1:t-1}) &= \frac{1}{(2\pi)^{n/2}|C \Sigma_t C^T + R|^{1/2}} \exp\left(-\frac{1}{2} (z_t - C \mu_t)^T (C \Sigma_t C^T + R)^{-1} (z_t - C \mu_t)\right)\\
% 전개
&= \frac{1}{(2\pi)^{n/2}|C \Sigma_t C^T + R|^{1/2}} \exp\left(-\frac{1}{2} \left(z_t^T (C \Sigma_t C^T + R)^{-1} z_t - 2 z_t^T (C \Sigma_t C^T + R)^{-1} C \mu_t + \mu_t^T C^T (C \Sigma_t C^T + R)^{-1} C \mu_t\right)\right)\\
 \end{align*}
$$

---

이때 $p(z_t | x_t)$와 $p(x_t | z_{1:t-1})$은 각각 다음과 같다.

$$
\begin{align*}
p(z_t | x_t) &= N(C x_t, R) = \frac{1}{(2\pi)^{n/2}|R|^{1/2}} \exp\left(-\frac{1}{2} (z_t - C x_t)^T R^{-1} (z_t - C x_t)\right) \\
p(x_t | z_{1:t-1}) &= N(\mu_t, \Sigma_t) = \frac{1}{(2\pi)^{n/2}|\Sigma_t|^{1/2}} \exp\left(-\frac{1}{2} (x_t - \mu_t)^T \Sigma_t^{-1} (x_t - \mu_t)\right)
\end{align*}
$$

그러므로 그 곱은 다음과 같이 주어진다.

$$
\begin{align*}
p(z_t | x_t) p(x_t | z_{1:t-1})
&= \frac{1}{(2\pi)^n |\Sigma_t|^{1/2} |R|^{1/2}} \exp\left(-\frac{1}{2} \left((z_t - C x_t)^T R^{-1} (z_t - C x_t) + (x_t - \mu_t)^T \Sigma_t^{-1} (x_t - \mu_t)\right)\right) \\
% 전개
&= \frac{1}{(2\pi)^n |\Sigma_t|^{1/2} |R|^{1/2}} \exp\left(-\frac{1}{2} \left(z_t^T R^{-1} z_t - 2 z_t^T R^{-1} C x_t + x_t^T C^T R^{-1} C x_t + x_t^T \Sigma_t^{-1} x_t - 2 x_t^T \Sigma_t^{-1} \mu_t + \mu_t^T \Sigma_t^{-1} \mu_t\right)\right)\\
% x에 대한 항들을 모아서 정리
&= \frac{1}{(2\pi)^n |\Sigma_t|^{1/2} |R|^{1/2}} \exp\left(-\frac{1}{2} \left(x_t^T (C^T R^{-1} C + \Sigma_t^{-1}) x_t - 2 x_t^T (\Sigma_t^{-1} \mu_t + C^T R^{-1} z_t) + z_t^T R^{-1} z_t + \mu_t^T \Sigma_t^{-1} \mu_t\right)\right)\\

\end{align*}
$$

==> 이러한 유도가 일반적인 유도와 같음은 Woodbury matrix identity를 사용하여 증명할 수 있다.
