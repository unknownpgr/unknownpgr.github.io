import numpy as np
from matplotlib import pyplot as plt

"""
123,ax:-8000,ay:-110,az:224,gx:-123,gy:127,gz:36
3984,ax:-7994,ay:-174,az:260,gx:-120,gy:121,gz:64

INPUT
COLUMN  UNIT
time    us
ax      16bit, -4g ~ 4g
ay      16bit, -4g ~ 4g
az      16bit, -4g ~ 4g
gx      16bit, -500dps ~ 500dps
gy      16bit, -500dps ~ 500dps
gz      16bit, -500dps ~ 500dps

OUTPUT
COLUMN  UNIT
time    s
ax      m/s^2
ay      m/s^2
az      m/s^2
gx      rad/s
gy      rad/s
gz      rad/s
"""

with open("data.txt", "r") as f:
    data = f.read()

dataset = []
for line in data.split("\n"):
    line = line.strip()
    if not line:
        continue
    tokens = line.split(",")
    time = int(tokens[0])
    values = [int(x.split(":")[1]) for x in tokens[1:]]
    dataset.append([time] + values)

dataset = np.array(dataset, dtype=np.float32)
dataset[:, 0] /= 1e6
dataset[:, 1:4] *= 9.81 * 4 / 32768
dataset[:, 4:] *= 3.141592 / 180 * 500 / 32768

np.save("data.npy", dataset)

# Plot some data

time = dataset[:, 0]
values = dataset[:, 1:]

plt.plot(time, values[:, :3])
plt.savefig("plot-acc.png")
plt.clf()
plt.plot(time, values[:, 3:])
plt.savefig("plot-gyro.png")
