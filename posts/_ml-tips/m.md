---
title: "머신러닝 환경설정 관련 정리"
category: tips
date:
---

머신러닝을 하다 보면 모델을 구성하고 트레이닝, 인퍼런스 하는 것보다 환경 설정이 훨씬 어렵다는 걸 알게 됩니다.
그래서 머신러닝 환경 설정을 하면서 겪은 오류 및 그 해결 방법 등을 정리해두고자 합니다.

- `nvidia-smi` 명령어에서 보이는 CUDA Version은 현재 설치된 cuda version이 아니라 그냥 해당 드라이버가 지원하는 가장 높은 CUDA version이다.
- 올바른 CUDA version을 보려면 `nvcc --version` 커맨드를 이용하면 된다.
- `module load` 를 통해 environment를 load했지만 여전히 이전 버전이 사용되는 경우, 두 개 이상의 environment module이 사용되고 있는 것은 아닌지 살펴봐야 한다.
