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
    ar = (v_ * (1 - D * c) - v * D * c_) * v * (1 - D * c)
    al = (v_ * (1 + D * c) + v * D * c_) * v * (1 + D * c)
    return ar, al

'''
동적 계획법을 사용하여 문제를 해결할 것이다.
초기 위치와 속도로부터, 가능한 모든 경우의 수를 계산한다.
'''

# (position, velocity)
states = [[(0,0.1)]]

dx = 0.001

while True:
    last_states = states[-1]
    new_states = []
    for state in last_states:
        position, velocity = state
        curvature = get_curvature_by_distance(position)

        