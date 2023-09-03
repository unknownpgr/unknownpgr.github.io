---
title: 알고리즘:N-queens problem
tags:
  - algorithm
date: 2021-01-17T17:26:17.050Z
---

이번 겨울방학에는 무슨 재밌는 걸 하면 좋을까...하고 고민하다가 여태까지 남들 다 하는 알고리즘을 제대로 해 본 적이 없다는 걸 알게 됐습니다. 그래서 요새는 회사 입사 시 코딩 테스트는 기본인 만큼 이번 겨울방학에는 알고리즘을 공부해보려고 합니다.

정작 알고리즘 동아리에서 가르쳐준다고 할 때에는 안 하다가 이제 와서야 이러고 있습니다. 알고리즘 동아리 운영 중인 친구 김 모 군에게 심심한 사과의 말을 전합니다.

# N-Queens Problem

N-Queens problem은 n by n 체스 보드 위에 n개의 퀸을 서로 공격할 수 없도록 배치할 수 있는 가짓수가 몇 개나 되는지 알아보는 문제입니다. 예를 들어, 퀸을 아래와 같이 배치했다고 가정하겠습니다.

![백준 9663번 N-Queen :: 마이구미 :: 마이구미의 HelloWorld](imgs/99CF74335995692437)

그러면 모든 퀸이 서로 같은 가로선상에 있지 않고, 같은 세로선상에 있지도 않으며, 같은 대각선상에 있지도 않습니다. 그러므로 모든 퀸들은 서로 공격할 수 없는 상태입니다.

## Solution

 이 문제는 back-tracking 문제의 대표적인 예시로, 얼마나 효율적으로 퀸의 상태를 나타내는지가 문제의 핵심이 됩니다.

 가장 직관적인 방법은 그냥 $n^2$개의 원소를 가지는 binary vector로 상태를 나타내는 것입니다. 즉, 위 체스판에서 오른쪽 위에서 왼쪽 아래로 1,2,3,4....64까지 번호를 매긴 후, k번째 칸에 퀸이 있으면 k번째 원소를 1로 하는, 길이 64자리 벡터를 사용하는 방법입니다. 이렇게 하면 가능한 모든 경우의 수는 $2^{n^2}$이라는 보기만 해도 무서운 숫자가 됩니다. $n=8$이라 하면 경우의 수는 무려 $1.8\times10^{19}$정도가 됩니다.

 물론 위는 엄청나게 비효율적인 구현입니다. 왜냐하면 위 경우에서는 모든 칸이 퀸으로 가득차는 경우와 퀸이 단 하나도 없는 경우 등, 애초에 $n$개의 퀸을 배치한다는 조건 자체를 만족하지 않는 경우가 대부분이기 때문입니다. 그러므로 퀸이 오직 $n$개만 있는 경우를 가정해보겠습니다. 그럴 경우, $k$번째 원소가 $k$번째 퀸의 위치를 나타내는 길이 $n$인 벡터를 사용할 수 있습니다. 이 경우에는 가능한 가짓수가 $(n^2)^n=n^{2n}$가지가 됩니다. $n=8$이라 하면 이는 약 $2.8\times10^{14}$으로, 아직도 커보이기는 하지만 가능한 가짓수가 10만 배나 줄어들었습니다.

 그런데 위 경우에서는 퀸의 위치가 겹치는 것을 고려하지 않아서, 모든 퀸이 같은 자리에 있을 수도 있습니다. 즉, 이는 중복순열입니다. 따라서 퀸의 위치가 겹치지 않게 하려면 중복순열을 그냥 순열로 바꿔주면 됩니다. 즉, 64개의 가능한 자리 중 8개의 자리를 고르는 경우입니다. 따라서 가능한 가짓수는 $n^2!/(n^2-n)!=\Pi_{i=0}^{n-1}n^2-i$가지가 되며, $n=8$이라 하면 $1.8\times10^{14}$로, 약-간 줄어들었습니다.

 여기서 다시 한 번 생각해보면 퀸의 순서는 전혀 중요하지 않습니다. 그러므로 순열을 조합으로 바꿀 수 있습니다. 즉, 64개의 가능한 자리 중 8개의 자리를 고르는 경우입니다. 이렇게 하면 가능한 가짓수는 $n^2!/(n^2-n)!n!$으로, $n=8$이라 하면 $4.4\times10^9$개로, 다시 약 10만 배 줄어들었습니다.

 그런데 가만히 생각해보면, 그 어떤 퀸도 같은 column에 놓이면 안 됩니다. 그런데 column은 $n$개고 퀸도 $n$개이니 각 column당 퀸이 딱 한 개 놓인다는 말이 됩니다. 그러므로 $n$개의 각 column당 $n$개의 위치에 퀸을 놓을 수 있으니, 가능한 가짓수는 $n^n$까지 줄어듭니다. 이 경우 $n=8$이라고 하면 $1.6\times10^7$개로, 100배 줄어들었습니다.

 그런데! 또 다시 한 번 생각해보면 그 어떤 퀸도 같은 row에 놓이면 안 됩니다. 그러므로 각 row당 퀸이 딱 하나만 놓일 수 있다는 말이 됩니다. 즉, 각 column에서 퀸을 놓을 수 있는 자리가 서로 중복되면 안 된다는 말입니다. 따라서 위의 경우는 중복순열이었는데, 이 경우 순열이 됩니다. 그러므로 가지수는 $n!$가지가 됩니다. 이 경우 $n=8$이라 하면 가능한 가짓수는 40320개로, 1000배 줄어들었습니다. 약간 과장하자면 이정도라면 사람들을 많이 모아 놓고 손으로 계산하라 해도 할 수 있을 것 같습니다.

 맨 처음의 경우와 마지막 경우를 비교해보면 그 차이가 거의 $10^{14}$배나 차이납니다.

