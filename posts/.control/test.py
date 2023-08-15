import math
from matplotlib import pyplot as plt

# Unit: Meter, Second, Radian

D = 0.1


def get_curvature_by_distance(distance):
    return math.sin(distance)


def get_torque_by_velocity(velocity):
    HOLD_TORQUE = 10
    DECIBEL_PER_ROTATION = 10
    return HOLD_TORQUE * math.exp(-abs(velocity) * 2.3025 / DECIBEL_PER_ROTATION)


def get_wheel_acceleration(v, v_, c, c_):
    ar = (v_ * (1 - D * c) - v * D * c_) * v *(1 - D * c)
    al = (v_ * (1 + D * c) + v * D * c_) * v * (1 + D * c)
    return ar, al

dt = 0.001
t = 0
a = 0.5
v = 0.01
x = 0

t_list = []
c_list = []
a_list = []
v_list = []
x_list = []

ar_list = []
al_list = []

ar_max_list = []
al_max_list = []

while t < 20:
    c = get_curvature_by_distance(x)

    t_list.append(t)
    a_list.append(a)
    v_list.append(v)
    x_list.append(x)
    c_list.append(c)

    dx = v * dt

    c_next = get_curvature_by_distance(x + dx)
    c_ = (c_next - c) / dx

    ar, al = get_wheel_acceleration(v, v * a, c, c_)

    ar_list.append(ar)
    al_list.append(al)

    ar_max_list.append(get_torque_by_velocity(v * (1 - D * c)))
    al_max_list.append(get_torque_by_velocity(v * (1 + D * c)))

    v += a * dt
    x += dx
    t += dt

plt.plot(t_list, c_list, label='c')
plt.plot(t_list, ar_list, label='ar')
plt.plot(t_list, al_list, label='al')
plt.plot(t_list, ar_max_list, label='ar_max')
plt.plot(t_list, al_max_list, label='al_max')
plt.legend()
plt.savefig('test.png')