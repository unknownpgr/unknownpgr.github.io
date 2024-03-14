---
title: Lagrange mechanics [4] - special system
tags:
  - math
  - science
date: 2020-11-02T04:44:48.256Z
---

> Translated with the help of ChatGPT and Google Translator

# Special system

Originally, I was going to finish the article in part 3, but when I thought about it, there was something I didn't cover. This is the case when the system cannot be easily treated by Lagrangian mechanics. The systems we've covered so far were all differentiable systems. However, in reality, there are many cases where the system is not differentiable. What should I do in this case?

## Discontinuous system

The most typical example is a discontinuous system. For example, in the simplest case, if you think of a collision where a ball hits a wall and bounces off, the path becomes an indifferentiable path because there is a peak at the time of the collision.

## System given scope

In other cases, the scope of the system may be given. For example, the pendulum discussed in the previous post has a free angle. So the pendulum can go up to higher coordinates than the fixed point. However, you may want to place limits on the angles at which the pendulum can move, for example, so that the pendulum only oscillates within a certain angle. For example, if a string is attached to the ceiling, the pendulum can only oscillate from -90 degrees to 90 degrees unless it pierces the ceiling.

## System with one-way binding force

Finally, there are cases where the constraints are unidirectional. Roll and slide the small sphere from the top of the large hemisphere. In that case, the small sphere initially rolls along the surface of the large sphere, but when the slope becomes steeper to a certain extent, it leaves the spherical surface.

# Resolution

The above paragraph contains several examples to help you understand, but in reality, they can all be explained in one way. This is the case where the system has a discontinuous potential. For example, let's consider a ball bouncing off the floor. In this case, the ball has a gravitational potential (expressed as $mgh$) in the air. However, if the ball is below the floor, it theoretically has infinite potential, so the potential is discontinuous and diverges at $h=0$.

There are two main ways to solve this case.

## Pretending to be continuous

The first is to just pretend that the system is continuous. For example, if a ball bounces on the floor, the system is discontinuous at $h=0$ if the ball is a sizeless particle and the floor is a rigid body. However, if we slightly reflect reality and assume that the floor is not a rigid body but an elastic body with a very high elastic modulus, then at $h=0$ the system grows rapidly but is not discontinuous. Therefore, we can give the potential as follows:

$$
U=mgh+e^{-\beta h}
$$

At this time, $\beta$ is given an appropriately large value. In my experience, 4 to 6 isn't bad. This allows us to create the potential we want because it becomes almost $mgh$ at $h>0$ and diverges quickly at $h<0$.

And since there are several functions that increase rapidly from 0, such as $\beta/h^2$, there is no problem in using an appropriate function. The reason I chose the function $e^{\beta h}$ is because I saw it on the Internet [reference](https://www.slideserve.com/donar/nano-mechanics-and-materials-theory-multiscale-methods- This is because this function was used in (and-applications-powerpoint-ppt-presentation). The reason for using this function in the reference is probably

1. The function is easy to differentiate
2. Less affected by floating point errors, etc.
3. Less sensitive to errors

I think it is. For example, if you used the function $1/h^2$, it would break through the floor and fall downward as soon as $h<0$ due to an error during simulation through numerical analysis. Below is an example of a two-dimensional potential well implemented using this method.

<iframe src="https://unknownpgr.github.io/lagrangian-mechanics/sim-bounce.html"></iframe>

## Analyze using generalization power

Another way is to use generalization powers. However, the analysis method using generalization power is long enough to write a post on its own. Coincidentally, ~~Namu Wiki~~(...) has detailed information on it. So, Namu Wiki’s [Solving the Euler-Lagrange equation in the case of binding](https://namu.wiki/w/%EB%9D%BC%EA%B7%B8%EB%9E%91%EC%A3% It would be a good idea to refer to paragraph BC%20%EC%97%AD%ED%95%99#s-5.2).
