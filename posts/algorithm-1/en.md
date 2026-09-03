---
title: "Algorithm: N-Queens Problem"
tags:
  - algorithm
date: 2021-01-17T17:26:17.050Z
---

> This post was translated from Korean into English by AI.

While wondering what fun things I could do over this winter break, I realized that I had never properly studied algorithms—the thing everyone else seems to do. Since coding tests have become a standard part of applying for jobs these days, I decided to spend this winter break studying algorithms.

I declined to learn them when the algorithm club offered to teach me, only to start doing this now. I would like to offer my belated apologies to my friend Mr. Kim, who runs the algorithm club.

# N-Queens Problem

The N-Queens problem asks how many ways there are to place n queens on an n by n chessboard so that no two queens can attack each other. For example, suppose the queens are arranged as follows.

![Baekjoon Problem 9663, N-Queen :: Mygumi :: Mygumi's HelloWorld](imgs/99CF74335995692437)

None of the queens share the same row, column, or diagonal. Therefore, none of them can attack one another.

## Solution

 This problem is a classic example of backtracking, and the key is how efficiently the state of the queens can be represented.

 The most intuitive approach is to represent the state as a binary vector with $n^2$ elements. In other words, number the squares on the chessboard above from 1, 2, 3, 4, ... to 64, starting at the top right and moving toward the bottom left, and use a 64-element vector whose kth element is 1 if there is a queen on the kth square. This gives us the terrifying number of $2^{n^2}$ possible states. For $n=8$, there are approximately $1.8\times10^{19}$ possibilities.

 Of course, that is an extremely inefficient implementation. Most of those states—including a board filled entirely with queens and one with no queens at all—do not even satisfy the basic requirement that exactly $n$ queens be placed. So let us consider only cases with exactly $n$ queens. We can use a vector of length $n$ whose kth element represents the position of the kth queen. This gives $(n^2)^n=n^{2n}$ possible states. For $n=8$, that is about $2.8\times10^{14}$. It still looks large, but the number of possibilities has fallen by a factor of 100,000.

 This representation does not account for queens occupying the same square, so all the queens could end up in one place. In other words, it is a permutation with repetition. To prevent positions from overlapping, we can simply change it to a permutation without repetition—that is, choose 8 positions out of the 64 available positions. The number of possibilities is therefore $n^2!/(n^2-n)!=\Pi_{i=0}^{n-1}n^2-i$. For $n=8$, that is $1.8\times10^{14}$, which is a teeny-tiny reduction.

 If we think about it once more, the order of the queens does not matter at all. We can therefore replace the permutation with a combination. In other words, we choose 8 positions out of the 64 available positions. This gives $n^2!/(n^2-n)!n!$ possibilities, or $4.4\times10^9$ when $n=8$—another reduction by a factor of about 100,000.

 But come to think of it, no two queens may occupy the same column. Since there are $n$ columns and $n$ queens, each column must contain exactly one queen. Each of the $n$ columns has $n$ possible positions for its queen, reducing the number of possibilities to $n^n$. For $n=8$, that is $1.6\times10^7$, a hundredfold reduction.

 But wait! If we think about it yet again, no two queens may occupy the same row either. That means there must be exactly one queen in each row. In other words, the possible positions chosen for the queens in each column must not overlap. The previous case was a permutation with repetition; this case is a permutation without repetition. The number of possibilities is therefore $n!$. For $n=8$, there are 40,320 possibilities—a thousandfold reduction. To exaggerate just a little, this seems manageable enough that you could gather a large group of people and have them work it out by hand.

 Comparing the first case with the last, the difference is a factor of nearly $10^{14}$.

## Source Code

 Below is my Python implementation of the final approach. The `permutation` function generates permutations one step at a time. Each time it adds an element, it checks whether the resulting placement is valid and stops exploring that branch if it is not.

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

This implementation is not actually optimal either. The `adds` and `subs` dictionaries in `back_tracking_check` contain a great deal of repeated information, so their values could be stored and reused instead of recalculated every time. But because the numbers are small enough, I chose simply to recompute them on each pass. If $n$ becomes large, the difference between storing those dictionaries and not storing them becomes enormous.
