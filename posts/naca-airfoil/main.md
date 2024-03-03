---
title: NACA Airfoil에 기반한 날개 모델링
tags:
  - 3d modeling
date: 2024-03-03T13:05:39.843Z
---

![](imgs/graph-model-default.png)

추후 비행체를 한번 만들어 볼 계획입니다. 그때 제일 만들기 곤란한 부분이 날개일 듯해서 미리 날개 3D 모델을 생성하는 프로그램을 작성했습니다. 아래는 해당 레파지토리입니다.

- [https://github.com/unknownpgr/naca-airfoil-generator](https://github.com/unknownpgr/naca-airfoil-generator)

## Airfoil

날개에 있어서 가장 기본적인 사항은 그 날개 단면의 형상입니다. 날개 단면의 형상을 airfoil이라고 합니다. Airfoil은 물론 임의의 형상을 가질 수 있지만, 일반적으로는 다음과 같은 파라매터로 결정됩니다.

![Airfoil](imgs/params.png)

- **chord length**: 날개 단면의 길이
- **thickness**: 날개 단면의 두께
  - **maximum thickness**: 날개 단면의 최대 두께
  - **maximum thickness position**: 날개 단면의 최대 두께 위치
- **mean camber line**: 날개 단면 중심선
  - **maximum camber**: 날개 단면의 최대 곡률
  - **maximum camber position**: 날개 단면의 최대 곡률 위치

이 airfoil의 형상을 나타내는 방법 중 하나가 NACA airfoil입니다. NACA란 National Advisory Committee for Aeronautics의 약자로, NACA airfoil은 미국의 항공기 연구기관이었던 NACA에서 개발한 airfoil 형상을 나타내는 방법입니다.

이 방법에 따르면 먼저 thickness는 아래와 같이 주어집니다.

$$
t(x) = 5t(0.2969\sqrt{x} - 0.1260x - 0.3516x^2 + 0.2843x^3 - 0.1015x^4)
$$

- $x$는 chord에 대한 x축 거리의 비율로, 0과 1 사이의 값을 가집니다. 즉, $x=0$일 때 날개의 앞단, $x=1$일 때 날개의 뒷단을 나타냅니다.
- $t$는 chord에 대한 날개 단면의 두께의 비율입니다.

camber line은 아래와 같이 주어집니다.

$$
y_c = \begin{cases}
  \frac{m}{p^2}(2px - x^2) & \text{if } 0 \leq x \leq p \\
  \frac{m}{(1-p)^2}((1-2p) + 2px - x^2) & \text{if } p \leq x \leq 1
\end{cases}
$$

- $m$은 maximum camber를 나타냅니다.
- $p$는 maximum camber position을 나타냅니다.

그런데 이때 두께란 camber line으로부터 법선 방향으로의 두께를 말하는 것입니다. 이에 따라 upper surface와 lower surface는 아래와 같이 주어집니다.

$$
\begin{align*}
  x_u &= x - t(x)\sin(\theta) \\
  y_u &= y_c + t(x)\cos(\theta) \\
  x_l &= x + t(x)\sin(\theta) \\
  y_l &= y_c - t(x)\cos(\theta)
\end{align*}
$$

그러므로 NACA airfoil은 $m$, $p$, $t$ 세 개의 파라매터로 결정됩니다. 이 파라매터는 airfoil의 이름으로부터 알 수 있습니다. NACA airfoil은 네 개의 숫자로 이 값들을 표시하는데, 순서대로 $mptt$로 해석합니다. 예를 들어 NACA 2412는 $m=0.02$, $p=0.4$, $t=0.12$를 나타냅니다.

> 5자리 숫자인 경우도 있으며, 해석 방법이 다릅니다. 이에 대해서는 [Wikipedia](https://en.wikipedia.org/wiki/NACA_airfoil)를 참고하세요.

## Wing

날개의 단면을 결정했으면 이제 날개의 전체적인 형상을 결정해야 합니다. 날개의 형상은 다음과 같은 파라매터로 결정됩니다.

- **span(길이)**: 날개의 길이
- **aspect ratio(종횡비)**: 날개의 길이와 폭의 비율
- **taper ratio(테이퍼율)**: 날개의 앞단과 뒷단의 폭의 비율
- **angle of attack(받음각)**: chord와 수평선이 이루는 각도
- **dihedral angle(상반각)**: 항공기를 정면에서 봤을 때 날개가 위쪽(또는 아래쪽)으로 기울어진 각도
- **sweepback angle(후퇴각)**: 날개가 뒤쪽으로 젖혀진 각도

> 이 외에도 twist나 winglet 등 다양한 형상 파라매터가 있을 수 있지만 계산을 너무 복잡하게 만들기 때문에 지금은 고려하지 않기로 했습니다.

이 파라매터들을 이용하여 날개의 형상을 결정할 수 있습니다. 이것은 단순히 airfoil을 구한 것에 적절한 선형 변환을 적용해주기만 하면 쉽게 얻을 수 있습니다.

## Model Generation

이제 이로부터 날개의 3D 모델을 생성하기 위해서는 이 수식으로부터 메시(mesh)를 생성해야 합니다. 메시는 주어진 표면을 삼각형으로 분할하는 그래프로, 점(vertex)와 점 3개로 이루어진 면(face)로 구성됩니다. 이를 위해서 다음과 같은 간단한 알고리즘을 개발했습니다.

1. 위 수식을 통하면 날개의 표면을 parametric하게 표현할 수 있습니다. 이를 바탕으로 $u\in[0,1]$, $v\in[0,1]$의 범위에서 날개의 parametric surface를 생성합니다.

1. 이로부터 정의역 $[0,1]\times[0,1]$를 적당히 큰 삼각형들로 분할합니다.

1. 그 삼각형이 표현하는 surface가 충분히 평평한지 판별하는 함수를 정의하여, 만약 삼각형이 충분히 평평하지 않다면 그 삼각형을 더 작은 삼각형들로 분할합니다.

삼각형이 평평한지 판별하기 위해서는 surface가 함수 $(x,y,z)=f(u,v)$로 표현된다고 할 때, 적당한 가중치 $w_a, w_b, w_c$ (단 $w_a+w_b+w_c=1$)에 대하여 $w_a f(u_a,v_a) + w_b f(u_b,v_b) + w_c f(u_c,v_c)$와 $f(w_a u_a + w_b u_b + w_c u_c, w_a v_a + w_b v_b + w_c v_c)$가 충분히 가까운지 판별하면 됩니다. 이것은 아래와 같이 벡터 형식으로 표현할 수 있습니다.

먼저 가중치 리스트

$$
W = \begin{bmatrix}
  w_{0a} & w_{0b} & w_{0c}\\
  w_{1a} & w_{1b} & w_{1c}\\
  w_{2a} & w_{2b} & w_{2c}\\
  \text{...} & \text{...} & \text{...}\\
  w_{na} & w_{nb} & w_{nc}
\end{bmatrix}
$$

이고 삼각형 면(face)를 나타내는 정의역의 세 점이

$$
\bold{F} = \begin{bmatrix}
  u_a & v_a\\
  u_b & v_b\\
  u_c & v_c\\
\end{bmatrix}
$$

라고 할 때

$$
d = f(W\bold{F}) - Wf(\bold{F})
$$

라 할 때 $d$의 행벡터 중 그 크기가 가장 큰 것이 충분히 작다면 그 삼각형은 충분히 평평하다고 판별합니다.

## Result

아래는 이로부터 생성한 날개의 3D 모델입니다.

![](imgs/graph-model-default.png)
![](imgs/graph-model-front.png)
![](imgs/graph-model-right.png)
![](imgs/graph-model-top.png)

그리고 아래는 정의역에 vertex를 표시한 모습입니다.

![](imgs/graph-vertices.png)

- 가로축은 span 방향이고 세로축은 chord 방향입니다.
  - 정확히는 세로측은 airfoil의 전면에서 시작하여 upper surface를 따라 뒤로 이동한 후 다시 lower surface를 따라 앞으로 이동합니다.
- 그러므로 x가 0, 1 근처에 있을 때 곡률이 크므로 vertex가 많이 모여있는 것을 볼 수 있습니다.
- y의 위쪽과 아래쪽 일부를 날개 측면을 닫기 위해서 사용했기 때문에 접히는 부분에 vertex가 많이 모여있습니다.
- 접히는 부분을 지나 측면 부분은 평평하므로 vertex가 적게, 그리고 균일하게 모여있는 것을 확인할 수 있습니다.

## References

- [NACA airfoil - Wikipedia](https://en.wikipedia.org/wiki/NACA_airfoil)
- [De paula, Adson. (2016). The airfoil thickness effects on wavy leading edge phenomena at low Reynolds number regime. ](https://www.researchgate.net/figure/Main-geometric-parameters-of-an-aerodynamic-airfoil_fig22_305044784)
