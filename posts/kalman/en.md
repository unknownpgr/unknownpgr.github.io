---
title: Bayesian Filters and Kalman Filters
tags:
  - math
date: 2024-04-27T14:41:59.639Z
---

> This post was translated from Korean into English by AI.

A Kalman filter is a probabilistic method for estimating the state of a system from measurements. There are several ways to explain the Kalman filter. For example, it can be interpreted as a state observer or viewed as a combination of a low-pass filter and a high-pass filter. In this post, however, I will explain the Kalman filter as an approximation of the Bayesian filter, which I consider the most fundamental perspective.

## Multivariate Normal Distribution

The Kalman filter assumes that both the vector-valued state and its observations follow multivariate normal distributions. Therefore, understanding the Kalman filter first requires an understanding of these distributions.

### Normal Distribution

First, the probability density function of a one-dimensional normal distribution is defined as follows.

$$
x \sim N(\mu, \sigma^2) \Longleftrightarrow p(x) = \frac{1}{\sqrt{2\pi}\sigma} \exp\left(-\frac{1}{2}\left(\frac{x - \mu}{\sigma}\right)^2\right)
$$

Here, $\mu$ is the mean and $\sigma^2$ is the variance.

### Properties of Normal Distribution

The normal distribution has many useful properties. One of the most important is that normal distributions are closed under linear combinations. In other words, if $x_1 \sim N(\mu_1, \sigma_1^2)$ and $x_2 \sim N(\mu_2, \sigma_2^2)$, then $a x_1 + b x_2$ also follows a normal distribution for any constants $a$ and $b$.

This can be proved easily by first showing that normal distributions are closed under scalar multiplication and then showing that they are closed under addition. Closure under scalar multiplication is straightforward, so I will omit it and prove closure under addition. There are several ways to do this, but the most intuitive is to calculate it directly as follows.

First, the probability density function of the sum $x = x_1 + x_2$ of two independent random variables $x_1 \sim p_1(x)$ and $x_2 \sim p_2(x)$ is given by the convolution of their probability density functions:

$$
p(x) = \int p_1(t) p_2(x - t) dt
$$

Substituting the probability density functions of the normal distributions gives the following.

$$
p(x) = \int \frac{1}{\sqrt{2\pi}\sigma_1} \exp\left(-\frac{1}{2}\left(\frac{t - \mu_1}{\sigma_1}\right)^2\right) \frac{1}{\sqrt{2\pi}\sigma_2} \exp\left(-\frac{1}{2}\left(\frac{x - t - \mu_2}{\sigma_2}\right)^2\right) dt
$$

To evaluate this integral, first combine the $\exp$ functions, expand the exponent, complete the square in $t$, and then use the following formula.

$$
\int \exp(-ax^2) dx = \sqrt{\frac{\pi}{a}}
$$

Evaluating the integral in this way gives the following.

$$
\frac{1}{2 \sqrt{\pi} \sqrt{\sigma_1^2 + \sigma_2^2}}\sqrt{2} \exp\left(\frac{- \mu_1^2 \sigma_2^2 + \sigma_1^2 \left(- \mu_2^2 + 2 \mu_2 x - x^2\right) + \frac{\left(\mu_1 \sigma_2^2 - \mu_2 \sigma_1^2 + \sigma_1^2 x\right)^2}{\sigma_1^2 + \sigma_2^2}}{2 \sigma_1^2 \sigma_2^2}\right)
$$

Factoring the exponent carefully with respect to $x$ simplifies it as follows.

$$
\begin{align*}
& \frac{- \mu_1^2 \sigma_2^2 + \sigma_1^2 \left(- \mu_2^2 + 2 \mu_2 x - x^2\right) + \frac{\left(\mu_1 \sigma_2^2 - \mu_2 \sigma_1^2 + \sigma_1^2 x\right)^2}{\sigma_1^2 + \sigma_2^2}}{2 \sigma_1^2 \sigma_2^2}\\

