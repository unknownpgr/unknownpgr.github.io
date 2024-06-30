import time
import numpy as np

"""
Value units:
- time  : s
- theta : rad
- w     : rad/s
- a     : rad/s^2
- a_x   : m/s^2
- a_y   .lll: m/s^2

State space model:

# State Space Model

## Time-varying states
0 : theta   : 0   ~ 2pi (rad)
1 : w       : -5  ~ +5  (rad/s)
2 : a       : -10 ~ +10 (rad/s^2)

## Constant states
3 : sigma_a : 0     ~ 10
4 : sigma_s : 0     ~ 2
5 : sigma_o : 0     ~ 2
6 : l       : 0.01  ~ 0.1 (m)
7 : scale_a : 0.9   ~ 1.1
8 : scale_w : 0.9   ~ 1.1

# System Model
- theta = theta + w * dt + sigma_s * N(0, 1)
- w = w + a * dt + sigma_s * N(0, 1)
- a = a + sigma_a * N(0, 1)


# Observation Model
- a_x = ( -l * w ^ 2 + g * sin(theta) + sigma_o * N(0, 1) ) * scale_a
- a_y = (  l * a     - g * cos(theta) + sigma_o * N(0, 1) ) * scale_a
- w   = ( w + sigma_o * N(0, 1)                           ) * scale_w
"""


def N():
    return np.random.normal(0, 1)


def Ns(n):
    return np.random.normal(0, 1, n)


def system(states, dt):
    n = len(states)

    theta, w, a = states[:, 0], states[:, 1], states[:, 2]
    sigma_a, sigma_s = states[:, 3], states[:, 4]

    # Update states
    states[:, 0] = theta + w * dt + sigma_s * Ns(n)  #  theta
    states[:, 1] = w + a * dt + sigma_s * Ns(n)  #      w
    states[:, 2] = a + sigma_a * Ns(n)  #               a

    # Diffuse static state slightly
    states[:, 3] += Ns(n) * 0.01
    states[:, 4] += Ns(n) * 0.01
    states[:, 5] += Ns(n) * 0.01
    states[:, 6] += Ns(n) * 0.0001
    states[:, 7] += Ns(n) * 0.0001
    states[:, 8] += Ns(n) * 0.0001

    # Wrap theta
    states[:, 0] %= 2 * np.pi

    # Clip values
    # states[:, 3] = np.clip(states[:, 3], 0, 10)
    # states[:, 4] = np.clip(states[:, 4], 0, 2)
    # states[:, 5] = np.clip(states[:, 5], 0, 2)
    # states[:, 6] = np.clip(states[:, 6], 0.01, 0.1)
    # states[:, 7] = np.clip(states[:, 7], 0.9, 1.1)
    # states[:, 8] = np.clip(states[:, 8], 0.9, 1.1)


def observe(states):
    theta, w, a = states[:, 0], states[:, 1], states[:, 2]
    l, scale_a, scale_w, sigma_o = states[:, 6], states[:, 7], states[:, 8], states[:, 5]
    g = 9.8
    a_x = (-l * w**2 + g * np.sin(theta) + sigma_o * Ns(len(states))) * scale_a
    a_y = (l * a - g * np.cos(theta) + sigma_o * Ns(len(states))) * scale_a
    w = (w + sigma_o * Ns(len(states))) * scale_w
    return np.stack([a_x, a_y, w], axis=1)


def likelihood(observation, predictions):
    return np.exp(-np.sum((observation - predictions) ** 2, axis=1) / 2)


def sample_prior(n):
    return np.random.uniform(
        low=[0, -5, -10, 0, 0, 0, 0.01, 0.9, 0.9], high=[2 * np.pi, 5, 10, 10, 2, 2, 0.1, 1.1, 1.1], size=(n, 9)
    )


def effective_sample_size(weights):
    return 1 / np.sum(weights**2)


def resample(particles, weights):
    n = weights.shape[0]
    resample = np.random.choice(a=n, size=n, replace=True, p=weights)
    return particles[resample], np.ones(n) / n


def print_state(state):
    print("Theta:", state[0] % (2 * np.pi))
    print("W:", state[1])
    print("A:", state[2])
    print("Sigma_a:", state[3])
    print("Sigma_s:", state[4])
    print("Sigma_o:", state[5])
    print("L:", state[6])
    print("Scale_a:", state[7])
    print("Scale_w:", state[8])


def particle_filter(prior, data):
    n = prior.shape[0]
    particles = prior
    weights = np.ones(n) / n
    observations = np.zeros((n, 3))
    try:
        # Iterate over data
        for i in range(data.shape[0]):
            print(f"Processing {i}/{data.shape[0]}")
            system(particles, data[i, 0])
            observations = observe(particles)
            weights *= likelihood(data[i, 1:], observations)
            weights /= np.sum(weights)
            if effective_sample_size(weights) < n / 2:
                particles, weights = resample(particles, weights)
                print_state(particles[np.argmax(weights)])
    except KeyboardInterrupt:
        pass
    return particles[np.argmax(weights)]


data = np.load("data.npy")
# Select timestamp, ax, az, wy
data = data[:, [0, 1, 3, 5]]

# Plot some data
time = data[:, 0]
ax = data[:, 1]
az = data[:, 2]
wy = data[:, 3]
from matplotlib import pyplot as plt

plt.plot(time, ax)
plt.plot(time, az)
plt.plot(time, wy)
plt.savefig("plot-data.png")
plt.clf()
exit(0)

# Calculate dt from timestamp
data[:, 0] = np.concatenate([[0], np.diff(data[:, 0])])

prior = sample_prior(10000)
state = particle_filter(prior, data)
