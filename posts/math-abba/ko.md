---
title: a^b가 클까 b^a가 클까?
tags:
  - math
date: 2021-01-01T03:27:09.638Z
---

어느날 뜬금없이 $e^\pi$가 클지 $\pi^e$가 클지 궁금해졌습니다. 물론 계산기로 계산해보면 쉽게 알 수 있지만, 계산기를 사용하지 않고 어느것이 더 큰지 증명해보고 싶었습니다.

그래서 뜬금없이 증명해봤습니다.

증명은 아래와 같습니다.

---

일반화하여 양수 $a$와 $b$에 대해 $a^b$와 $b^a$의 대소를 비교해보겠습니다.

$$
a^b>b^a\\
\leftrightarrow b\log a > a \log b
(\because x>y\leftrightarrow\log x> \log y)\\
\leftrightarrow \frac{b\log a}{ab}>\frac{a \log b}{ab}
(\because ab>0)\\
\leftrightarrow \frac{\log a}{a}>\frac{\log b}{b}
$$

이때

$$
f(x) = \frac{\log x}{x}
$$

라 두면

$$
f'(x)=\frac{1-\log x}{x^2}
$$

가 됩니다.

- 그러므로 $x\geq e$이면 $f(x)$가 단조감소임을 알 수 있습니다.
- 그러므로 적어도 $a,b\geq e$에 대하여 $a^b,b^a$의 대소는 $a,b$의 대소를 반대로 따릅니다.
- 그러므로 $e\geq e,\pi \geq e$이고 $\pi>e$이므로 $\pi^e<e^\pi$입니다.

실제로 계산해보면 $e^\pi\sim23.14$이고 $\pi^e\sim22.45$로, $e^\pi$가 약간 더 큽니다.