&=\frac{1}{\sigma_1^2 + \sigma_2^2}\left(
  - \frac{\mu_1^2(\sigma_1^2 + \sigma_2^2)}{\sigma_1^2}
  + \frac{\left(- \mu_2^2 + 2 \mu_2 x - x^2\right)(\sigma_1^2 + \sigma_2^2)}{\sigma_2^2}
  + \frac{\left(\mu_1 \sigma_2^2 - \mu_2 \sigma_1^2 + \sigma_1^2 x\right)^2}{\sigma_1^2\sigma_2^2}
\right)\\

&=\frac{1}{\sigma_1^2 + \sigma_2^2}\left(
  - \mu_1^2
  - \frac{\mu_1^2\sigma_2^2}{\sigma_1^2}
  - \frac{\mu_2^2\sigma_1^2}{\sigma_2^2}
  - \mu_2^2
  + \frac{2 \mu_2 x \sigma_1^2}{\sigma_2^2}
  + 2 \mu_2 x
  - \frac{x^2\sigma_1^2}{\sigma_2^2}
  - x^2
  + \frac{\mu_1^2\sigma_2^2}{\sigma_1^2}
  + \frac{\mu_2^2\sigma_1^2}{\sigma_2^2}
  + \frac{x^2\sigma_1^2}{\sigma_2^2}
  - 2 \mu_1 \mu_2
  + 2 \mu_1 x
  - \frac{2 \mu_2 x \sigma_1^2}{\sigma_2^2}
\right)\\


&=\frac{1}{\sigma_1^2 + \sigma_2^2}\left(
  - \mu_1^2
  - \mu_2^2
  + 2 \mu_2 x
  - x^2
  - 2 \mu_1 \mu_2
  + 2 \mu_1 x
\right)\\

&=-\frac{1}{\sigma_1^2 + \sigma_2^2}\left(
  (\mu_1 + \mu_2)^2
  - 2 (\mu_1+\mu_2) x
  + x^2
\right)\\

&=-\frac{(x- (\mu_1 + \mu_2))^2}{\sigma_1^2 + \sigma_2^2}\\

\end{align*}
$$

Substituting this back into the original expression gives the following.

$$
\frac{1}{\sqrt{2\pi} \sqrt{\sigma_1^2 + \sigma_2^2}}
\exp\left(- \frac{\left(x-(\mu_1 + \mu_2) \right)^2}{2 (\sigma_1^2 +  \sigma_2^2)}\right)
$$

By the definition of the normal distribution, this is a normal distribution with mean $\mu_1 + \mu_2$ and variance $\sigma_1^2 + \sigma_2^2$.

### Definition of Multivariate Normal Distribution

There are several definitions of the multivariate normal distribution. The most common defines it as a probability distribution in which every linear combination of the components is normally distributed. In other words, a random variable $x \in \mathbb{R}^n$ follows a multivariate normal distribution if $a^T x$ follows a normal distribution for every vector $a \in \mathbb{R}^n$.

An equivalent definition regards a multivariate normal distribution as a linear combination of $n$ mutually independent one-dimensional standard normal distributions. That is, for a vector $z \in \mathbb{R}^k$ consisting of $k$ independent one-dimensional standard normal random variables $x_1, x_2, \ldots, x_k$, there exist a matrix $A$ and a vector $\mu$ such that $x = A z + \mu$. Here, $A$ is an $n \times k$ matrix, and $\mu$ is an $n$-dimensional vector.

This can be expressed mathematically as follows.

$$
\begin{align*}
x &\sim N(\mu, \Sigma) \Longleftrightarrow
\exists A \in \mathbb{R}^{n \times k}, \mu \in \mathbb{R}^n \text{ s.t. } x = A z + \mu, z \sim N(0, I) \\
\end{align*}
$$

### Properties of Multivariate Normal Distribution

The second definition makes several proofs more convenient, so I will use it here. When using the second definition, the relationship between the covariance matrix $\Sigma$ and $A$ is important. First, if the mean of the random variable $x$ is $\mu$, the covariance is defined as follows.

$$
\Sigma = E[(x - \mu)(x - \mu)^T]
$$

