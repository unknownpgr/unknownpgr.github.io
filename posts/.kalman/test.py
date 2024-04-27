import sympy as sp


def disp(x):
    print(sp.latex(x) + "\\\\")


size_state = sp.Symbol("n")
size_input = sp.Symbol("m")
m = sp.MatrixSymbol("m", size_state, 1)
P = sp.MatrixSymbol("P", size_state, size_state)
z = sp.MatrixSymbol("z", size_input, 1)
x = sp.MatrixSymbol("x", size_state, 1)
H = sp.MatrixSymbol("H", size_input, size_state)
R = sp.MatrixSymbol("R", size_input, size_input)

prior = -(x - m).T * P.inv() * (x - m)
likelihood = -(z - H * x).T * R.inv() * (z - H * x)
posterior = likelihood + prior
posterior = sp.expand(posterior)
disp(posterior)

#


A = -(P.inv() + H.T * R.inv() * H)
B = P.inv() * m + H.T * R.inv() * z
C = -(m.T * P.inv() * m + z.T * R.inv() * z)

A = sp.MatrixSymbol("A", size_state, size_state)
B = sp.MatrixSymbol("B", size_state, 1)
C = sp.MatrixSymbol("C", 1, 1)

s1 = x.T * A * x + x.T * B + B.T * x + C
s1 = sp.expand(s1)
disp(s1)

s2 = (x + A.inv() * B).T * A * (x + A.inv() * B) - B.T * A.inv() * B + C
s2 = sp.expand(s2)
s2 = sp.simplify(s2)
disp(s2)
