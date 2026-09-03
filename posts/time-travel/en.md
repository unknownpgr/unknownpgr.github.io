---
title: An Argument About Predicting the Future
tags:
  - math
  - science
date: 2021-02-18T15:00:27.250Z
---

> This post was translated from Korean into English by AI.

# An Argument About Predicting the Future

This post explains why it is impossible to predict the future with perfect accuracy.

![Tardis_BBC_Television_Center](imgs/Tardis_BBC_Television_Center.jpg)

## A Deterministic Universe

As noted above, this argument deals with the case of a deterministic universe. Here, *deterministic* means that the future of the universe is already fixed. It is important to note that this does not enable us to predict the future.

If the universe operates according to physical laws that involve no randomness whatsoever—in other words, if the universe over time is a Markov chain—then it is naturally deterministic. But the fact that the universe is deterministic does not imply that there is no randomness in it.

Consider a novel or a film, for example. A novel or film obviously has a predetermined ending. Yet no matter how closely you read a novel, you cannot predict its ending before you have read it all the way through. Of course, because there will be some degree of narrative coherence between the beginning and the end, you may be able to predict the ending, but you cannot say that your prediction will be correct 100% of the time.

The universe is the same. Even if the universe is deterministic, and its entire history from beginning to end is already fixed, that does not mean that those of us living in the present can predict the future.

> No randomness exists in the universe → The universe is deterministic (O)
>
> The universe is deterministic → No randomness exists in the universe (X)

## Premises of the Argument

1. The universe is deterministic. That is, everything from the beginning to the end of the universe is, in fact, already fixed and cannot be changed.
2. Einstein's theory of relativity will not be considered. Every space appearing in this argument is in an inertial frame of reference, sufficiently local, and not moving at relativistic speeds.
3. The Hubble expansion of the universe and similar phenomena will also not be considered. The universe is static.

## The Argument

First, following Premise 2, let us assume that time flows uniformly throughout the entire universe. Let $f(t)$ denote the state vector of the universe at time $t$. Here, $f(t)$ perfectly describes all the information in the universe. As a simple example, we can imagine it as a vector formed by listing the position, mass, charge, and velocity of every particle in the universe in a single row.

Suppose it is possible to predict some piece of future information exactly. That is, at some time $t$, it is possible to predict part of the information about the universe at time $t+\alpha$ (where $\alpha>0$). Therefore, some part of the information about the universe at time $t$ is related to the information about the universe at time $t+\alpha$. Let us call this relationship $g$. We can therefore write $g(f(t),f(t+\alpha))=0$. Here there are two functions, $g$ and $f$, but only one equation. Thus, there is no problem with choosing either $g$ or $f$ freely, but we cannot choose both freely.

In other words, fixing the universe restricts the ways in which the future can be predicted, while choosing a way to predict the future restricts the universe.

## A Rigorous but Unrealistic Example

Imagine a universe consisting of a machine, a button, and a light. This universe is so simple that either $t=0$ or $t=1$. The machine is either pressing the button or not pressing it, and the light is either on or off. There is nothing in between. Therefore, this universe can be represented by a vector of the form $[\text{state of the machine}, \text{state of the light}]$. Let the machine's state be 1 when it is pressing the button and the light's state be 1 when it is on; otherwise, let each state be 0. For example, if the machine is pressing the button and the light is off, this universe can be represented as $[1,0]$.

Now suppose that this light foretells the future. That is, if the machine presses the button at $t=1$, the light turns on at $t=0$; if the button is not pressed at $t=1$, the light does not turn on. In this case, the possible universes are as follows.

Thus, in this case, $g$ can be expressed as follows.

$$
g(s_a,s_b)=s_a\cdot[0,1]-s_b\cdot[1,0]
$$

Here, the operation $\cdot$ is the ordinary dot product.

But now suppose that the machine is contrarian. That is, if the light is on at $t=0$, the machine does not press the button at $t=1$; and if the light is off at $t=1$, it presses the button at $t=1$. In that case, $f(1)\cdot[1,0]=1-f(0)\cdot[0,1]$, so rearranging in terms of $f$ gives $f(0)\cdot[0,1]+f(1)[1,0]=1$.