This means that the entry in row $i$, column $j$ of the covariance matrix is the covariance between the $i$-th and $j$-th components.

Now, substituting $x = A z + \mu$ into this expression gives the following covariance matrix.

$$
\begin{align*}
\Sigma &= E[(A z + \mu - \mu)(A z + \mu - \mu)^T] \\
&= E[A z z^T A^T] \\
&= A E[z z^T] A^T \\
&= A I A^T \because z \sim N(0, I) \\
&= A A^T
\end{align*}
$$

This covariance matrix is positive definite. Positive definiteness means that $x^T \Sigma x \gt 0$ holds for every nonzero vector $x \in \mathbb{R}^n$. This is easy to see as follows.

$$
x^T \Sigma x = x^T A A^T x = (A^T x)^T (A^T x) = \|A^T x\|^2 \gt 0
$$

> One exception is when the variance of some component is zero. This case is called degenerate, and the covariance matrix then has no inverse. In such cases, that component must be removed through marginalization or a similar technique before performing the calculation. This is a special case, however, and will not be covered here.

From this, we can show that the covariance matrix must be invertible.

- The statement that $A^T x \neq 0$ for every $x$ is equivalent to the column vectors of $A$ being linearly independent.
- Therefore, a positive definite matrix has full rank and is invertible.
- Therefore, the covariance matrix of any multivariate normal distribution must be invertible.

### Probability Density Function of Multivariate Normal Distribution

Next, we can derive the probability density function of the multivariate normal distribution. Consider an $n$-dimensional random variable $z$ whose components are mutually independent and each have the standard normal probability density function. Since the probability density function of $z$ is simply the product of the probability density functions of its components, it is given by the following.

$$
\frac{1}{\sqrt{2\pi}} \exp\left(-\frac{1}{2} z_1^2\right) \frac{1}{\sqrt{2\pi}} \exp\left(-\frac{1}{2} z_2^2\right) \ldots \frac{1}{\sqrt{2\pi}} \exp\left(-\frac{1}{2} z_n^2\right)
$$

Simplifying this and writing it in vector form gives the following.

$$
\begin{align*}
&= \frac{1}{(2\pi)^{n/2}} \exp\left(-\frac{1}{2} (z_1^2 + z_2^2 + \ldots + z_n^2)\right)\\
p(z) &= \frac{1}{(2\pi)^{n/2}} \exp\left(-\frac{1}{2} z^T z\right) \\
\end{align*}
$$

Next, for any multivariate probability distribution $x$ and any invertible transformation $f$, the following holds.

$$
\begin{align*}
y = f(x) \Rightarrow p(y) &= p(x) \left|\frac{\partial x}{\partial y}\right|\\
&= p(f^{-1}(y)) \frac{1}{|\det(J)|}
\end{align*}
$$

Here, $J$ is the Jacobian of $f$. If $f$ is a linear transformation, the Jacobian is the transformation matrix $A$, in which case the expression is given as follows.

$$
\begin{align*}
x\sim p(x) &\Rightarrow A x \sim \frac{1}{|\det(A)|} p(x)\\
\therefore y = A x &\Rightarrow p(y) = \frac{1}{|\det(A)|} p(A^{-1} y)
\end{align*}
$$

Now let us apply this to the multivariate normal distribution derived above.

$$
\begin{align*}
z = A x + \mu \Rightarrow p(z) &= \frac{1}{|\det(A)|} p(A^{-1} (z - \mu))\\
&= \frac{1}{|\det(A)|} \frac{1}{(2\pi)^{n/2}} \exp\left(-\frac{1}{2} (A^{-1} (z - \mu))^T A^{-1} (z - \mu)\right)\\
&= \frac{1}{|\det(A)|} \frac{1}{(2\pi)^{n/2}} \exp\left(-\frac{1}{2} (z - \mu)^T (A A^T)^{-1} (z - \mu)\right)\\
\end{align*}
$$

As shown above, $A A^T = \Sigma$. Substituting this gives the following probability density function of the multivariate normal distribution.

