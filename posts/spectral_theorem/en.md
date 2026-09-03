---
title: Spectral Theorem
tags:
  - math
date: 2026-08-31T20:45:09.517Z
---

> This post was translated from Korean into English by AI.

The Spectral Theorem is a very important concept in linear algebra that is used across a wide range of fields. Some time ago, I found it extremely useful while solving a problem and wanted to write up a summary, but I kept putting it off for lack of time. I am finally getting around to it now.

# Basic Concepts

Simply put, the spectral theorem states that matrices with "nice properties" can be decomposed completely into mutually orthogonal eigenvectors. In other words, a matrix $M$ with the appropriate properties admits the following decomposition.

$$
M = Q D Q^\top, \qquad Q^\top Q = Q Q^\top = I
$$

Here, $Q$ is a matrix whose columns are orthonormal eigenvectors, and $D = \operatorname{diag}(d_1, \ldots, d_m)$ is a diagonal matrix consisting of the corresponding eigenvalues. Since $Q$ is an orthogonal matrix, $Q^\top = Q^{-1}$.

For real matrices, the "nice property" required here is simply symmetry. That is, if $M^\top = M$, a decomposition of the form above is always possible.

# Why This Is Useful

Symmetric matrices arise in many linear algebra problems. For example, graph Laplacians in graph theory and covariance matrices in statistics are necessarily symmetric. A decomposition like this is therefore always possible in those cases. In particular,

$$
\begin{aligned}
M^n
&= \left(Q D Q^\top\right)^n \\
&= Q D \underbrace{\left(Q^\top Q\right)}_{I} D \cdots
   \underbrace{\left(Q^\top Q\right)}_{I} D Q^\top \\
&= Q D^n Q^\top
\end{aligned}
$$

which has the advantage of making matrix powers easy to compute. This leads to the following benefits.

#### We can determine whether a matrix power converges and, if so, what it converges to.

In particular, since $Q$ is an orthogonal matrix that defines an orthonormal basis, multiplying by it does not change the "volume" of the space. Therefore,

$$
\det(M) = \det(D) = \prod_{i=1}^{m} d_i
$$

Moreover, since $M^n = QD^nQ^\top$, we need only examine the powers of the individual eigenvalues, $d_i^n$, to determine easily whether the matrix powers converge and, if they do, what they converge to.

#### Quadratic forms become easier to work with.

Expressions of the form $x^\top Mx$ arise very frequently in optimization problems. If $M$ can be decomposed in this way, then for any column vector $x$, we can set $y = Q^\top x$, yielding

$$
\begin{aligned}
x^\top Mx
&= x^\top Q D Q^\top x \\
&= \left(Q^\top x\right)^\top D \left(Q^\top x\right) \\
&= y^\top D y \\
&= \sum_{i=1}^{m} d_i y_i^2
\end{aligned}
$$

Thus, rather than treating a quadratic form as a complicated matrix equation, we can work with it as a sum of squared coordinates. It also follows naturally that $M$ is positive definite if all its eigenvalues are positive, and positive semidefinite if all its eigenvalues are nonnegative.

An interesting consequence is that every real quadratic form can be transformed, through an appropriate rotation, into a form containing only squared terms. For example, consider the following quadratic form.

$$
w=a_1x^2+a_2y^2+a_3z^2+a_4xy+a_5yz+a_6xz+a_7x+a_8y+a_9z+a_{10}
$$
This can be written as follows for the vector $\boldsymbol{v} = [x,y,z,1]^\top$:

$$
w=\boldsymbol{v}^\top A\boldsymbol{v}
$$

If we let

$$
A=
\begin{bmatrix}
m_{00} & m_{01} & m_{02} & m_{03} \\
m_{01} & m_{11} & m_{12} & m_{13} \\
m_{02} & m_{12} & m_{22} & m_{23} \\
m_{03} & m_{13} & m_{23} & m_{33}
\end{bmatrix}
$$

then

$$
\begin{aligned}
\boldsymbol{v}^\top A\boldsymbol{v}
={}&m_{00}x^2+m_{11}y^2+m_{22}z^2 \\
&+2m_{01}xy+2m_{12}yz+2m_{02}xz \\
&+2m_{03}x+2m_{13}y+2m_{23}z+m_{33}
\end{aligned}
$$

so we can easily construct the following symmetric matrix.

$$
A=
\begin{bmatrix}
a_1 & \frac{a_4}{2} & \frac{a_6}{2} & \frac{a_7}{2} \\
\frac{a_4}{2} & a_2 & \frac{a_5}{2} & \frac{a_8}{2} \\
\frac{a_6}{2} & \frac{a_5}{2} & a_3 & \frac{a_9}{2} \\
\frac{a_7}{2} & \frac{a_8}{2} & \frac{a_9}{2} & a_{10}
\end{bmatrix}
$$

Therefore, by the spectral theorem, it can be decomposed as $A=Q^\top DQ$. If we define a new coordinate system $\boldsymbol{v}'$ by $\boldsymbol{v}'=Q\boldsymbol{v}$, then the expression above becomes a function containing only pure square terms in $\boldsymbol{v}'$.

This explains why, when we graph $a_1x^2+a_2y^2+a_3xy+a_4x+a_5y+a_6=0$ in two dimensions, we always obtain a "rotated" conic section.
