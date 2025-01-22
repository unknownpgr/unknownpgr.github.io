import os

import cv2
import matplotlib.pyplot as plt
import numpy as np
import sympy as sp

# System parameters
dx = 1
dy = 4
dz = 2

# Initial conditions
phi = 0  # x axis
theta = 0  # y axis
psi = 0  # z axis
phi_dot = 0.01234567
theta_dot = 0.02345678
psi_dot = 2

# Simulation parameters
dt = 0.00001
T = 10
fps = 30

cos = np.cos
sin = np.sin
tan = np.tan


def ddot_phi(phi, theta, psi, phi_dot, theta_dot, psi_dot):
    return (
        -(dx**4) * psi_dot * theta_dot * cos(theta)
        + 2 * dx**4 * psi_dot * theta_dot / cos(theta)
        + 2 * dx**2 * dy**2 * phi_dot * psi_dot *
        sin(phi) * sin(theta) * cos(phi)
        - 2 * dx**2 * dy**2 * phi_dot * theta_dot * sin(phi) ** 2 * tan(theta)
        + 2 * dx**2 * dy**2 * phi_dot * theta_dot * tan(theta)
        + dx**2 * dy**2 * psi_dot * theta_dot / cos(theta)
        + dx**2 * dy**2 * theta_dot**2 * sin(phi) * cos(phi)
        - dx**2 * dy**2 * theta_dot**2 * sin(phi) * cos(phi) / cos(theta) ** 2
        - 2 * dx**2 * dz**2 * phi_dot * psi_dot *
        sin(phi) * sin(theta) * cos(phi)
        + 2 * dx**2 * dz**2 * phi_dot * theta_dot * sin(phi) ** 2 * tan(theta)
        + dx**2 * dz**2 * psi_dot * theta_dot / cos(theta)
        - dx**2 * dz**2 * theta_dot**2 * sin(phi) * cos(phi)
        + dx**2 * dz**2 * theta_dot**2 * sin(phi) * cos(phi) / cos(theta) ** 2
        + 2 * dy**4 * phi_dot * psi_dot * sin(phi) ** 3 * sin(theta) * cos(phi)
        - dy**4 * phi_dot * psi_dot *
        sin(phi) ** 3 * sin(theta) * cos(phi) / (2 * cos(theta) ** 2)
        - dy**4 * phi_dot * psi_dot *
        sin(phi) ** 3 * sin(3 * theta) * cos(phi) / (2 * cos(theta) ** 2)
        + dy**4 * phi_dot * psi_dot *
        sin(phi) * sin(theta) * cos(phi) / (4 * cos(theta) ** 2)
        + dy**4 * phi_dot * psi_dot *
        sin(phi) * sin(3 * theta) * cos(phi) / (4 * cos(theta) ** 2)
        + 2 * dy**4 * psi_dot * theta_dot * sin(phi) ** 4 * cos(theta)
        - 7 * dy**4 * psi_dot * theta_dot * sin(phi) ** 4 / (4 * cos(theta))
        - dy**4 * psi_dot * theta_dot *
        sin(phi) ** 4 * cos(3 * theta) / (4 * cos(theta) ** 2)
        - dy**4 * psi_dot * theta_dot * sin(phi) ** 2 * cos(theta)
        + 3 * dy**4 * psi_dot * theta_dot * sin(phi) ** 2 / (4 * cos(theta))
        + dy**4 * psi_dot * theta_dot *
        sin(phi) ** 2 * cos(3 * theta) / (4 * cos(theta) ** 2)
        + dy**4 * psi_dot * theta_dot * cos(theta) / 8
        - 3 * dy**4 * psi_dot * theta_dot / (32 * cos(theta))
        - dy**4 * psi_dot * theta_dot * cos(3 * theta) / (32 * cos(theta) ** 2)
        + dy**4 * theta_dot**2 * sin(phi) ** 3 * cos(phi)
        - dy**4 * theta_dot**2 * sin(phi) ** 3 * cos(phi) / cos(theta) ** 2
        - 2 * dy**2 * dz**2 * phi_dot * psi_dot *
        sin(phi) ** 3 * sin(theta) * cos(phi)
        + dy**2 * dz**2 * phi_dot * psi_dot *
        sin(phi) ** 3 * sin(theta) * cos(phi) / (2 * cos(theta) ** 2)
        + dy**2 * dz**2 * phi_dot * psi_dot *
        sin(phi) ** 3 * sin(3 * theta) * cos(phi) / (2 * cos(theta) ** 2)
        + dy**2 * dz**2 * phi_dot * psi_dot * sin(phi) * sin(theta) * cos(phi)
        - dy**2 * dz**2 * phi_dot * psi_dot *
        sin(phi) * sin(theta) * cos(phi) / (4 * cos(theta) ** 2)
        - dy**2 * dz**2 * phi_dot * psi_dot *
        sin(phi) * sin(3 * theta) * cos(phi) / (4 * cos(theta) ** 2)
        + 2 * dy**2 * dz**2 * phi_dot * theta_dot * tan(theta)
        - 4 * dy**2 * dz**2 * psi_dot * theta_dot * sin(phi) ** 4 * cos(theta)
        + 7 * dy**2 * dz**2 * psi_dot * theta_dot *
        sin(phi) ** 4 / (2 * cos(theta))
        + dy**2 * dz**2 * psi_dot * theta_dot *
        sin(phi) ** 4 * cos(3 * theta) / (2 * cos(theta) ** 2)
        + 4 * dy**2 * dz**2 * psi_dot * theta_dot * sin(phi) ** 2 * cos(theta)
        - 7 * dy**2 * dz**2 * psi_dot * theta_dot *
        sin(phi) ** 2 / (2 * cos(theta))
        - dy**2 * dz**2 * psi_dot * theta_dot *
        sin(phi) ** 2 * cos(3 * theta) / (2 * cos(theta) ** 2)
        - dy**2 * dz**2 * psi_dot * theta_dot * cos(theta) / 4
        + 19 * dy**2 * dz**2 * psi_dot * theta_dot / (16 * cos(theta))
        + dy**2 * dz**2 * psi_dot * theta_dot *
        cos(3 * theta) / (16 * cos(theta) ** 2)
        - 2 * dy**2 * dz**2 * theta_dot**2 * sin(phi) ** 3 * cos(phi)
        + 2 * dy**2 * dz**2 * theta_dot**2 *
        sin(phi) ** 3 * cos(phi) / cos(theta) ** 2
        + dy**2 * dz**2 * theta_dot**2 * sin(phi) * cos(phi)
        - dy**2 * dz**2 * theta_dot**2 * sin(phi) * cos(phi) / cos(theta) ** 2
        - dz**4 * phi_dot * psi_dot * sin(phi) * sin(theta) * cos(phi)
        + 2 * dz**4 * psi_dot * theta_dot * sin(phi) ** 4 * cos(theta)
        - 7 * dz**4 * psi_dot * theta_dot * sin(phi) ** 4 / (4 * cos(theta))
        - dz**4 * psi_dot * theta_dot *
        sin(phi) ** 4 * cos(3 * theta) / (4 * cos(theta) ** 2)
        - 3 * dz**4 * psi_dot * theta_dot * sin(phi) ** 2 * cos(theta)
        + 11 * dz**4 * psi_dot * theta_dot * sin(phi) ** 2 / (4 * cos(theta))
        + dz**4 * psi_dot * theta_dot *
        sin(phi) ** 2 * cos(3 * theta) / (4 * cos(theta) ** 2)
        + 9 * dz**4 * psi_dot * theta_dot * cos(theta) / 8
        - 35 * dz**4 * psi_dot * theta_dot / (32 * cos(theta))
        - dz**4 * psi_dot * theta_dot * cos(3 * theta) / (32 * cos(theta) ** 2)
        + dz**4 * theta_dot**2 * sin(phi) ** 3 * cos(phi)
        - dz**4 * theta_dot**2 * sin(phi) ** 3 * cos(phi) / cos(theta) ** 2
        - dz**4 * theta_dot**2 * sin(phi) * cos(phi)
        + dz**4 * theta_dot**2 * sin(phi) * cos(phi) / cos(theta) ** 2
    ) / (dx**4 + dx**2 * dy**2 + dx**2 * dz**2 + dy**2 * dz**2)