$$
p(z) = \frac{1}{(2\pi)^{n/2}|\Sigma|^{1/2}} \exp\left(-\frac{1}{2} (z - \mu)^T \Sigma^{-1} (z - \mu)\right)
$$

The identity $|\det(A)|=|\det(\Sigma)|^{1/2}$ can be shown as follows.

$$
\begin{align*}
|\det(\Sigma)| &= |\det(A A^T)| = |\det(A)\det(A^T)| \\
&\because \det(AB) = \det(A)\det(B)\\
&=|\det(A)\det(A)| = |\det(A)|^2\\
&\because \det(A)=\det(A^T)\\
\therefore |\det(A)|^2&=|\det(\Sigma)| \\
\therefore |\det(A)| &= |\det(\Sigma)|^{1/2}
\end{align*}
$$

## Kalman Filter

First, the Bayesian filter equations are given as follows.

$$
\begin{align*}
p(x_t | z_{1:t})&= \frac{p(z_t | x_t) p(x_t | z_{1:t-1})}{\int p(z_t | x_t) p(x_t | z_{1:t-1}) dx_t}
\\
p(x_t | z_{1:t-1}) &= \int p(x_t | x_{t-1}) p(x_{t-1} | z_{1:t-1}) dx_{t-1}
\end{align*}
$$

Given a system model and an observation model, a Bayesian filter infers the state from observations and provides mathematically optimal inference for a system represented as a hidden Markov chain. However, a Bayesian filter contains two integrals, and there is no easy way to evaluate them for arbitrary probability distributions. Consequently, these equations cannot be solved and used directly; they must be approximated in another form. As discussed in the previous post, the particle filter is a nonparametric approximation of the Bayesian filter and therefore makes no assumptions about the probability distributions or models. The Kalman filter discussed in this post is a parametric approximation of the Bayesian filter that assumes the system model and measurement model are linear Gaussian models of the following form.

$$
\begin{align*}
x_t &= F_t x_{t-1} + B_t u_t + \epsilon_t \\
z_t &= H_t x_t + \delta_t
\end{align*}
$$

The variables have the following meanings.

- $x_t$: state vector
- $z_t$: measurement vector
- $u_t$: control input vector
- $\epsilon_t$: state noise
- $\delta_t$: measurement noise
- $F_t$: state transition matrix
- $B_t$: control input matrix
- $H_t$: measurement matrix

The state noise and measurement noise also follow Gaussian distributions as follows.

$$
\begin{align*}
\epsilon_t &\sim N(0, Q_t) \\
\delta_t &\sim N(0, R_t)
\end{align*}
$$

We can now use these assumptions to derive the Kalman filter from the Bayesian filter. Because the Kalman filter assumes that the probability distributions are multivariate normal, each distribution is completely determined by its mean and covariance matrix. The Kalman filter therefore estimates the state mean $\mu$ and covariance $\Sigma$ as follows.

- In the prediction step, the current state estimates $\mu_{t-1|t-1}$ and $\Sigma_{t-1|t-1}$ are used to calculate the next state estimates $\mu_{t|t-1}$ and $\Sigma_{t|t-1}$.
- In the update step, the measurement $z_t$ is used to calculate the current state estimates $\mu_{t|t}$ and $\Sigma_{t|t}$.

### Prediction Step

First, the state prediction step of the Bayesian filter is given as follows.

$$
p(x_t | z_{1:t-1}) = \int p(x_t | x_{t-1}) p(x_{t-1} | z_{1:t-1}) dx_{t-1}
$$

Because $p(x_t | x_{t-1})$ and $p(x_{t-1} | z_{1:t-1})$ follow Gaussian distributions, however, this integral can be calculated simply as follows.

$$
\begin{align*}
x_{t|t-1} &\sim N(\mu_{t|t-1}, \Sigma_{t|t-1}) \\
\mu_{t|t-1} &= F \mu_{t-1|t-1} + B u_{t} \\
\Sigma_{t|t-1} &= F \Sigma_{t-1|t-1} F^T + Q
\end{align*}
$$