## Source Code

 아래는 제가 맨 마지막 경우를 Python으로 구현해 본 것입니다. `permutation` 함수를 사용해 순차적으로 순열을 생성하되, 생성할 때마다 가능한 배치인지를 고려하여 불가능할 경우 더이상 진행하지 않습니다.

```python
def permutation(n, f):
    queue = [([], list(range(n)))]
    results = []
    while len(queue) > 0:
        permutation_list, unused_number = queue.pop()
        len_u = len(unused_number)
        len_t = len(permutation_list)+1
        if len_u > 0:
            for i in range(len_u):
                temp = permutation_list[:]
                temp.append(unused_number[i])
                # Do not calculate further.
                if not f(temp, len_t):
                    continue
                queue.append((temp, unused_number[:i]+unused_number[i+1:]))
        else:
            results.append(permutation_list)
    return results


def main1(n=8):
    def back_tracking_check(p, l):
        # Check if queens are on same diagonal.
        if l == 0:
            return True
        # Use dictionary as set
        adds = {}
        subs = {}
        for i in range(l):
            add = i+p[i]
            sub = i-p[i]
            if add in adds:
                return False
            if sub in subs:
                return False
            adds[add] = True
            subs[sub] = True
        return True

    r = permutation(n, back_tracking_check)

    for case in r:
        for i in range(n):
            row = ['□']*n
            row[case[i]] = 'Q'
            print(' '.join(row))
        print()

    return r


print('START!')
print(len(main1(8)))

```

이 구현도 사실 최적인 건 아닙니다. `back_tracking_check`함수의 `adds`, `subs` dictionary는 사실 중복되는 부분이 많아 매번 계산하지 않고 저장된 값을 불러다 사용할 수 있지만, 숫자가 충분히 작기 때문에 그냥 매번 새로 계산하도록 구현했습니다. 만약 $n$이 커진다면 저 dictionary를 저장하는 경우와 저장하지 않는 경우의 차이가 매우매우 커집니다.