def ddot_theta(phi, theta, psi, phi_dot, theta_dot, psi_dot):
    return (
        2 * dx**2 * dy**2 * phi_dot * psi_dot * cos(2 * phi - 3 * theta)
        + 6 * dx**2 * dy**2 * phi_dot * psi_dot * cos(2 * phi - theta)
        + 6 * dx**2 * dy**2 * phi_dot * psi_dot * cos(2 * phi + theta)
        + 2 * dx**2 * dy**2 * phi_dot * psi_dot * cos(2 * phi + 3 * theta)
        - 8 * dx**2 * dy**2 * phi_dot * theta_dot * sin(2 * phi)
        - 4 * dx**2 * dy**2 * phi_dot * theta_dot * sin(2 * phi - 2 * theta)
        - 4 * dx**2 * dy**2 * phi_dot * theta_dot * sin(2 * phi + 2 * theta)
        + dx**2 * dy**2 * psi_dot * theta_dot * cos(2 * phi - 3 * theta)
        + dx**2 * dy**2 * psi_dot * theta_dot * cos(2 * phi - theta)
        - dx**2 * dy**2 * psi_dot * theta_dot * cos(2 * phi + theta)
        - dx**2 * dy**2 * psi_dot * theta_dot * cos(2 * phi + 3 * theta)
        - 2 * dx**2 * dz**2 * phi_dot * psi_dot * cos(2 * phi - 3 * theta)
        - 6 * dx**2 * dz**2 * phi_dot * psi_dot * cos(2 * phi - theta)
        - 6 * dx**2 * dz**2 * phi_dot * psi_dot * cos(2 * phi + theta)
        - 2 * dx**2 * dz**2 * phi_dot * psi_dot * cos(2 * phi + 3 * theta)
        + 8 * dx**2 * dz**2 * phi_dot * theta_dot * sin(2 * phi)
        + 4 * dx**2 * dz**2 * phi_dot * theta_dot * sin(2 * phi - 2 * theta)
        + 4 * dx**2 * dz**2 * phi_dot * theta_dot * sin(2 * phi + 2 * theta)
        - dx**2 * dz**2 * psi_dot * theta_dot * cos(2 * phi - 3 * theta)
        - dx**2 * dz**2 * psi_dot * theta_dot * cos(2 * phi - theta)
        + dx**2 * dz**2 * psi_dot * theta_dot * cos(2 * phi + theta)
        + dx**2 * dz**2 * psi_dot * theta_dot * cos(2 * phi + 3 * theta)
        + 6 * dy**4 * phi_dot * psi_dot * (cos(2 * phi) - 1) ** 2 * cos(theta)
        + 2 * dy**4 * phi_dot * psi_dot *
        (cos(2 * phi) - 1) ** 2 * cos(3 * theta)
        - 3 * dy**4 * phi_dot * psi_dot * cos(theta)
        - dy**4 * phi_dot * psi_dot * cos(3 * theta)
        + 3 * dy**4 * phi_dot * psi_dot * cos(2 * phi - 3 * theta)
        + 9 * dy**4 * phi_dot * psi_dot * cos(2 * phi - theta)
        + 9 * dy**4 * phi_dot * psi_dot * cos(2 * phi + theta)
        + 3 * dy**4 * phi_dot * psi_dot * cos(2 * phi + 3 * theta)
        - dy**4 * phi_dot * psi_dot * cos(4 * phi - 3 * theta) / 2
        - 3 * dy**4 * phi_dot * psi_dot * cos(4 * phi - theta) / 2
        - 3 * dy**4 * phi_dot * psi_dot * cos(4 * phi + theta) / 2
        - dy**4 * phi_dot * psi_dot * cos(4 * phi + 3 * theta) / 2
        - dy**4 * psi_dot * theta_dot * cos(2 * phi - 3 * theta) / 2
        - dy**4 * psi_dot * theta_dot * cos(2 * phi - theta) / 2
        + dy**4 * psi_dot * theta_dot * cos(2 * phi + theta) / 2
        + dy**4 * psi_dot * theta_dot * cos(2 * phi + 3 * theta) / 2
        + dy**4 * psi_dot * theta_dot * cos(4 * phi - 3 * theta) / 4
        + dy**4 * psi_dot * theta_dot * cos(4 * phi - theta) / 4
        - dy**4 * psi_dot * theta_dot * cos(4 * phi + theta) / 4
        - dy**4 * psi_dot * theta_dot * cos(4 * phi + 3 * theta) / 4
        + 2 * dy**4 * theta_dot**2 * (cos(2 * phi) - 1) ** 2 * sin(2 * theta)
        - 4 * dy**4 * theta_dot**2 * sin(2 * theta)
        - 2 * dy**4 * theta_dot**2 * sin(2 * phi - 2 * theta)
        + 2 * dy**4 * theta_dot**2 * sin(2 * phi + 2 * theta)
        - 12 * dy**2 * dz**2 * phi_dot * psi_dot *
        (cos(2 * phi) - 1) ** 2 * cos(theta)
        - 4 * dy**2 * dz**2 * phi_dot * psi_dot *
        (cos(2 * phi) - 1) ** 2 * cos(3 * theta)
        + 6 * dy**2 * dz**2 * phi_dot * psi_dot * cos(theta)
        + 2 * dy**2 * dz**2 * phi_dot * psi_dot * cos(3 * theta)
        - 4 * dy**2 * dz**2 * phi_dot * psi_dot * cos(2 * phi - 3 * theta)
        - 12 * dy**2 * dz**2 * phi_dot * psi_dot * cos(2 * phi - theta)
        - 12 * dy**2 * dz**2 * phi_dot * psi_dot * cos(2 * phi + theta)
        - 4 * dy**2 * dz**2 * phi_dot * psi_dot * cos(2 * phi + 3 * theta)
        + dy**2 * dz**2 * phi_dot * psi_dot * cos(4 * phi - 3 * theta)
        + 3 * dy**2 * dz**2 * phi_dot * psi_dot * cos(4 * phi - theta)
        + 3 * dy**2 * dz**2 * phi_dot * psi_dot * cos(4 * phi + theta)
        + dy**2 * dz**2 * phi_dot * psi_dot * cos(4 * phi + 3 * theta)
        - dy**2 * dz**2 * psi_dot * theta_dot * cos(4 * phi - 3 * theta) / 2
        - dy**2 * dz**2 * psi_dot * theta_dot * cos(4 * phi - theta) / 2
        + dy**2 * dz**2 * psi_dot * theta_dot * cos(4 * phi + theta) / 2
        + dy**2 * dz**2 * psi_dot * theta_dot * cos(4 * phi + 3 * theta) / 2
        - 4 * dy**2 * dz**2 * theta_dot**2 *
        (cos(2 * phi) - 1) ** 2 * sin(2 * theta)
        + 8 * dy**2 * dz**2 * theta_dot**2 * sin(2 * theta)
        + 4 * dy**2 * dz**2 * theta_dot**2 * sin(2 * phi - 2 * theta)
        - 4 * dy**2 * dz**2 * theta_dot**2 * sin(2 * phi + 2 * theta)
        + 6 * dz**4 * phi_dot * psi_dot * (cos(2 * phi) - 1) ** 2 * cos(theta)
        + 2 * dz**4 * phi_dot * psi_dot *
        (cos(2 * phi) - 1) ** 2 * cos(3 * theta)
        - 3 * dz**4 * phi_dot * psi_dot * cos(theta)
        - dz**4 * phi_dot * psi_dot * cos(3 * theta)
        + dz**4 * phi_dot * psi_dot * cos(2 * phi - 3 * theta)
        + 3 * dz**4 * phi_dot * psi_dot * cos(2 * phi - theta)
        + 3 * dz**4 * phi_dot * psi_dot * cos(2 * phi + theta)
        + dz**4 * phi_dot * psi_dot * cos(2 * phi + 3 * theta)
        - dz**4 * phi_dot * psi_dot * cos(4 * phi - 3 * theta) / 2
        - 3 * dz**4 * phi_dot * psi_dot * cos(4 * phi - theta) / 2
        - 3 * dz**4 * phi_dot * psi_dot * cos(4 * phi + theta) / 2
        - dz**4 * phi_dot * psi_dot * cos(4 * phi + 3 * theta) / 2
        + dz**4 * psi_dot * theta_dot * cos(2 * phi - 3 * theta) / 2
        + dz**4 * psi_dot * theta_dot * cos(2 * phi - theta) / 2
        - dz**4 * psi_dot * theta_dot * cos(2 * phi + theta) / 2
        - dz**4 * psi_dot * theta_dot * cos(2 * phi + 3 * theta) / 2
        + dz**4 * psi_dot * theta_dot * cos(4 * phi - 3 * theta) / 4
        + dz**4 * psi_dot * theta_dot * cos(4 * phi - theta) / 4
        - dz**4 * psi_dot * theta_dot * cos(4 * phi + theta) / 4
        - dz**4 * psi_dot * theta_dot * cos(4 * phi + 3 * theta) / 4
        + 2 * dz**4 * theta_dot**2 * (cos(2 * phi) - 1) ** 2 * sin(2 * theta)
        - 4 * dz**4 * theta_dot**2 * sin(2 * theta)
        - 2 * dz**4 * theta_dot**2 * sin(2 * phi - 2 * theta)
        + 2 * dz**4 * theta_dot**2 * sin(2 * phi + 2 * theta)
    ) / (16 * (dx**4 + dx**2 * dy**2 + dx**2 * dz**2 + dy**2 * dz**2) * cos(theta) ** 2)


