---
title: De Brujin Sequence
tags:
  - math
  - robotics
date: 2026-04-13T01:21:28.000Z
---

로봇 엔지니어링에서 측위(positioning)은 로봇의 제어에 있어 대단히 중요하다. 이에 대해 고민하다가 문득 위상적으로 1D path를 따르는 로봇에 대하여, 간단한 패턴만으로 그 절대 위치를 알 수 있는 그러한 패턴이 있는지가 궁금해졌다. 그래서 이에 대해 조사한 바를 정리한다.

# Background

많은 로봇들은 복잡한 위치 제어 없이 이미 정해진 경로를 따르기만 한다. 즉, 그 위치를 하나의 스칼라로 표현할 수 있다. 레일 위만 이동하는 열차가 대표적인 예이며, 추상적으로, 하나의 스칼라로 위치를 표현할 수 있다는 점에서는 회전하는 모터 역시 이러한 예라고 할 수 있다. 하나의 각도로 위치를 표현할 수 있기 때문이다. 이때 이러한 로봇의 측위에는 다양한 방법이 있어서 GPS와 같이 절대 위치를 즉시 알아내는 방법도 있고 모터의 경우 엔코더를 사용하기도 한다.

이때 이 엔코더는 absolute rotary encoder와 incremental rotary encoder가 있어서, incremental encoder는 간단한 패턴이 반복되어 그 tick을 누적하여 임의의 시작 위치로부터 상대 위치를 알 수 있는 것으로 주로 절대 위치가 중요하지 않거나 영점을 calibration할 수 있는 경우에 사용하며, absolute encoder는 절대 위치를 알 수 있는 binary pattern이 새겨져있어서 별도의 calibration 없이 절대 위치를 알 수 있는 장치다.

![Absolute vs Incremental Encoder Discs](./encoder_discs.jpg)

# Development

그런데 이에 대해 생각하다 1개의 symbol이 아니라 n개의 연속된 symbol을 읽는 것을 허용한다면 패턴을 잘 구성하기만 하면 단순한 binary pattern만으로 쉽게 절대 위치를 측정할 수 있음을 알게 되었다. 예컨대 다음 패턴을 살펴보자.

```
0 0 1 1 0
```

이 패턴에서 단순히 하나의 심볼을 읽어서는 그 위치를 특정할 수 없으나, 만약 연속된 두 개의 심볼을 읽게 된다면 `00`, `01`, `11`, `10` 으로 모두 다르므로 정확한 위치를 특정할 수 있다. 그래서 이러한 수열을 조사했다.

## De Brujin Sequence

조사 결과 이러한 수열은 De Brujin sequence의 특별한 경우임을 알게 되었다. 조합론에서 size $k$인 symbol $S$ 위의 order $n$인 De Brujin sequence는 모든 길이가 $n$인 연속 부분문자열이 단 한 번씩만 등장하는 순환수열로 $B(k, n)$으로 표기한다.

이때 이것을 구축하는 방법이 흥미롭다. 각 길이 $n$인 부분문자열을 node로 두고, '첫 symbol을 제거하고 symbol $x \in S$를 마지막에 더하는 연산' 을 edge로 하는 (symbol이 $k$개 있으므로 이러한 연산 역시 $k$개 존재할 것이다) graph를 De Brujin graph 라 하는데, 이 graph 위의 Hamiltonian circuit을 구하면 그것이 $B(k, n)$이 된다. 이때 이러한 그래프의 노드는 $k^n$개가 되므로 (순환하지 않도록 자른) sequence 의 최대 길이는 $k^n+n-1$개가 된다.

![De Bruijn graph for binary sequence of order 4](./de_bruijn_graph.svg)

## Proof of the existence of Hamiltonian circuits

De Brujin graph 위에 Hamiltonian circuit이 존재함은 다음과 같이 보일 수 있다.

1. $B(k, n-1)$에서의 edge는 $B(k, n)$에서의 node에 대응한다. $B(k, n-1)$위의 두 간선이 이어지면 $B(k, n)$위에서 대응하는 node역시 이어진다.
2. $B(k, n-1)$은 다음 조건을 만족한다.
   - A. 강하게 연결(strongly connected)되어있다. 임의의 node에서 다른 node로 가는 유향 경로가 항상 존재한다.
   - B. 모든 node의 in-degree와 out-degree가 $k$로 동일하다.
3. 오일러 정리에 의해 strongly connected directed graph에서 모든 node의 in-degree = out-degree이면 Eularian circuit이 존재한다. 따라서 $B(k, n-1)$에는 모든 간선을 정확히 한 번씩 지나는 경로가 존재한다.
4. 앞서 1.에 의해, $B(k,n-1)$에서의 Eularian path는 $B(k, n)$에서의 Hamiltonian path에 대응한다.
5. 이때 $B(k,n-1)$에서 Eularian circuit이 존재하였으므로 $B(k, n)$에는 Hamiltonian circuit이 존재한다.

## Application

이는 매우 유용한데, 왜냐하면 $k$와 $n$을 적절히 조절하기만 해도 수열을 매우 길게 만들 수 있기 때문이다. 예를 들어 tape에서 중간에 구멍을 뚫어 0과 1을 표현하는 방식을 생각하자. 그리고 symbol의 폭은 1cm라 하자. 이 경우 $n=25$이면 335km동안 단 한 번도 중복되지 않는 패턴을 만들 수 있으며, 이는 서울에서 부산까지의 거리보다 멀다.

물론 실제로는 이처럼 긴 거리에서 한 번도 중복되지 않는 패턴을 만드는 것은 기술적으로 어려울 뿐만 아니라 효용도 낮다. 그러나 이것을 동일한 패턴이 반복되는 수~수십 미터정도 길이로 만들어두면 그 주기를 카운트하거나 GPS를 사용하여 대강의 위치를 측정하고, 이 패턴을 이용하여 세밀한 위치를 측정하게 되면 매우 넓은 범위에서 정밀한 측위가 가능해진다.

물론 카운팅을 정밀하게 하면 incremental rotary encoder처럼 단순히 0,1이 반복되는 패턴을 사용할 수도 있겠으나 (이것은 $B(2,1)$인 특별한 경우일 것이다) 그렇게 하면 패턴을 한 번이라도 놓치게 되면 위치를 알 수 없게 되어 버린다. 그러나 충분히 긴 De Brujin sequence를 사용하면 이는 (적어도 반복 주기 안에서는) 절대 위치를 제공하므로 패턴을 몇 번 놓치거나 시스템이 재시작되어 상태를 잊어도 사용이 가능한 장점이 있다.

# Conclusion

De Brujin Sequence에 대해 조사하여 정리했다.

# References

- [De Bruijn sequence - Wikipedia](https://en.wikipedia.org/wiki/De_Bruijn_sequence)
- [De Bruijn graph - Wikipedia](https://en.wikipedia.org/wiki/De_Bruijn_graph)
- [Eulerian path - Wikipedia](https://en.wikipedia.org/wiki/Eulerian_path)
