import time

import sympy as sp

start_time = time.time()
last_time = start_time


def log(message):
    global last_time
    elapsed_time = time.time() - last_time
    last_time = time.time()
    print(f"[{last_time - start_time:.2f}s (+{elapsed_time:.2f}s)] {message}\n", flush=True)


print("Starting...")

# Define the time variable
t = sp.symbols("t")

# Define the euler angles
phi = sp.Function("phi")(t)
theta = sp.Function("theta")(t)
psi = sp.Function("psi")(t)


def substitute_variable(expr, q, q_name):
    dot_dot_q = sp.symbols(f"{q_name}_ddot")
    dot_q = sp.symbols(f"{q_name}_dot")
    expr = expr.subs(q.diff(t, t), dot_dot_q)
    expr = expr.subs(q.diff(t), dot_q)
    expr = expr.subs(q, q_name)
    return expr


def substitute_all_variables(expr):
    expr = substitute_variable(expr, phi, "phi")
    expr = substitute_variable(expr, theta, "theta")
    expr = substitute_variable(expr, psi, "psi")
    expr = simplify(expr)
    return expr


# Define the rotation matrix of
R_x = sp.Matrix([[1, 0, 0], [0, sp.cos(phi), -sp.sin(phi)], [0, sp.sin(phi), sp.cos(phi)]])
R_y = sp.Matrix([[sp.cos(theta), 0, sp.sin(theta)], [0, 1, 0], [-sp.sin(theta), 0, sp.cos(theta)]])
R_z = sp.Matrix([[sp.cos(psi), -sp.sin(psi), 0], [sp.sin(psi), sp.cos(psi), 0], [0, 0, 1]])

# Define the rotation matrix
R = R_z * R_y * R_x

# Define the position of the point in the body frame
dx = sp.symbols("dx")
dy = sp.symbols("dy")
dz = sp.symbols("dz")
rs = [
    sp.Matrix([dx, 0, 0]),
    sp.Matrix([0, dy, 0]),
    sp.Matrix([0, 0, dz]),
    sp.Matrix([-dx, 0, 0]),
    sp.Matrix([0, -dy, 0]),
    sp.Matrix([0, 0, -dz]),
]


def simplify(expr):
    return sp.simplify(expr, deep=True, force=True, measure=lambda x: x.count_ops())


# Define the actual position of the points
r_world = [simplify(R * r) for r in rs]

# Define the velocity of the points
v_world = [simplify(sp.diff(r, t)) for r in r_world]

# Define the total kinetic energy
E_k = 0
m = sp.symbols("m")
for v in v_world:
    E_k += (m / 6) * v.dot(v) / 2
E_k = simplify(E_k)
log("Kinetic energy expression calculated.")
print(substitute_all_variables(E_k))


def euler_lagrange(e, q):
    # Derivate the expression by dq / dt
    e_q = sp.diff(e, q.diff(t))
    e_q = simplify(e_q)
    log(f"Derivative of {q} calculated.")

    # Derivate the expression by t
    e_q = sp.diff(e_q, t)
    e_q = sp.Eq(e_q, 0)
    e_q = simplify(e_q)
    log(f"Derivative of time calculated.")

    return e_q


system_eq = [euler_lagrange(E_k, q) for q in [phi, theta, psi]]
log("System of equations calculated.")

# Solve the system of equations
solution = sp.solve(system_eq, [phi.diff(t, t), theta.diff(t, t), psi.diff(t, t)])

# Print the solution
for key, value in solution.items():
    log(f"{key} = {value}")

# Print the simplified solution
for key, value in solution.items():
    log(f"Simplified solution for {key}:")
    print(simplify(value))
    print("\n")


# Substitute the variables
substituted_solution = {}
for key, value in solution.items():
    key = substitute_all_variables(key)
    value = substitute_all_variables(value)
    substituted_solution[key] = value


# Print the substituted solution
for key, value in substituted_solution.items():
    log(f"Substituted solution for {key}:")
    print(value)
    print("\n")


log("Done.")