def ddot_psi(phi, theta, psi, phi_dot, theta_dot, psi_dot):
    return (
        2 * dx**4 * psi_dot * theta_dot * sin(2 * theta)
        + dx**2 * dy**2 * phi_dot * psi_dot * sin(2 * phi)
        + dx**2 * dy**2 * phi_dot * psi_dot * sin(2 * phi - 2 * theta) / 2
        + dx**2 * dy**2 * phi_dot * psi_dot * sin(2 * phi + 2 * theta) / 2
        + 2 * dx**2 * dy**2 * phi_dot * theta_dot * cos(theta)
        + dx**2 * dy**2 * phi_dot * theta_dot * cos(2 * phi - theta)
        + dx**2 * dy**2 * phi_dot * theta_dot * cos(2 * phi + theta)
        + dx**2 * dy**2 * psi_dot * theta_dot * sin(2 * theta)
        - dx**2 * dy**2 * theta_dot**2 * cos(2 * phi - theta) / 2
        + dx**2 * dy**2 * theta_dot**2 * cos(2 * phi + theta) / 2
        - dx**2 * dz**2 * phi_dot * psi_dot * sin(2 * phi)
        - dx**2 * dz**2 * phi_dot * psi_dot * sin(2 * phi - 2 * theta) / 2
        - dx**2 * dz**2 * phi_dot * psi_dot * sin(2 * phi + 2 * theta) / 2
        + 2 * dx**2 * dz**2 * phi_dot * theta_dot * cos(theta)
        - dx**2 * dz**2 * phi_dot * theta_dot * cos(2 * phi - theta)
        - dx**2 * dz**2 * phi_dot * theta_dot * cos(2 * phi + theta)
        + dx**2 * dz**2 * psi_dot * theta_dot * sin(2 * theta)
        + dx**2 * dz**2 * theta_dot**2 * cos(2 * phi - theta) / 2
        - dx**2 * dz**2 * theta_dot**2 * cos(2 * phi + theta) / 2
        + dy**4 * phi_dot * psi_dot * sin(2 * phi) / 2
        + dy**4 * phi_dot * psi_dot * sin(2 * phi - 2 * theta) / 4
        + dy**4 * phi_dot * psi_dot * sin(2 * phi + 2 * theta) / 4
        - dy**4 * psi_dot * theta_dot *
        (1 - cos(2 * phi)) ** 2 * sin(2 * theta) / 4
        - dy**4 * theta_dot**2 * cos(2 * phi - theta) / 4
        + dy**4 * theta_dot**2 * cos(2 * phi + theta) / 4
        + dy**4 * theta_dot**2 * cos(4 * phi - theta) / 8
        - dy**4 * theta_dot**2 * cos(4 * phi + theta) / 8
        + 4 * dy**2 * dz**2 * phi_dot * theta_dot * cos(theta)
        + dy**2 * dz**2 * psi_dot * theta_dot *
        (1 - cos(2 * phi)) ** 2 * sin(2 * theta) / 2
        - dy**2 * dz**2 * psi_dot * theta_dot * sin(2 * phi - 2 * theta) / 2
        + dy**2 * dz**2 * psi_dot * theta_dot * sin(2 * phi + 2 * theta) / 2
        - dy**2 * dz**2 * theta_dot**2 * cos(4 * phi - theta) / 4
        + dy**2 * dz**2 * theta_dot**2 * cos(4 * phi + theta) / 4
        - dz**4 * phi_dot * psi_dot * sin(2 * phi) / 2
        - dz**4 * phi_dot * psi_dot * sin(2 * phi - 2 * theta) / 4
        - dz**4 * phi_dot * psi_dot * sin(2 * phi + 2 * theta) / 4
        - dz**4 * psi_dot * theta_dot *
        (1 - cos(2 * phi)) ** 2 * sin(2 * theta) / 4
        + dz**4 * psi_dot * theta_dot * sin(2 * phi - 2 * theta) / 2
        - dz**4 * psi_dot * theta_dot * sin(2 * phi + 2 * theta) / 2
        + dz**4 * theta_dot**2 * cos(2 * phi - theta) / 4
        - dz**4 * theta_dot**2 * cos(2 * phi + theta) / 4
        + dz**4 * theta_dot**2 * cos(4 * phi - theta) / 8
        - dz**4 * theta_dot**2 * cos(4 * phi + theta) / 8
    ) / ((cos(2 * theta) + 1) * (dx**4 + dx**2 * dy**2 + dx**2 * dz**2 + dy**2 * dz**2))


