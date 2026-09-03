---
title: Lagrangian Mechanics [4] - Special Systems
tags:
  - math
  - science
date: 2020-11-02T04:44:48.256Z
---

> This post was translated from Korean into English by AI.

# Special Systems

I had originally planned to wrap up this series with part 3, but then I realized there was something I had not covered: cases where a system cannot be handled easily with Lagrangian mechanics. All the systems we discussed up to the previous post were differentiable systems. In reality, however, systems that are not differentiable are far more common. What should we do in such cases?

## Discontinuous Systems

The most representative example is a discontinuous system. As the simplest case, consider a collision in which a ball strikes a wall and bounces away. The path develops a cusp at the moment of impact, making it non-differentiable.

## Systems with a Restricted Range

Another case is a system whose range is restricted. For example, the pendulum discussed in the previous post was free to move through any angle. It could therefore rise to a position higher than the point from which it was suspended. But we might instead want to limit the range of angles through which the pendulum can move, so that it oscillates only within a certain range. A typical example is a string attached to a ceiling: unless the pendulum passes through the ceiling, it can oscillate only between -90 and 90 degrees.

## Systems with a One-Directional Constraint Force

Finally, there are cases in which a constraint acts in only one direction. Imagine letting a small sphere roll and slide from the top of a large hemisphere. At first, the small sphere follows the surface of the large sphere, but once the slope becomes sufficiently steep, it leaves the spherical surface.

# Solution

I gave several examples in the sections above to make the idea easier to understand, but in fact they can all be explained in one way: the system has a discontinuous potential. Consider, for example, a ball bouncing off the ground. While the ball is in the air, it has gravitational potential (expressed as $mgh$). If the ball were below the ground, however, it would theoretically have infinite potential. Thus, at $h=0$, the potential is not only discontinuous but also divergent.

There are two main ways to deal with cases like this.

## Pretending It Is Continuous

The first is simply to pretend that the system is continuous. When a ball bounces off the ground, for example, the system is discontinuous at $h=0$ if the ball is a point particle with no size and the ground is rigid. But if we make the model slightly more realistic and assume that the ground is not rigid, but instead an elastic body with a very large elastic modulus, the potential increases rapidly at $h=0$ without being discontinuous. We can therefore define the potential as follows.

$$
U=mgh+e^{-\beta h}
$$

Here, we choose a suitably large value for $\beta$. In my experience, a value of around 4 to 6 worked reasonably well. This makes the potential nearly equal to $mgh$ when $h>0$, while causing it to diverge rapidly when $h<0$, giving us the potential we want.

There are many functions that increase rapidly near zero, such as $\beta/h^2$, so there is nothing wrong with choosing another appropriate function. I chose the function $e^{\beta h}$ because it was used in a [reference](https://www.slideserve.com/donar/nano-mechanics-and-materials-theory-multiscale-methods-and-applications-powerpoint-ppt-presentation) I found online. I suspect the reference used this function because

1. it is easy to differentiate,
2. it is relatively unaffected by floating-point errors, and
3. it is somewhat less sensitive to error.

For example, if we used the function $1/h^2$, then while running a numerical simulation, the ball would pass through the ground and fall downward the moment an error caused $h<0$. Below is an example of a two-dimensional potential well implemented using this method.

<iframe src="https://unknownpgr.github.io/lagrangian-mechanics/sim-bounce.html"></iframe>

## Analysis Using Generalized Forces

The other method is to use generalized forces. However, an explanation of how to perform the analysis using generalized forces would be long enough to fill an entire post by itself. As it happens, the topic is explained thoroughly on ~~NamuWiki~~(...). I therefore recommend referring to NamuWiki's section on [solving the Euler–Lagrange equation in the presence of constraint forces](https://namu.wiki/w/%EB%9D%BC%EA%B7%B8%EB%9E%91%EC%A3%BC%20%EC%97%AD%ED%95%99#s-5.2).