The proof is as follows. The mean can be obtained directly from the linearity of the expectation operator $E[x]$.

$$
\begin{align*}
\mu_{t|t-1} = E[x_{t|t-1}] &= E[F_t x_{t-1|t-1} + B_t u_t + \epsilon_t] \\
&= F_t E[x_{t-1|t-1}] + B_t u_t + E[\epsilon_t] \\
&= F_t \mu_{t-1|t-1} + B_t u_t
\end{align*}
$$

The covariance is also readily derived from its definition. Because the calculation is complicated, I will temporarily omit the time subscripts in the proof and use the following notation.

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

The covariance can then be calculated as follows.

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

Now let us examine the measurement update step. The measurement update step is given as follows.

$$
p(x_t | z_{1:t}) = \frac{p(z_t | x_t) p(x_t | z_{1:t-1})}{\int p(z_t | x_t) p(x_t | z_{1:t-1}) dx_t}
$$

This expression is very difficult to evaluate. In fact, however, we can show that it is a Gaussian distribution as follows.

1. The denominator of this expression is constant with respect to $x_t$.
2. When expanded, the numerator takes the form $\exp(-x_tTAx_t)$ with respect to $x_t$. Therefore, as long as its integral is 1, this distribution is Gaussian.
3. The denominator of this expression is the numerator integrated with respect to $x_t$. Therefore, integrating the entire expression with respect to $x_t$ must give 1.

Accordingly, there is no need to calculate the entire expression; we only need to examine its mean and variance.

First, the probability density functions of the prior distribution and the measurement model are as follows.

$$
\begin{align*}
p(x_t | z_{1:t-1}) &= \frac{1}{(2\pi)^{n/2}|\Sigma_{t|t-1}|^{1/2}} \exp\left(-\frac{1}{2} (x_t - \mu_{t|t-1})^T \Sigma_{t|t-1}^{-1} (x_t - \mu_{t|t-1})\right) \\
p(z_t | x_t) &= \frac{1}{(2\pi)^{m/2}|R_t|^{1/2}} \exp\left(-\frac{1}{2} (z_t - H_t x_t)^T R_t^{-1} (z_t - H_t x_t)\right)
\end{align*}
$$

Their product is therefore as follows.

$$
\begin{align*}
p(z_t | x_t) p(x_t | z_{1:t-1})
&= \frac{1}{(2\pi)^{n/2}|\Sigma_{t|t-1}|^{1/2} (2\pi)^{m/2}|R_t|^{1/2}} \exp\left(-\frac{1}{2} \left((x_t - \mu_{t|t-1})^T \Sigma_{t|t-1}^{-1} (x_t - \mu_{t|t-1}) + (z_t - H_t x_t)^T R_t^{-1} (z_t - H_t x_t)\right)\right) \\
% Expansion
&= \frac{1}{(2\pi)^{n/2}|\Sigma_{t|t-1}|^{1/2} (2\pi)^{m/2}|R_t|^{1/2}} \exp\left(-\frac{1}{2} \left(x_t^T \Sigma_{t|t-1}^{-1} x_t - 2 x_t^T \Sigma_{t|t-1}^{-1} \mu_{t|t-1} + \mu_{t|t-1}^T \Sigma_{t|t-1}^{-1} \mu_{t|t-1} + z_t^T R_t^{-1} z_t - 2 z_t^T R_t^{-1} H_t x_t + x_t^T H_t^T R_t^{-1} H_t x_t\right)\right)\\
% Collect and simplify the terms in x
&= \frac{1}{(2\pi)^{n/2}|\Sigma_{t|t-1}|^{1/2} (2\pi)^{m/2}|R_t|^{1/2}} \exp\left(-\frac{1}{2} \left(x_t^T (\Sigma_{t|t-1}^{-1} + H_t^T R_t^{-1} H_t) x_t - 2 x_t^T (\Sigma_{t|t-1}^{-1} \mu_{t|t-1} + H_t^T R_t^{-1} z_t) + z_t^T R_t^{-1} z_t + \mu_{t|t-1}^T \Sigma_{t|t-1}^{-1} \mu_{t|t-1}\right)\right)\\
\end{align*}
$$

