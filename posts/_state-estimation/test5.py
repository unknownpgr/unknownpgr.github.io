import numpy as np


def sample_prior(n):
    return np.random.uniform([0, -5, -20, 0.001, 0, 0, 0, 0.05, 0.01, 0.1],
                             [2 * np.pi, 5, 20, 0.1, 5, 2, 2, 0.2, 0.1, 0.3], (n, 10))


large_2d_array = sample_prior(100)
for i in range(10000):
    large_2d_array += np.ones((100, 10), dtype=np.float32) / 1000
print(large_2d_array.shape)
