---
title: Inertia Tensor
tags:
  - physics
date: 2025-01-22T09:28:40.446Z
---

> This post was translated from Korean into English by AI.

## Motivation

I recently needed to use free-space dynamics that included not only translational motion but also rotation in order to create a transition function for a control task. Dealing with rotation turned out to be more challenging than expected, so I ended up studying a variety of related topics. This post summarizes what I learned.

## Rotation

Rotation is fundamentally difficult. This is because rotations in three dimensions do not form a vector space. Many mathematical properties that generally feel natural or intuitively obvious are, in fact, properties of vector spaces. Since three-dimensional rotations do not form a vector space, however, these properties do not apply, making rotations difficult to handle.

More specifically, three-dimensional rotations can be represented mathematically by the group $SO(3)$. This group has various properties, but the most inconvenient one is that it is not commutative. Various operations, such as scalar multiplication, can be well defined for rotations. Thus, if only commutativity held, rotations would immediately form a vector space and we could take advantage of the convenient properties of vector spaces. However, because the group $SO(3)$ is not commutative, there is no way to handle rotations as conveniently as vectors.

> Euler angles and quaternions are, of course, sometimes represented like vectors. But this is merely a representation; they do not have useful vector-like properties such as the commutativity of addition.

As a result, the mathematical notation used for a rotation becomes largely unrelated to its physical meaning. For example, suppose rotation $A$ is represented as $[1,2,3]$ in some representation, while rotation $B$ is represented as $[4,5,6]$ in the same representation. Regardless of the representation chosen, $A+B$ is generally not $[5,7,9]$. Indeed, since commutativity does not hold, in general $A+B\neq B+A$ to begin with.

Moreover, unlike translational motion, which can be modeled using a point mass, rotational motion is strongly affected by the object's mass distribution. In other words, it is impossible from the outset to model rotation mathematically while ignoring the object's mass distribution. For example, an object rotating in three dimensions can exhibit various phenomena, such as changing its axis of rotation on its own, even in the absence of any external force, air resistance, or friction.

A representative example is the Intermediate Axis Theorem, also known as the tennis racket theorem. It explains how an object rotating about the axis with the intermediate moment of inertia is unstable and begins rotating about another axis as well; this phenomenon occurs even without any external force.

## Modeling

For these reasons, I tried representing an arbitrary object as a fixed number of mutually constrained points. This makes it possible to handle rotation through Lagrangian mechanics in the same way as a system without rotation. Lagrangian mechanics can, of course, also handle systems that include rotation, but treating the object as a constrained particle system makes it possible to generalize the Lagrangian, which is more convenient and less likely to lead to logical errors.

### Inertia Tensor

To do this, I first investigated whether there was a simple physical quantity that determines rotation. If such a quantity exists, the object can be modeled as mutually constrained point masses that have the same value of that quantity. Linkage structures such as multiple pendulums are representative examples analyzed in this way. Conversely, if no such quantity exists, that would mean modeling in this manner is impossible; many problems in fluid dynamics would likely fall into this category.

The moment of inertia is, of course, a well-known physical quantity related to rotation. However, a moment of inertia is defined with respect to a particular axis, and it is clear that this alone does not determine an object's rotational characteristics in space.

After researching the topic using sources such as Wikipedia and ChatGPT, I learned that an object's rotational characteristics are completely determined by its inertia tensor. The inertia tensor is defined as follows.

$$
I_{ij} = \sum_k m_k (r_k^2 \delta_{ij} - r_{ki} r_{kj})
$$

Here, $m_k$ is the mass of the $k$th particle that makes up the object, and $r_k$ is the position vector of the $k$th particle. $\delta_{ij}$ is the Kronecker delta.

Abstractly, the inertia tensor can be viewed as a matrix that represents the moments of inertia about every axis. Alternatively, it can be regarded as the physical quantity that determines the relationship between angular velocity and angular momentum, as follows.

$$
L = I\omega
$$

### Normalization of Inertia Tensor