> Here, some terms involving $x_t$ were rewritten as terms involving $x_t^T$. This is because those terms are scalars and therefore remain unchanged when transposed.

We can now obtain the mean and standard deviation from the probability density above by comparing it with the expanded probability density function of a Gaussian distribution. Expanding the probability density function of a Gaussian distribution with mean $m$ and covariance matrix $P$ gives the following.

$$
\begin{align*}
p(x) &= \frac{1}{(2\pi)^{n/2}|P|^{1/2}} \exp\left(-\frac{1}{2} (x - m)^T P^{-1} (x - m)\right) \\
&= \frac{1}{(2\pi)^{n/2}|P|^{1/2}} \exp\left(-\frac{1}{2} \left(x^T P^{-1} x - 2 x^T P^{-1} m + m^T P^{-1} m\right)\right)
\end{align*}
$$

From this, we can see that the inverse of the coefficient in $x^T(\bullet)x$ is the covariance, and that multiplying the coefficient in $-2x^T(\bullet)$ by the covariance from the left gives the mean. Thus, the covariance of the original expression is

$$
\Sigma_{t|t} = (\Sigma_{t|t-1}^{-1} + H_t^T R_t^{-1} H_t)^{-1}
$$

and its mean is

$$
\mu_{t|t} = \Sigma_{t|t} (\Sigma_{t|t-1}^{-1} \mu_{t|t-1} + H_t^T R_t^{-1} z_t)
$$

In other words, the posterior distribution is given as follows.

$$
\begin{align*}
x_{t|t} &\sim N(\mu_{t|t}, \Sigma_{t|t}) \\
\mu_{t|t} &= \Sigma_{t|t} (\Sigma_{t|t-1}^{-1} \mu_{t|t-1} + H_t^T R_t^{-1} z_t) \\
\Sigma_{t|t} &= (\Sigma_{t|t-1}^{-1} + H_t^T R_t^{-1} H_t)^{-1}\\
\end{align*}
$$

### Summary

Combining the update and prediction steps, the Kalman filter can now be summarized as follows.

$$
\begin{align*}
\text{Prediction Step} \\
\mu_{t|t-1} &= F_t \mu_{t-1|t-1} + B_t u_t \\
\Sigma_{t|t-1} &= F_t \Sigma_{t-1|t-1} F_t^T + Q_t \\
\text{Update Step} \\
\mu_{t|t} &= \Sigma_{t|t} (\Sigma_{t|t-1}^{-1} \mu_{t|t-1} + H_t^T R_t^{-1} z_t) \\
\Sigma_{t|t} &= (\Sigma_{t|t-1}^{-1} + H_t^T R_t^{-1} H_t)^{-1}\\
\end{align*}
$$

### Comparison with General Form

However, the equations derived in this post differ from the form in which the Kalman filter is commonly presented. The Kalman Gain does not even appear in these equations. In fact, the Wikipedia article on the Kalman filter presents the prediction and update steps as follows. Although the notation differs slightly, the prediction step is identical to the one derived in this post, while the update step not only contains more stages but also has a completely different form.

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

However, we can show that the update step is also simply another form of the same equations.

First, to show that the covariances are equal, expand the covariance matrix in the update step of the general form, including the Kalman Gain, as follows.

$$
\begin{align*}
\mathbf{P}_{k|k} &= \mathbf{P}_{k|k-1} - \mathbf{P}_{k|k-1} \mathbf{H}_k^\top (\mathbf{H}_k \mathbf{P}_{k|k-1} \mathbf{H}_k^\top + \mathbf{R}_k)^{-1} \mathbf{H}_k \mathbf{P}_{k|k-1} \\
\end{align*}
$$

Next, we apply the Woodbury matrix identity to the covariance matrix in the update step derived in this post. The Woodbury matrix identity is the following identity.

