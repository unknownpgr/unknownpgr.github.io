---
title: Spectral Theorem
tags:
  - math
date: 2026-08-31T20:45:09.517Z
---

Spectral Theorem은 다양한 분야에서 사용되는 아주 중요한 선형대수 개념이다. 일전에 어떤 문제를 풀면서 이것을 무척 유용하게 사용할 일이 생겨, 한번 정리해두려고 했으나 시간이 없어 미루다 정리한다.

# 기본 개념

스펙트럼 정리는 간단히 말해서 '좋은 성질' 을 가진 행렬은 서로 직교하는 고유벡터들로 완전히 분해할 수 있다는 정리다. 즉, 적절한 성질을 가진 행렬 $M$에 대하여 다음과 같은 분해가 가능하다.

$$
M = Q D Q^\top, \qquad Q^\top Q = Q Q^\top = I
$$

이때 $Q$는 정규 직교 고유벡터들을 열벡터로 갖는 행렬이고, $D = \operatorname{diag}(d_1, \ldots, d_m)$는 그에 대응하는 고윳값들로 이루어진 대각 행렬이다. $Q$는 직교 행렬이므로 $Q^\top = Q^{-1}$이 성립한다.

이때 실수 행렬에서 이것이 성립할 '좋은 성질'은 이것이 단순히 대칭 행렬일 것이다. 즉, $M^\top = M$이면 반드시 위와 같은 분해가 가능하다.

# 이것이 유용한 이유

많은 선형대수 문제에서 대칭 행렬이 등장한다. 예를 들어 그래프에서의 그래프 라플라시안이나 통계를 다룰 때 공분산 행렬은 반드시 대칭이 된다. 그러므로 그 경우 이와 같은 분해가 항상 가능하다. 특히

$$
\begin{aligned}
M^n
&= \left(Q D Q^\top\right)^n \\
&= Q D \underbrace{\left(Q^\top Q\right)}_{I} D \cdots
   \underbrace{\left(Q^\top Q\right)}_{I} D Q^\top \\
&= Q D^n Q^\top
\end{aligned}
$$

가 성립하므로, 행렬의 거듭제곱을 쉽게 계산할 수 있게 되는 장점이 있다. 이로부터 다음과 같은 장점들이 유도된다.

#### 행렬의 거듭제곱의 수렴 여부와 그 값을 알 수 있다.

특히 $Q$는 정규 직교 기저를 정의하는 직교 행렬이므로, 이를 곱해도 공간의 '부피'는 변하지 않는다. 따라서

$$
\det(M) = \det(D) = \prod_{i=1}^{m} d_i
$$

가 성립한다. 또한 $M^n = QD^nQ^\top$이므로 각 고윳값의 거듭제곱 $d_i^n$만 살펴보면 행렬의 거듭제곱이 수렴하는지, 수렴한다면 어디로 수렴하는지를 쉽게 알 수 있다.

#### Quadratic Form을 편리하게 다룰 수 있게 된다.

최적화 문제에서는 $x^\top Mx$ 형태의 식이 매우 자주 등장한다. $M$이 이와 같이 분해된다면, 임의의 열벡터 $x$에 대하여 $y = Q^\top x$로 둘 수 있고 다음이 성립한다.

$$
\begin{aligned}
x^\top Mx
&= x^\top Q D Q^\top x \\
&= \left(Q^\top x\right)^\top D \left(Q^\top x\right) \\
&= y^\top D y \\
&= \sum_{i=1}^{m} d_i y_i^2
\end{aligned}
$$

그러므로 quadratic form을 복잡한 행렬 방정식이 아니라 각 좌표의 제곱합 형태로 다룰 수 있다. 또한 모든 고윳값이 양수이면 $M$은 positive definite이고, 모든 고윳값이 음수가 아니면 positive semidefinite라는 사실도 자연스럽게 유도된다.

이로부터 알 수 있는 흥미로운 사실은 모든 실수 이차 형식은 적절한 회전을 통하여 완전제곱만 존재하는 형태로 변환가능하다는 것이다. 예컨대 다음과 같은 이차 형식을 고려하자.

$$
w=a_1x^2+a_2y^2+a_3z^2+a_4xy+a_5yz+a_6xz+a_7x+a_8y+a_9z+a_{10}
$$
그런데 이것은 벡터 $\boldsymbol{v} = [x,y,z,1]^\top$에 대하여 다음과 같이 쓸 수 있고

$$
w=\boldsymbol{v}^\top A\boldsymbol{v}
$$

여기서

$$
A=
\begin{bmatrix}
m_{00} & m_{01} & m_{02} & m_{03} \\
m_{01} & m_{11} & m_{12} & m_{13} \\
m_{02} & m_{12} & m_{22} & m_{23} \\
m_{03} & m_{13} & m_{23} & m_{33}
\end{bmatrix}
$$

라고 하면

$$
\begin{aligned}
\boldsymbol{v}^\top A\boldsymbol{v}
={}&m_{00}x^2+m_{11}y^2+m_{22}z^2 \\
&+2m_{01}xy+2m_{12}yz+2m_{02}xz \\
&+2m_{03}x+2m_{13}y+2m_{23}z+m_{33}
\end{aligned}
$$

이므로 간단히 다음과 같은 대칭행렬을 만들 수가 있다.

$$
A=
\begin{bmatrix}
a_1 & \frac{a_4}{2} & \frac{a_6}{2} & \frac{a_7}{2} \\
\frac{a_4}{2} & a_2 & \frac{a_5}{2} & \frac{a_8}{2} \\
\frac{a_6}{2} & \frac{a_5}{2} & a_3 & \frac{a_9}{2} \\
\frac{a_7}{2} & \frac{a_8}{2} & \frac{a_9}{2} & a_{10}
\end{bmatrix}
$$

그러므로 이것은 spectral theorem에 의해 $A=Q^\top DQ$로 분해 가능하며, 새로운 좌표계 $\boldsymbol{v}'$에 대하여 $\boldsymbol{v}'=Q\boldsymbol{v}$ 라고 하면 위 식은 $\boldsymbol{v}'$에 대해서는 순수 제곱꼴만 있는 함수가 된다.

이것은 우리가 2차원에서 $a_1x^2+a_2y^2+a_3xy+a_4x+a_5y+a_6=0$을 그래프로 그려보면 항상 원뿔곡선을 '회전' 한 형태를 얻게 되는 이유를 설명한다.