def energy(phi, theta, psi, phi_dot, theta_dot, psi_dot):
    return (
        dx**2 * (psi_dot**2 * cos(theta) ** 2 + theta_dot**2)
        + dy**2
        * (
            phi_dot**2
            - 2 * phi_dot * psi_dot * sin(theta)
            + psi_dot**2 * sin(phi) ** 2 * sin(theta) ** 2
            - psi_dot**2 * sin(phi) ** 2
            + psi_dot**2
            - psi_dot * theta_dot *
                (sin(2 * phi - theta) + sin(2 * phi + theta)) / 2
            + theta_dot**2 * sin(phi) ** 2
        )
        + dz**2
        * (
            phi_dot**2
            - 2 * phi_dot * psi_dot * sin(theta)
            - psi_dot**2 * cos(phi) ** 2 * cos(theta) ** 2
            + psi_dot**2
            + psi_dot * theta_dot *
            (sin(2 * phi - theta) + sin(2 * phi + theta)) / 2
            + theta_dot**2 * cos(phi) ** 2
        )
    ) / 6


def euler_to_rotation_matrix(phi, theta, psi):
    return np.array(
        [
            [
                np.cos(psi) * np.cos(theta),
                np.cos(psi) * np.sin(theta) * np.sin(phi) -
                np.sin(psi) * np.cos(phi),
                np.cos(psi) * np.sin(theta) * np.cos(phi) +
                np.sin(psi) * np.sin(phi),
            ],
            [
                np.sin(psi) * np.cos(theta),
                np.sin(psi) * np.sin(theta) * np.sin(phi) +
                np.cos(psi) * np.cos(phi),
                np.sin(psi) * np.sin(theta) * np.cos(phi) -
                np.cos(psi) * np.sin(phi),
            ],
            [-np.sin(theta), np.cos(theta) * np.sin(phi),
             np.cos(theta) * np.cos(phi)],
        ]
    )


