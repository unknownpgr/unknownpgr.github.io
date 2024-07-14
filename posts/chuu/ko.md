---
title: 꽁꽁 얼어붙은 한강 위로 고양이가 걸어다닙니다.
tags:
  - etc
date: 2024-07-14T19:27:23.779Z
---

심심해서 HTML로 한강 고양이를 만들어봤습니다.

<iframe src="./result.html" style="min-height: 1300px;"></iframe>

원본 사진을 가져온 후 K-means clustering을 사용하여 픽셀을 클러스터링합니다. 이때 단순히 픽셀의 색상값만을 가지고 클러스터링을 하게 되면 픽셀이 과도하게 파편화가 되므로 픽셀의 위치를 약간 가중치로 주어 클러스터링합니다.

이후 각 클러스터의 마스크에 대해 contour를 구합니다. 이때 HTML에서 다각형을 표현하기 위해서는 CSS의 `clip-path`를 사용해야 하는데, 이때 css의 `clip-path` 속성은 경계를 포함하지 않으므로 렌더링하는 경우 클러스터 사이의 경계가 비는 현상이 발생합니다. 따라서 contour를 구하기 전에 1px dilation을 적용하여 contour를 확장합니다.

이후 이것을 json으로 export한 후 적절히 html로 변환합니다. html로 변환 시 각 클러스터를 하나의 div에 대응시키고, 각 div에 대해 `clip-path`를 적용합니다. 이 작업은 문자열 연산으로 수행할 수도 있지만 여러모로 번거롭기 때문에 React를 사용한 후 개발자 도구에서 Element를 복사해왔습니다.

아래는 Python 코드입니다.

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

아래는 React 코드입니다.

```tsx
import _contours from "./output.json";
const contours: Contour[] = _contours as Contour[];

type Vec2 = [number, number];
type Color = [number, number, number];
type Contour = [Vec2[], Color];

export function Chuu() {
  return (
    <div>
      <h1>꽁꽁 얼어붙은 한강 위로 고양이가 걸어다닙니다.</h1>
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
