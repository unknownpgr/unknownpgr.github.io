"""
\int \frac{1}{(2\pi)^{n/2}|Q_t|^{1/2}} \exp\left(-\frac{1}{2} (x_t - F_t x_{t-1} - B_t u_t)^T Q_t^{-1} (x_t - F_t x_{t-1} - B_t u_t)\right) \frac{1}{(2\pi)^{n/2}|\Sigma_{t-1}|^{1/2}} \exp\left(-\frac{1}{2} (x_{t-1} - \mu_{t-1})^T \Sigma_{t-1}^{-1} (x_{t-1} - \mu_{t-1})\right) dx_{t-1}
"""

import sympy as sp

m = 4
n = 3

# mxm random matrix symbol Q
Q = sp.MatrixSymbol("Q_t", m, m)

# mxm random matrix symbol F
F = sp.MatrixSymbol("F_t", m, m)

# mxm random matrix symbol B
B = sp.MatrixSymbol("B_t", m, m)

# mx1 random matrix symbol u
u = sp.MatrixSymbol("u_t", m, 1)

# mx1 random matrix symbol x
x = sp.MatrixSymbol("x_{t-1}", m, 1)

# mxm random matrix symbol Sigma
Sigma = sp.MatrixSymbol("Sigma_t", m, m)

# mx1 random matrix symbol mu
mu = sp.MatrixSymbol("mu_t", m, 1)

tmp = x - F * x - B * u
exp = tmp.T * Q.inv() * tmp + (x - mu).T * Sigma.inv() * (x - mu)
exp = sp.expand(exp)
print(sp.latex(exp))
