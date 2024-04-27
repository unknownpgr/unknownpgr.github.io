import sympy as sp

# 4x4 random matrix P
P = sp.Matrix(sp.randMatrix(4, 4))

# 4x3 random matrix H
H = sp.Matrix(sp.randMatrix(3, 4))

# 3x3 random matrix R
R = sp.Matrix(sp.randMatrix(3, 3))

a = (H.T * R.inv() * H + P.inv()).inv()
b = (sp.eye(4) - P * H.T * (H * P * H.T + R).inv() * H) * P

print(a)
print(b)
print(a - b)

import sympy as sp

# 4x4 random matrix symbol P
P = sp.MatrixSymbol("P", 4, 4)

# 2x4 random matrix symbol H
H = sp.MatrixSymbol("H", 2, 4)

# 2x2 random matrix symbol R
R = sp.MatrixSymbol("R", 2, 2)

# 4x4 identity matrix
I = sp.eye(4)

a = (H.T * R.inv() * H + P.inv()).inv()
b = (I - P * H.T * (H * P * H.T + R).inv() * H) * P

print(a)
print(b)
print(sp.latex(sp.simplify(a - b)))