$$
(A + UCV)^{-1} = A^{-1} - A^{-1} U (C^{-1} + V A^{-1} U)^{-1} V A^{-1}
$$

Letting

$$
\begin{align*}
A &= \Sigma_{t|t-1}^{-1} \\
U &= H_t^T \\
C &= R_t^{-1} \\
V &= H_t
\end{align*}
$$

gives

$$
(\Sigma_{t|t-1}^{-1} + H_t^T R_t^{-1} H_t)^{-1}
= \Sigma_{t|t-1} - \Sigma_{t|t-1} H_t^T (R_t + H_t \Sigma_{t|t-1} H_t^T)^{-1} H_t \Sigma_{t|t-1}
$$

which is equal to the covariance matrix in the update step above.

The same method can be used to show that the means are also equal. As above, expanding the mean in the update step of the general form gives the following.

$$
\begin{align*}
\hat{\mathbf{x}}_{k|k} &= \hat{\mathbf{x}}_{k|k-1} + \mathbf{P}_{k|k-1} \mathbf{H}_k^\top (\mathbf{H}_k \mathbf{P}_{k|k-1} \mathbf{H}_k^\top + \mathbf{R}_k)^{-1} \tilde{\mathbf{y}}_k \\
&= \hat{\mathbf{x}}_{k|k-1} + \mathbf{P}_{k|k-1} \mathbf{H}_k^\top (\mathbf{H}_k \mathbf{P}_{k|k-1} \mathbf{H}_k^\top + \mathbf{R}_k)^{-1} (\mathbf{z}_k - \mathbf{H}_k\hat{\mathbf{x}}_{k|k-1}) \\
&= \hat{\mathbf{x}}_{k|k-1} + \mathbf{P}_{k|k-1} \mathbf{H}_k^\top (\mathbf{H}_k \mathbf{P}_{k|k-1}
\mathbf{H}_k^\top + \mathbf{R}_k)^{-1} \mathbf{z}_k - \mathbf{P}_{k|k-1} \mathbf{H}_k^\top (\mathbf{H}_k \mathbf{P}_{k|k-1} \mathbf{H}_k^\top + \mathbf{R}_k)^{-1} \mathbf{H}_k\hat{\mathbf{x}}_{k|k-1} \\
\end{align*}
$$

Next, substituting the covariance matrix result derived above into the mean from the update step derived in this post gives the following.

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

The expression in parentheses in the second term simplifies as follows.

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

Substituting this back into the original expression gives the following.

$$
\begin{align*}
\mu_{t|t} &= \mu_{t|t-1}
+ \Sigma_{t|t-1} H_t^T(R_t + H_t \Sigma_{t|t-1} H_t^T)^{-1} z_t
- \Sigma_{t|t-1} H_t^T (R_t + H_t \Sigma_{t|t-1} H_t^T)^{-1} H_t \mu_{t|t-1} \\
\end{align*}
$$

This is equal to the mean in the update step of the general form obtained earlier. Therefore, the method derived in this post and the general method—that is, the method using the Kalman Gain—are exactly equivalent.

## Conclusion

In this post, we derived the Kalman filter directly from the Bayesian filter and showed that it is equivalent to the commonly used form of the Kalman filter. This allowed us to understand the Kalman filter as a parametric approximation of the Bayesian filter.

## References

- [Wikipedia: Kalman Filter](https://en.wikipedia.org/wiki/Kalman_filter)
- [Wikipedia: Woodbury matrix identity](https://en.wikipedia.org/wiki/Woodbury_matrix_identity)
- [Wikipedia: Multivariate normal distribution](https://en.wikipedia.org/wiki/Multivariate_normal_distribution)
- [R. Gurajala, P. B. Choppala, J. S. Meka and P. D. Teal, "Derivation of the Kalman filter in a Bayesian filtering perspective," 2021 2nd International Conference on Range Technology (ICORT), Chandipur, Balasore, India, 2021, pp. 1-5, doi: 10.1109/ICORT52730.2021.9581918.](https://ieeexplore.ieee.org/document/9581918)