The value of an inertia tensor also changes depending on the position of the object (or the position of the coordinate system's origin) and the object's rotation (or the rotation of the coordinate system). It is therefore not an intrinsic value of the object. To resolve this issue, the coordinate system of the inertia tensor must be defined intrinsically with respect to the object. The most fundamental intrinsic position associated with an object's shape is its center of mass. We can therefore define the **object's center of mass** as the origin of the inertia tensor's coordinate system.

Next, the orientation of the object must be determined. I approached this as follows.

First, by the Spectral Theorem, any finite-dimensional real symmetric matrix is always orthogonally diagonalizable into a matrix of eigenvectors and a diagonal matrix of eigenvalues, and its eigenvalues are real. In other words, such a symmetric matrix $A$ can be decomposed into a matrix $Q$ of eigenvectors and a diagonal matrix $\Lambda$ of eigenvalues as follows.

$$
A = Q\Lambda Q^T
$$

> Depending on the matrix, some eigenvalues may be repeated. Even in that case, however, an orthogonal eigenvector basis can be obtained through the Gram-Schmidt process.

Because the inertia tensor is symmetric by definition, this decomposition is possible. In addition, by definition its eigenvectors satisfy $Iv = \lambda v$. If $v$ is taken to be the object's angular velocity, then $Iv$ is its angular momentum. Thus, an eigenvector of the inertia tensor represents an axis such that, when the object rotates about it, its angular velocity and angular momentum are parallel. Such an axis is called a principal axis of the object, and the corresponding eigenvector is the moment of inertia about that axis.

Moreover, because the magnitude of each eigenvector can be arbitrarily set to 1, doing so makes $Q$ a rotation matrix. Thus, for any inertia tensor, we can find the rotation matrix made up of its eigenvectors and apply it to the object (or rotate the object's coordinate system) to make the inertia tensor diagonal. Each basis vector then becomes a principal axis of the object, and each basis vector's eigenvalue becomes the moment of inertia about that principal axis.

Finally, once the eigenvectors are ordered by the magnitudes of their eigenvalues, the inertia tensor becomes a value entirely intrinsic to the object. The handedness of the coordinate system (whether it is right-handed or left-handed) is irrelevant to this, so it can be chosen arbitrarily.

In summary, an inertia tensor intrinsic to an object can be obtained by moving the object's center of mass to the origin and aligning the orientation so that the object's principal axes form the basis in order of magnitude.

### Particle System

Next, we need to construct a particle system with the same inertia tensor.

At first, I tried to construct a particle system based on a degrees-of-freedom analysis, but ultimately failed. A brief explanation follows. A point with mass has four degrees of freedom. There are three center-of-mass constraints, one for each axis, ten constraints from the upper-triangular components of the inertia tensor, and one constraint on the sum of the masses, for a total of 14 constraints. From this, we can see that at least four points are required. We could then choose a suitable $n>4$ and solve the following system of equations.

$$
\begin{aligned}
&\sum_{i=1}^n m_i = \text{total\_mass}\\
&\frac{\sum_{i=1}^n m_i x_i}{\sum_{i=1}^n m_i} = 0,\quad
\frac{\sum_{i=1}^n m_i y_i}{\sum_{i=1}^n m_i} = 0,\quad
\frac{\sum_{i=1}^n m_i z_i}{\sum_{i=1}^n m_i} = 0, \\
&\sum_{i=1}^n m_i (y_i^2 + z_i^2) = I_{xx},\quad
\sum_{i=1}^n m_i (x_i^2 + z_i^2) = I_{yy},\quad
\sum_{i=1}^n m_i (x_i^2 + y_i^2) = I_{zz}, \\
&\sum_{i=1}^n m_i x_i y_i = I_{xy},\quad
\sum_{i=1}^n m_i y_i z_i = I_{yz},\quad
\sum_{i=1}^n m_i x_i z_i = I_{xz}.
\end{aligned}
$$

The problem is that solving this system of equations is not easy. It can, of course, be solved readily using numerical methods, but there is a simpler approach.

Using the fact that the object's center of mass lies at the origin, construct a particle system consisting of six points, each of mass $m$, placed at $+d_x$ and $-d_x$ on the $x$-axis, at $+d_y$ and $-d_y$ on the $y$-axis, and at $+d_z$ and $-d_z$ on the $z$-axis. This particle system has its center of mass at the origin, is aligned with the principal axes, and has four degrees of freedom: $m, d_x, d_y, d_z$. An object whose origin is its center of mass and which is aligned with its principal axes likewise has a total of four degrees of freedom: the diagonal components of its inertia tensor and its mass. It is therefore highly likely that this particle system can model an object with any inertia tensor. Of course, a degrees-of-freedom analysis considers only the number of free variables, without accounting for matters such as their ranges, so it must still be proved separately that the system can model an arbitrary mass and inertia tensor.

This particle system has the following inertia tensor. Because it is aligned with the principal axes, all off-diagonal components are zero.

$$
\begin{aligned}
I_{xx} &= 2m(d_y^2 + d_z^2) \\
I_{yy} &= 2m(d_x^2 + d_z^2) \\
I_{zz} &= 2m(d_x^2 + d_y^2) \\
I_{xy} &= I_{yz} = I_{xz} = 0
\end{aligned}
$$

If the mass of the original object is $M$, then $m = M/6$. Substituting this gives the following.

$$
\begin{aligned}
I_{xx} &= \frac{M}{3}(d_y^2 + d_z^2) \\
I_{yy} &= \frac{M}{3}(d_x^2 + d_z^2) \\
I_{zz} &= \frac{M}{3}(d_x^2 + d_y^2)
\end{aligned}
$$

To solve the system above, I expressed and solved it as the following matrix equation.

$$
\begin{bmatrix}
I_{xx} \\
I_{yy} \\
I_{zz}
\end{bmatrix}
=
\frac{M}{3}
\begin{bmatrix}
0 & 1 & 1 \\
1 & 0 & 1 \\
1 & 1 & 0
\end{bmatrix}
\begin{bmatrix}
d_x^2 \\
d_y^2 \\
d_z^2
\end{bmatrix}\\
\therefore
\begin{bmatrix}
d_x^2 \\
d_y^2 \\
d_z^2
\end{bmatrix}
=
\frac{3}{M}
\begin{bmatrix}
0 & 1 & 1 \\
1 & 0 & 1 \\
1 & 1 & 0
\end{bmatrix}^{-1}
\begin{bmatrix}
I_{xx} \\
I_{yy} \\
I_{zz}
\end{bmatrix}
=
\frac{3}{2M}
\begin{bmatrix}
-1 & 1 & 1 \\
1 & -1 & 1 \\
1 & 1 & -1
\end{bmatrix}
\begin{bmatrix}
I_{xx} \\
I_{yy} \\
I_{zz}
\end{bmatrix}
$$

Because the elements of the vector on the left-hand side are squared quantities, they must not be negative. On the right-hand side, however, they could be negative if, for example, $I_{yy} + I_{zz} - I_{xx} < 0$. We must therefore show that such a situation cannot occur. Since this is a mathematical model, one could of course introduce imaginary distances, but in that case there is no guarantee that Lagrangian mechanics would work correctly.

This can be shown as follows. First, for a single particle, the components of its inertia tensor are given by

$$
I_{ij} = m (r^2 \delta_{ij} - r_i r_j)
$$

We are interested in the diagonal components, so we obtain

$$
\begin{aligned}
I_{xx} &= m (y^2 + z^2) \\
I_{yy} &= m (x^2 + z^2) \\
I_{zz} &= m (x^2 + y^2)
\end{aligned}
$$

Thus, for any ordering of the axes,

$$
I_{jj}+I_{kk}-I_{ii} = m ((i^2 + k^2) + (i^2 + j^2) - (j^2 + k^2))=2mi^2 > 0
$$

The inertia tensor of an object made up of multiple particles is the sum of the inertia tensors of the individual particles, and the inequality is preserved under addition, so this property also holds for the inertia tensor of the entire object. Therefore, the method above can model the object's inertia tensor.

The following is a visualization of this construction.

<iframe src="./sim.html"></iframe>

Because the simulation above may not display correctly on a small screen, I recommend clicking [this link](./sim.html) to view it in full-screen mode.

## System

Next, I attempted to use Lagrangian mechanics to model the rotation of an object based on this construction in the absence of external forces. When I first attempted this, I assumed that the Lagrangian-mechanics part would be straightforward, but in practice it was not.

First, I used Euler angles as the generalized coordinates of the object. If the object's position can change, coordinates for its position are needed in addition to its rotation. However, because this system assumes that the center of mass is at the origin and that there are no external forces, the object's position does not change. We therefore need to consider only its rotation.

Next, we need to obtain the Lagrangian. Since there are no external forces, including gravity, there is no potential energy. The Lagrangian is therefore simply the kinetic energy.

The kinetic energy of the system is given by

$$
T = \frac{1}{2} \sum_i m_i v_i^2 = \frac{1}{2} \sum_i m_i \dot{r}_i^2
$$

This expression is not particularly complicated. Here, however, $r_i$ is the object's position vector, so it is given by the product of its original position $r_i^0$ and the rotation matrix $R$. The rotation matrix is as follows.

$$
R = \begin{bmatrix}
\cos\theta & -\sin\theta & 0 \\
\sin\theta & \cos\theta & 0 \\
0 & 0 & 1
\end{bmatrix}
\begin{bmatrix}
\cos\phi & 0 & \sin\phi \\
0 & 1 & 0 \\
-\sin\phi & 0 & \cos\phi
\end{bmatrix}
\begin{bmatrix}
1 & 0 & 0 \\
0 & \cos\psi & -\sin\psi \\
0 & \sin\psi & \cos\psi
\end{bmatrix}
$$

Using all of this, the Lagrangian is obtained as follows. Because the expression is complicated, I used the `sympy` library to calculate it. I ignored the proportionality constant that includes the mass.

$$
\begin{align*}
L&\propto\\

&+l_{x}^{2} \left(\cos^{2}{\left(\theta{\left(t \right)} \right)} \left(\frac{d}{d t} \psi{\left(t \right)}\right)^{2}
+ \left(\frac{d}{d t} \theta{\left(t \right)}\right)^{2}\right) \\
&+ l_{y}^{2} \left(\sin^{2}{\left(\phi{\left(t \right)} \right)} \sin^{2}{\left(\theta{\left(t \right)} \right)} \left(\frac{d}{d t} \psi{\left(t \right)}\right)^{2} - \sin^{2}{\left(\phi{\left(t \right)} \right)} \left(\frac{d}{d t} \psi{\left(t \right)}\right)^{2} + \sin^{2}{\left(\phi{\left(t \right)} \right)} \left(\frac{d}{d t} \theta{\left(t \right)}\right)^{2} - 2 \sin{\left(\phi{\left(t \right)} \right)} \cos{\left(\phi{\left(t \right)} \right)} \cos{\left(\theta{\left(t \right)} \right)} \frac{d}{d t} \psi{\left(t \right)} \frac{d}{d t} \theta{\left(t \right)} - 2 \sin{\left(\theta{\left(t \right)} \right)} \frac{d}{d t} \phi{\left(t \right)} \frac{d}{d t} \psi{\left(t \right)} + \left(\frac{d}{d t} \phi{\left(t \right)}\right)^{2} + \left(\frac{d}{d t} \psi{\left(t \right)}\right)^{2}\right) \\
&+ l_{z}^{2} \cdot \left(2 \sin{\left(\phi{\left(t \right)} \right)} \cos{\left(\phi{\left(t \right)} \right)} \cos{\left(\theta{\left(t \right)} \right)} \frac{d}{d t} \psi{\left(t \right)} \frac{d}{d t} \theta{\left(t \right)} - 2 \sin{\left(\theta{\left(t \right)} \right)} \frac{d}{d t} \phi{\left(t \right)} \frac{d}{d t} \psi{\left(t \right)} - \cos^{2}{\left(\phi{\left(t \right)} \right)} \cos^{2}{\left(\theta{\left(t \right)} \right)} \left(\frac{d}{d t} \psi{\left(t \right)}\right)^{2} + \cos^{2}{\left(\phi{\left(t \right)} \right)} \left(\frac{d}{d t} \theta{\left(t \right)}\right)^{2} + \left(\frac{d}{d t} \phi{\left(t \right)}\right)^{2} + \left(\frac{d}{d t} \psi{\left(t \right)}\right)^{2}\right)

\end{align*}
$$

We can now solve the following system of Euler-Lagrange equations for the generalized coordinates $\theta, \phi, \psi$.

$$
\frac{d}{dt} \left(\frac{\partial L}{\partial \dot{q}_i}\right) - \frac{\partial L}{\partial q_i} = 0
$$

However, when I performed this calculation, simplifying and solving the equations took more than five minutes, and even the resulting expressions alone occupied several kilobytes when saved as text. It is therefore difficult to include them in a blog post, so I am attaching the following text file instead.

- [Lagrangian calculation result](./log.txt)

This was calculated with the following code.

- [Code for calculating the Lagrangian and system equations](./rot1.py)

I then created a simple system and tested the Intermediate Axis Theorem to see whether this could actually be used to model the system. The video is shown below.

<video src="./rot.mov" controls>
  Your browser does not support the video tag.
</video>

This video was created with the following code.

- [System simulation code](./rot2.py)

## Limitation

- The speed gradually increases slightly toward the end of the video. I believe this is due to numerical error, because I used only the explicit Euler method for the simulation. Although the equations are complicated, they are simple ordinary differential equations, so a more sophisticated method such as Runge-Kutta could be used in the future.
- The expressions are excessively long. This is probably because the matrix calculations included in the process above were expanded directly into a single expression, creating repeated parts that increased its length. This, too, could likely be solved more efficiently.

## Conclusion

I studied the rotation of objects. I showed that, at least, any rigid body can be modeled as a combination of six symmetrically arranged point masses, and visualized the construction to verify that it agrees with intuition. I also showed that, given such a system, its equations of motion can be derived using Lagrangian mechanics.
