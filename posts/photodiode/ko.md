---
title: Photodiode circuit
tags:
  - electronics
date: 2025-02-01T17:59:36.659Z
---

최근에 어떤 프로젝트를 진행하면서 여러 개의 포토다이오드를 고속으로 사용해야 하는 일이 있었다. 이를 진행하면서 포토다이오드 회로 구성에 대해 공부해서 이를 정리한다.

## Photodiode

포토다이오드는 빛을 받아 전류를 발생하는 반도체 소자다. 다만 태양광 전지처럼 전압을 직접 생성하는 것은 아니며, 역바이어스 전압이 걸려있을 때 빛을 받으면 수 µA 정도의 전류가 흐르므로 이를 측정하는 방식으로 사용한다. 포토다이오드의 등가 회로는 다음과 같다.

![alt text](image.png)

이때 $R_j$는 대단히 크고 (kΩ~GΩ), $R_s$는 대단히 작다 (Ω~mΩ). 이들은 일반적으로 무시할 수 있다. 그런데 $C_j$는 일반적으로 수 pF 정도로 작은 용량이지만 고속으로 사용할 때는 시상수에 영향을 미치므로 무시할 수 없다. 이에 대해서는 아래에서 다룬다.

## Photodiode Circuit

기존에 포토트랜지스터를 이용한 적이 있었다. 포토트랜지스터는 형태가 포토다이오드와 비슷하지만 포토다이오드와 트랜지스터를 합쳐놓은 것과 동일하게 기능하므로 애초에 훨씬 큰 전류(수십 mA 이상)이 발생한다. 따라서 이것을 analog to digital converter (ADC) 등으로 측정할 때는 pull-down 저항과 간단한 필터정도만 잘 설계해주면 어렵지 않게 사용할 수 있었다.

#### Trans-impedance Amplifier

그러나 포토다이오드는 전류가 훨씬 작기 때문에 이를 측정하기 위해서는 전류 증폭이 필요하다. 그래서 전자공학을 전공한 친구 미스터 빈에게 도움을 받은 결과, 다음과 같은 trans-impedance amplifier (TIA) 회로를 사용하면 된다는 것을 알게 되었다.

![alt text](image-1.png)

TIA란 전류를 전압으로 변환하는 회로이며 포토다이오드 사용 시 가장 많이 사용되는 회로 중 하나이다. 그 이득은 $-R_F$이며 그것은 위 회로에서 $V_-=V_+$라 가정하면 $V_-=0$이므로 $V_\text{OUT}=-I_\text{PD}R_F$이므로 쉽게 보일 수 있다.

#### Sampling Rate

따라서 이 회로에서 $R_F$를 크게 하면 높은 이득을 얻을 수 있다. 그러나 앞서 언급한 것처럼 포토다이오드의 등가 회로에는 커패시턴스가 존재하므로 이것이 RC 저역통과필터를 구성하게 된다. 따라서 $R_F$를 과도하게 크게 설정하면 고속 샘플링을 할 수 없다.

예를 들어 포토다이오드의 $C_j=5\text{pF}$이며 최대 광량 하에서 일반적으로 $I_\text{PD}=10\mu\text{A}$ 정도의 전류를 발생한다고 하자. 이때 최대 광량 하에서 5V정도의 전압을 얻기 위해서는 피드백 저항을 $R_F=5\text{V}/10\mu\text{A}=500\text{k}\Omega$ 정도로 설정해야 한다.

이때 시상수를 계산해보면 $\tau=R_FC_j=500\text{k}\Omega\times5\text{pF}=2.5\mu\text{s}$이다. 이때 아날로그 값 샘플링을 위해서는 시상수의 5배 정도의 시간이 필요하므로 샘플링 시간은 12.5µs 정도로 설정해야 한다. (99.3%) 그러므로 이 회로는 최대 80kHz 정도의 샘플링 속도까지만 사용할 수 있다.

