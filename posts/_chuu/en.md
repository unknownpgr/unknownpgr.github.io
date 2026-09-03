---
title: A cat walks across the Han River, frozen solid.
tags:
  - etc
date: 2024-07-14T19:27:23.779Z
---

> This post was translated from Korean into English by AI.

I was bored, so I recreated the Han River cat in HTML.

<iframe src="./result.html" style="min-height: 1300px;"></iframe>

After loading the original image, I use K-means clustering to group its pixels into clusters. Clustering based solely on pixel color values would fragment the pixels too much, so I also give their positions a small amount of weight during clustering.

Next, I find the contours of each cluster's mask. Polygons in HTML have to be represented using CSS `clip-path`. However, because the CSS `clip-path` property does not include the boundary itself, gaps appear between clusters when they are rendered. I therefore apply a 1 px dilation before finding the contours to expand them.

I then export the result as JSON and convert it into suitable HTML. During the conversion, I map each cluster to a single `div` and apply `clip-path` to each one. This could be done with string operations, but that would be cumbersome in several ways, so I used React and then copied the element from the developer tools.

Here is the Python code.

```python
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


with open("output.json", "w") as f:
    json.dump(filtered_contours, f)
```

Here is the React code.

```tsx
import _contours from "./output.json";
const contours: Contour[] = _contours as Contour[];

type Vec2 = [number, number];
type Color = [number, number, number];
type Contour = [Vec2[], Color];

export function Chuu() {
  return (
    <div>
      <h1>A cat walks across the Han River, frozen solid.</h1>
      <div
        style={{
          position: "relative",
        }}>
        {contours.map((contour, i) => {
          const contourPoints = contour[0];
          const contourColor = contour[1];

          let left = Infinity;
          let right = -Infinity;
          let top = Infinity;
          let bottom = -Infinity;

          for (const point of contourPoints) {
            left = Math.min(left, point[0]);
            right = Math.max(right, point[0]);
            top = Math.min(top, point[1]);
            bottom = Math.max(bottom, point[1]);
          }

          const width = right - left;
          const height = bottom - top;

          const clipPath = `polygon(${contourPoints
            .map(
              (point) =>
                `${((point[0] - left) * 100) / width}% ${
                  ((point[1] - top) * 100) / height
                }%`
            )
            .join(", ")})`;
          const colorString = `rgb(${contourColor[2]}, ${contourColor[1]}, ${contourColor[0]})`;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${left}px`,
                top: `${top}px`,
                clipPath,
                backgroundColor: colorString,
                width,
                height,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
```
