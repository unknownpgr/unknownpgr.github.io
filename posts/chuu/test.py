import json

import cv2
import numpy as np
from sklearn.cluster import KMeans

N = 64

print("Clustering")
img = cv2.imread("input.png")
img = cv2.resize(img, (0, 0), fx=0.5, fy=0.5)

positions = np.indices(img.shape[:2]).transpose(1, 2, 0) / 64
pixel_position_img = np.concatenate([img, positions], axis=2)
pixels = pixel_position_img.reshape(-1, pixel_position_img.shape[2])
kmeans = KMeans(n_clusters=N).fit(pixels)
labels = kmeans.predict(pixels).reshape(img.shape[:2])

empty = np.zeros_like(img)
filtered_contours = []
kernel = np.ones((3, 3), np.uint8)
for i in range(N):
    print(f"Processing cluster {i}")
    mask = labels == i
    mean = np.mean(img[mask], axis=0)
    mask = mask.astype(np.uint8)
    mask = cv2.dilate(mask, kernel, iterations=1)
    contours = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)[0]
    for contour in contours:
        color = tuple(map(int, mean))
        cv2.drawContours(empty, [contour], -1, color, -1)
        contour = np.squeeze(contour, axis=1).tolist()
        filtered_contours.append((contour, color))

cv2.imwrite("output.png", empty)

with open("output.json", "w") as f:
    json.dump(filtered_contours, f)