n = int(T / dt)
skip = int(1 / (fps * dt))
i = 0


def update():
    global phi, theta, psi, phi_dot, theta_dot, psi_dot, i

    phi += phi_dot * dt
    theta += theta_dot * dt
    psi += psi_dot * dt

    phi_dot += ddot_phi(phi, theta, psi, phi_dot, theta_dot, psi_dot) * dt
    theta_dot += ddot_theta(phi, theta, psi, phi_dot, theta_dot, psi_dot) * dt
    psi_dot += ddot_psi(phi, theta, psi, phi_dot, theta_dot, psi_dot) * dt

    i += 1

    if i % skip != 0:
        return

    print(
        (
            f"T: {i * dt: 2.2f}, "
            f"phi: {phi: 2.2f}, "
            f"theta: {theta: 2.2f}, "
            f"psi: {psi: 2.2f}, "
            f"phi_dot: {phi_dot: 2.2f}, "
            f"theta_dot: {theta_dot: 2.2f}, "
            f"psi_dot: {psi_dot: 2.2f}, "
            f"energy: {energy(phi, theta, psi, phi_dot, theta_dot, psi_dot): 2.2f}"
        ),
    )

    R = euler_to_rotation_matrix(phi, theta, psi)

    # Plot the rotation axis
    fig = plt.figure()
    ax = fig.add_subplot(111, projection="3d")
    ax.quiver(0, 0, 0, R[0, 0], R[1, 0], R[2, 0], color="r")
    ax.quiver(0, 0, 0, R[0, 1], R[1, 1], R[2, 1], color="g")
    ax.quiver(0, 0, 0, R[0, 2], R[1, 2], R[2, 2], color="b")
    ax.set_xlim([-1, 1])
    ax.set_ylim([-1, 1])
    ax.set_zlim([-1, 1])
    plt.savefig(f"/tmp/rot_file_{i:08d}.png")
    plt.close(fig)


try:
    for _ in range(n):
        update()
except KeyboardInterrupt:
    pass
print()

# Create the animation
plot_files = os.listdir("/tmp")
plot_files = [f for f in plot_files if f.startswith("rot_file_")]
plot_files.sort()

video = cv2.VideoWriter(
    "rot.mp4", cv2.VideoWriter_fourcc(*"mp4v"), fps, (640, 480))

for file in plot_files:
    img = cv2.imread(f"/tmp/{file}")
    print(f"\r{file}", end="")
    video.write(img)
    os.remove(f"/tmp/{file}")

print()

video.release()