#### Actual Circuit Design

실제 사용할 소자의 특성은 다음과 같다.

- $C_j=4\text{pF}$
- $I_\text{PD}=17\mu\text{A}$
- 최대 광량 하에서 $V_\text{OUT}=4.5\text{V}$

최대 전압인 4.5V는 Op-amp의 동작 전압이 5V이므로 일반적인 선형 구간인 90% 정도를 사용한 것이다.

따라서 $R_F=4.5\text{V}/17\mu\text{A}=265\text{k}\Omega$ 정도로 설정하면 된다. 이때 시상수는 $\tau=265\text{k}\Omega\times4\text{pF}=1.06\mu\text{s}$이므로 샘플링 시간은 $5\tau=5.3µs$ 정도가 된다. 그러므로 이 회로는 188kHz 정도의 최대 샘플링 속도를 가진다.

#### Additional Consideration

포토다이오드를 실제로 사용할 때에는 포토다이오드 뿐만이 아니라 ADC를 비롯한 다양한 구성 요소들을 함께 고려해야 한다. 이러한 사항들은 포토다이오드 자체에 대한 것은 아니지만 포토다이오드를 고속으로 사용하려면 반드시 고려해야 하는 것이다. 그러므로 이것을 추가로 정리한다.

먼저 이번 프로젝트에서는 최대 200kHz의 샘플링 속도를 가진 ADC를 그 절반인 100kHz sampling rate로 사용할 것이다. 따라서 나머지 회로의 sampling rate는 적어도 100kHz가 넘어야 한다.

그리고 16개의 포토다이오드를 analog mux로 multiplexing 하여 사용할 것이다. 그러므로 추가로 mux로 인해 발생하는 시간 지연과 Op-amp 자체의 slew rate로 인한 settling time, ADC의 conversion time을 고려하면 된다.

> Slew rate는 Op-amp의 출력 전압의 변화율을 의미한다. 이 값이 낮으면 고주파에서 왜곡이 발생할 수 있다.

데이터시트를 참고할 때 mux의 turn on/off 시간과 propagation delay는 ns단위이므로 고려할 필요가 없다. 또한 데이터시트상 Op-amp의 0.1% settling time은 7us 정도이므로 이것이 전체 시스템에서 가장 오랜 시간이 걸리는 부분이다. 7us는 약 143kHz의 샘플링 속도를 의미하므로 이것이 전체 시스템의 샘플링 속도의 상한이 된다.

마지막으로 ADC는 track-and-hold 방식으로 동작하므로 track 시간을 또한 고려해야 한다. 실제 사용할 ADC는 3.2MHz 클럭에서 동작하며 3 cycles의 track time을 가지므로 track에 약 1µs 정도가 소요된다. 이것을 추가로 고려하면 약 8us의 샘플링 시간이 필요하며 이는 125kHz의 샘플링 속도를 의미한다. 따라서 이 회로는 충분히 100kHz의 샘플링 속도를 가질 수 있다.

## Conclusion

포토다이오드를 고속으로 사용하는 경우에 회로를 구성하는 방법과 그때의 고려사항을 공부하고 정리했다.

## References

#### Technical Notes

- https://www.ti.com/lit/an/sboa061/sboa061.pdf
- https://www.analog.com/media/en/technical-documentation/technical-articles/s54_en-circuits.pdf

#### Datasheets of Components

- [Photodiode(VEMD2020X01)](https://www.lcsc.com/datasheet/lcsc_datasheet_2410121811_Vishay-Intertech-VEMD2020X01_C3210968.pdf)
- [Op-amp(OPA378)](https://www.ti.com/lit/ds/symlink/opa378.pdf)
- [Mux(74HC4067)](https://www.ti.com/lit/ds/symlink/cd74hc4067.pdf)
- [ADC(ADC124S021)](https://www.ti.com/lit/ds/symlink/adc124s021.pdf)
