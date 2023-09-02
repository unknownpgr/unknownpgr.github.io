---
title: State-Machine AI의 불완정성 - 왜 ChatGPT는 곱셈을 못 하는가?
tags:
  - ai
date: 2023-02-18T10:53:03.216Z
---

최근 ChatGPT의 급부상과 함께 AI에 대한 기대감이 커지고 있습니다. AI는 이제 이론을 넘어 실제로 일상생활속에서 유용하게 사용되고 있습니다. 그러나 이번 글에서는 ChatGPT의 불완전성을 살펴보고, 이를 해결하기 위한 방안을 제시합니다.

# ChatGPT의 불완전성

그것이 AI이건 복잡한 알고리즘이건, 모든 기계는 구조에 따른 계산가능성의 제한을 가집니다.

State machine이 아무리 복잡하게 구성되어 있더라도, 그것은 결국 유한한 길이의 입력만을 처리할 수 있습니다. Machine의 크기를 늘림으로서 처리할 수 있는 문자열의 길이를 늘릴 수 있지만, 한계는 결국 존재합니다. 예컨대 State machine은 절대로 임의의 문자열에 a와 b가 같은 개수만큼 포함되어있는지 확인하는 문제를 풀 수 없습니다. 비둘기집의 원리에 의해서입니다.

ChatGPT는 대단히 복잡한 구조를 가지고 있습니다. 그러나 아무리 복잡한 구조를 가지고 있다 하더라도 이는 하나의 거대한 함수일 뿐이며, 따라서 잘해줘 봐야 State machine을 넘어서지 못합니다. 즉, 이론상 한 단계 이상이 걸리는 문제는 해결할 수 없습니다.

언듯 ChatGPT는 여러 단계에 걸친 문제를 잘 해결할 수 있는 것처럼 보입니다. 예를 들어서 아래와 같은 절차적인 문제를 잘 처리합니다.

```
User: let a number k = 1. Repeat following operation 10 times.
- k = k * 2

ChatGPT: Sure! Here are the intermediate results after each iteration:

k = k * 2 = 2
k = k * 2 = 4
k = k * 2 = 8
k = k * 2 = 16
k = k * 2 = 32
k = k * 2 = 64
k = k * 2 = 128
k = k * 2 = 256
k = k * 2 = 512
k = k * 2 = 1024
So after 10 iterations, the value of k is 1024.
```

그러나 이는 겉보기에 그렇게 보일 뿐이며, 2의 거듭제곱은 데이터셋에 많이 들어있었을 것이므로 쉽게 처리할 수 있는 것에 불과합니다.

실제로는 곱셈은 절차적인 작업이고, 따라서 ChatGPT와 같은 구조로는 곱셈을 풀 수 없습니다. 예컨대 아래와 같은 질문에서 ChatGPT는 대부분 틀린 답을 내놓습니다.

```
User: 314 * 159

ChatGPT: 314 * 159 = 49,826
```

실제 답은 49926입니다. 이는 이러한 연산에서 ChatGPT는 해상도가 낮은 lookup table에 불과하기 때문입니다.

마찬가지로 앞서 말했던 아래 문제도 풀지 못합니다.

```
User: Does following string contains same number of a and b?
- "aaaabb"

ChatGPT: No, the string "aaaabb" does not contain the same number of "a" and "b".

There are four "a"s and two "b"s in the string, so there are twice as many "a"s as "b"s. Therefore, the string does not contain the same number of "a" and "b".
```

문자열이 짧은 경우 문제를 잘 해결하지만,

```
User: Does following string contains same number of a and b? If there are more 'a', say "More a", if there are more 'b', say "More b", If there are same "a" and "b", say "Same", and never say anything else.
- "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"

ChatGPT: Same.
```

문자열이 긴 경우 쉽게 헷갈립니다. 실제로는 153개의 a와 168개의 b가 포함되어있습니다.

마찬가지로 문자열이 비교적 짧더라도 복잡하면 쉽게 해결할 수 없습니다.

```
User: Does following string contains same number of a and b? If there are more 'a', just say "More a", if there are more 'b', just say "More b", If there are same "a" and "b", just say "Same", and never say anything else.
- "char
bbbbbaabbabbaaaaaaab"

ChatGPT: More b
```

그러나 실제로는 위 문자열에는 정확히 10개의 a와 b가 포함되어있습니다. 이는 Lookup table 방식으로는 해결할 수 없고 반복하는 수밖에 없는 문제이기 때문입니다.

물론 아래와 같은 계산도 제대로 할 수 없습니다.

```
User: Calculate following. Just show me the answer without explanation.
10 + 11 - 32 + 96 - 34 +23 - 88

ChatGPT: 26
```

실제 답은 -14입니다.

# Solution

이는 ChatGPT가 RNN 등과 다르게 1 step만에 문제를 해결하는 구조를 가지고 있기 때문입니다. AI모델이 기하급수적으로 커지는 것 역시 단일 function, 혹은 state machine으로 그 이상의 성능을 내기 위해 과도하게 공간을 넓히고 있기 때문입니다.

이러한 문제를 해결하려면 Turing machine의 구조를 가지는 AI 모델이 필요합니다. 개인적으로는, 현재는 Attention이 Read head로서의 역할만을 수행하지만, Attention 매커니즘을 이용하여 Write head를 구현할 수 있으면 이 문제를 쉽게 해결할 수 있을 거라 생각합니다.

기존에는 모델 그 자체가 메모리의 역할을 수행하여 파라매터에 데이터가 임베딩됩니다. 그러나 이렇게 함으로써 파라매터와 메모리를 분리, 모델의 크기는 충분히 작게 유지하고, Turing machine의 tape에 해당하는 거대한 state vector를 사용하여 거기에 메모리를 임베딩할 수 있을 것입니다. 즉, Big state - small model 형태로 모델을 구현할 수 있고, 이 구조에서는 State vector의 크기만을 늘림으로써 모델의 성능을 원하는 만큼 향상시킬 수 있을 것입니다.

이러한 구조를 Neural Turing Machine (NTM)이라 하며 연구가 활발히 진행되고 있지만 크게 괄목할만한 성과가 보이는 것 같지는 않습니다. 이는 지연된 출력을 내놓을 수 있는 NTM의 특성상 Reinforcement Learning으로만 Training이 가능하여 Training 비용이 상당히 높기 때문이라고 추측됩니다.

전역하기 전에 앞서 제시했던, ChatGPT가 수행하지 못하는 간단한 Task들을 수행할 수 있는 NTM Language 모델을 만들어보는 게 목표입니다.
