$$
C + B^{T} x + x^{T} A x + x^{T} B\\
C - B^{T} A^{-1} B + B^{T} \left(A^{T}\right)^{-1} A x + B^{T} \left(A^{T}\right)^{-1} B + x^{T} A x + x^{T} B\\
$$

$$
P:=n \times n\\
H:=m \times n\\
R:=m \times m\\
\left(P^{-1} + H^{T} R^{-1} H\right)^{-1}\\
\left(I - P H^{T} \left(H P H^{T} + R\right)^{-1} H\right) P\\
$$

$$
- x_{t-1}^{T} Q_{t}^{-1} F_{t} x_{t-1}
+ x_{t-1}^{T} Q_{t}^{-1} x_{t-1}
+ x_{t-1}^{T} \Sigma_{t}^{-1} x_{t-1}
+ x_{t-1}^{T} F_{t}^{T} Q_{t}^{-1} F_{t} x_{t-1}
- x_{t-1}^{T} F_{t}^{T} Q_{t}^{-1} x_{t-1}

- x_{t-1}^{T} \Sigma_{t}^{-1} \mu_{t}
+ x_{t-1}^{T} F_{t}^{T} Q_{t}^{-1} B_{t} u_{t}
- x_{t-1}^{T} Q_{t}^{-1} B_{t} u_{t}

- \mu_{t}^{T} \Sigma_{t}^{-1} x_{t-1}
+ u_{t}^{T} B_{t}^{T} Q_{t}^{-1} F_{t} x_{t-1}
- u_{t}^{T} B_{t}^{T} Q_{t}^{-1} x_{t-1}

+ \mu_{t}^{T} \Sigma_{t}^{-1} \mu_{t}
+ u_{t}^{T} B_{t}^{T} Q_{t}^{-1} B_{t} u_{t}
$$

$$
- x_{t-1}^{T}\left(
  Q_{t}^{-1} F_{t}
  + Q_{t}^{-1}
  + \Sigma_{t}^{-1}
  + F_{t}^{T} Q_{t}^{-1} F_{t}
  - F_{t}^{T} Q_{t}^{-1}
\right) x_{t-1}

- x_{t-1}^{T}\left(
  \Sigma_{t}^{-1} \mu_{t}
  - F_{t}^{T} Q_{t}^{-1} B_{t} u_{t}
  + Q_{t}^{-1} B_{t} u_{t}
\right)

- \left(
  \mu_{t}^{T} \Sigma_{t}^{-1}
  - u_{t}^{T} B_{t}^{T} Q_{t}^{-1} F_{t}
  + u_{t}^{T} B_{t}^{T} Q_{t}^{-1}
\right) x_{t-1}

+ \mu_{t}^{T} \Sigma_{t}^{-1} \mu_{t}
+ u_{t}^{T} B_{t}^{T} Q_{t}^{-1} B_{t} u_{t}
$$

// Group by x\_{t-1}