Now substitute $f(0),f(1)$ for $s_a,s_b$. We then obtain $f(0)\cdot[0,1]-f(1)\cdot[1,0]=0$. But adding the two equations gives $2f(0)\cdot[0,1]=1$, from which we conclude that $f(0)\cdot[0,1]=1/2$. Yet we assumed earlier that every variable is either $0$ or $1$, so this is a contradiction.

The contradiction becomes even clearer if we assume that the field of this vector is ${0,1}$. This is because addition and subtraction are the same operation in that case, so the two equations above become the following.

$$
f(0)\cdot[0,1]+f(1)[1,0]=1\\
f(0)\cdot[0,1]+f(1)[1,0]=0
$$

This is equivalent to $0=1$, so it is clearly false.

From this, we can draw two conclusions.

- If the contrarian machine exists, the light cannot predict the future.
- If the light can predict the future, the contrarian machine cannot exist.

This is a concrete example of the point made earlier.

> Fixing the universe restricts the ways in which the future can be predicted, while choosing a way to predict the future restricts the universe.

## A Realistic but Less Rigorous Example

Imagine a room. It is just large enough for one person to enter. Inside is a light that, much like the one in the example above, predicts the future as follows.

1. The moment a person enters and closes the door, the light predicts the future and turns either off or on.
2. If the person remains in the room until five seconds later without opening the door in the meantime, the light turns on.
3. If the person leaves the room within five seconds of closing the door, or opens the door even once, the light does not turn on.

Now suppose there is a contrarian person. This person decides to act as follows.

1. If the light turns on, they will open the door and leave. In case someone outside tries to hold the door shut, they will enter the room after installing special equipment capable of forcing the door open.
2. If the light turns off, they will lock the door so that it can never open. Before closing it, they will already have fitted it with a heavy-duty lock, allowing them to lock the door the moment they see the light turn off after it closes.

If this person succeeds in entering the room and closing the door, there are four possible outcomes.

1. The light turned off, but the person did not leave the room. In other words, the light failed to predict the future.
2. The light turned on, but the person left the room. In other words, the light failed to predict the future.
3. The light turned off, and the person tried to leave the room but was unable to. In other words, the person failed to achieve their goal.
4. The light turned on, and the person intended to remain in the room but ended up leaving. In other words, the person failed to achieve their goal.

Cases 1 and 2 are cases in which fixing the universe restricts the ways in which the future can be predicted.

Cases 3 and 4 are cases in which fixing a way to predict the future restricts the universe.

Some people might say that if such a room really existed, something like Case 3 or 4 would happen. For example, the person might try to leave the room but suffer a sudden heart attack and be unable to do so.

Now, however, suppose we bring in as many as 1,000 such contrarian people and have them perform the same experiment. And suppose that the light succeeds in predicting the future. In that case, something extraordinary would have to happen to every one of those 1,000 people: they would try to leave but be unable to, try to stay but be forced to leave, or fail to enter the room in the first place.

Common sense tells us that this would not happen. Of course, if we designed the experiment more rigorously, we could arrange things so that

1. the ability to predict the future would violate the laws of physics, or
2. the experiment itself would be impossible to perform.

## Counterexample

Of course, the situation could instead be as follows.

1. There are two such rooms, and this time the light in one room predicts the state of the other room.
2. But the rooms are so far apart that light takes ten seconds to travel between them, making it absolutely impossible for information to pass from one room to the other within five seconds.

In this case, the contradiction above does not actually arise. But to learn information about one room from the other, we would have to wait at least ten seconds, which is no different from not predicting the future at all. For example, it is no different from having someone outside observe whether the door opens and then turn the light on or off.

## Conclusion

- In a deterministic universe, information cannot be brought back from the future. Of course, the future can be predicted using the laws of physics and so forth, but this is merely a conjecture; it is obviously not the same as actually obtaining information from the future.
- Even if it is possible to know about a future event, it is impossible to know that information before the event occurs.

- A nondeterministic universe is, by definition, nondeterministic, so there is no predetermined future in the first place. Nor can information be brought back from the future.

- Therefore, although it may be possible to make conjectures about the future, it is impossible to actually obtain information from the future.
- Future prediction of the kind seen in `Tenet` or the story `exhalation` cannot occur.
