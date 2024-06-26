---
title: 문서 기록 / 작성 원칙
tags:
  - dev
date: 2024-04-16T08:47:24.549Z
---

문서나 기록은 근본적으로 타인이나 미래의 내 자신에게 알고 있는 정보를 전달하도록 하기 위한 수단이다. 단순히 정보를 기억해두거나 말로써 타인에게 전달하는 것에 비해 기록은 다음과 같은 장점을 가진다.

- 사람의 기억력은 유한하여 시간이 지나면 정보가 손상되기 쉽다. 그러나 안정적인 매체에 기록해두면 정보의 손실을 막을 수 있다.
- 기록은 여러 부로 복제하여 여러 사람에게 동시에 전달할 수 있다.
- 말로 정보를 전달하면 여러 사람을 거치며 내용이 왜곡될 수 있으나 기록은 정확한 복제가 가능하므로 왜곡이 덜 일어난다.

그런데 글에는 정보를 제공하는 모종의 순서가 있다. 이것은 보통 그러한 순서를 따랐을 때 자연스럽게 이해하기 쉽게 되거나, 또는 사회적으로 그러한 순서로 작성하기로 합의가 된 순서다. 이러한 순서가 있는 이유는 가진 정보를 생각나는 대로 서술한다고 해서 독자가 정보를 습득하기가 쉬운 형태가 되는 것은 아니기 때문이다.

물론 이러한 순서는 글마다 다르다. 글에 따라 그 목적과 제공하는 정보의 종류가 달라지기 때문이다. 따라서 이 글에서는 글의 종류에 따른 내용 배치 방법을 정리하여 나중에 글을 쓸 때 도움이 되고자 한다.

## 논문과 같이 무언가를 연구하여 가설을 검정한 경우

- **Abstract**: 전체 연구에 대한 요약. 이 연구의 배경은 무엇이며, 어떠한 가설을 세웠으며, 어떤 방법으로 시험했으며 어떤 결과를 얻었고, 그것이 어떤 의미를 가지는가?

- **Introduction:**

  - **Background:** 이 연구에서 다루고자 하는 대상은 무엇인가?

  - **Motivation:** 이 대상에 대하여 이 가설을 검증하고자 하는 이유는 무엇인가? 기존에 어떤 문제가 있어서 이러한 연구를 시도하는가?

  - **Related Works / Literature Review / History:** 관련된 연구는 무엇이 있으며, 그러한 연구들에서는 비슷한 문제에 대해 어떤 방식으로 접근하였는가? 이 가설을 검증하는 데 필요한 전제들 중 이미 연구된 전제는 어떤 것이 있는가? 이 문제를 해결하기 위해 다른 연구들은 어떤 방식을 제안했는가?

  - **Objective:** 검증하고자 하는 가설은 어떤 것인가? 이 연구에서 달성하고자 하는 바는 무엇인가?

  - **Differences:** 이 연구는 다른 연구들에 비해 어떤 차별점을 가지는가? 이 연구가 사용한 방법은 다른 연구들에서 사용한 방법과 어떻게 다른가? 다른 연구들이 놓친 어떤 부분을 연구하였는가?

- **Method:** 어떠한 방법으로 실험을 설계하였는가? 데이터는 어떠한 방식으로 수집하였으며 그것을 어떻게 분석하였는가? 그러한 방식으로 설계한 실험과 얻은 데이터, 그리고 이로부터 수행한 분석은 왜 타당성을 가지는가?

- **Result:** 위 실험을 통하여 어떤 데이터를 얻었는가? (이 섹션에서는 결과에 대한 해석을 하지 않고 정확한 데이터나 실험 결과만을 제시하는 것이 중요하다)

- **Discussion:** 이러한 결과를 해석하면 어떤 결론을 얻는가? 이것은 무슨 의미인가? 학문적으로 어떤 의의가 있는가? 기존 연구들에서 얻었던 결론들과는 어떤 차이가 있는가? 어떤 새로운 발견을 했나? 이것이 후속 연구에 어떤 도움을 줄 수 있을까?
- **Conclusion / Limitation:**

  - **Summary:** 앞서 했던 내용을 한 줄로 요약한다. 어떤 대상에 대해 어떤 실험을 했고 어떤 결과를 얻었으며 이것은 이러한 의미를 가진다.

  - **Limitation:** 부족한 부분을 적는다. 그러나 이러한 연구를 수행했음에도 이러한 부분은 밝히지 못했다. 이러한 원인으로 인한 오류의 여지가 있다. 이 연구에서는 이러한 부분이 중요함에도 다루지 않았다. 실험적으로 이러한 한계가 있다.

  - **Future Works:** 그러므로 다음번에는 이러한 후속 연구를 수행하고자한다. 다른 연구자들이 이러한 부분을 다루어주면 좋겠다. 이러한 부분이 보완된다면 더 많은 가치를 만들 수 있을 것이다.

## 프로그램 / 라이브러리 / 서비스 등 소프트웨어를 개발한 경우의 사용 설명서

이런 글에는 상단에 사용법 부분으로 곧바로 건너가는 링크나, 혹은 사용법을 위해서는 특정 섹션을 보라고 알려주는 강조 문구를 넣으면 다. 임의의 독자를 대상으로 하는 글과 다르게, 이러한 글을 읽는 사람은 분명한 필요성을 가지고 해결책을 찾다가 이러한 글을 접할 가능성이 높기 때문이다. 이러한 독자들에게는 Introduction이나 Motivation이 불필요할 수 있다.

- **Introduction:** 이것은 무엇인가? 어떠한 동작을 하는가?

- **Motivation:** 어떠한 불편함을 해결하는가? 이것을 왜 만들었는가? 기존에 있던 제품들과의 차이는 무엇인가?

- **Requirements / Needs:** 이 소프트웨어의 요구사항은 어떻게 정의되었는가? 이 소프트웨어는 어떠한 요구사항을 달성하기 위해 작성되었는가? 이 소프트웨어의 스펙은 무엇인가?

- **Usage:**

  - **Getting Started / Quick Start:** 이 소프트웨어를 지금 당장, 최소한의 노력으로 사용해보기 위해서는 어떻게 해야 하는가?

  - **Structure / Architecture:** 사용자 입장에서 알아야 할 소프트웨어의 형태와 구조를 설명한다. 클래스 구조나 내부 코드를 말하는 것이 아니다. 예컨대 이 소프트웨어는 GUI 어플리케이션인가? 단순한 CLI인가? 또는 정적/동적인 라이브러리인가? 구조는 모놀리식인가? 여러 서비스가 서로 상호작용하나? 동기인가 비동기인가? 시스템에 영향을 미치는가? 어디에 설치되며 어떻게 실행되는가? 어떻게 삭제하나?

  - **Interfaces:** 사용자가 소프트웨어를 사용하려면 무엇을 알아야 하는가? 어떤 인터페이스를 통해 사용자와 상호작용하는가? 예를 들어, 라이브러리라면 어떤 API가 있고 어떤 방식으로 호출해야 하며, 어떤 동작을 하고 그 결과는 어떠한가? CLI라면 어떤 파라매터를 넘겨서 실행하며 어떤 동작을 하고 그 결과는 어떻게 반환되는가? GUI라면 어떤 페이지로 이루어져 있고 각 페이지의 버튼을 누르면 어떤 동작을 수행하는가?

- **Others:** 라이센스, 보증 기간, 기여자 등의 부가 정보

## 소프트웨어의 기술 문서

기술 문서는 소프트웨어를 개선하거나 유지보수하기 위한 정보를 정리한 것이다.

- **Introduction:** 위와 동일하게 이것은 무엇인지에 대해 서술하나, 소프트웨어의 코드를 수정하는 사람이라면 이미 배경 지식이 있는 사람으로 간주하고 간략하게만 서술해도 좋을 것이다. 사용자 문서에 링크를 거는 것도 하나의 방법일 수 있다.

- **Requirements:** 소프트웨어가 만족해야할 추상적인 요구사항에서 Spec이나 API 규격 등에 대해 서술한다.

- **Structure / Architecture:** 소프트웨어의 내부 구조와 소프트웨어가 어떠한 컴포넌트들로 나누어지며 그들의 의존성이 어떻게 되는지를 서술한다.

- **Components:** 각 컴포넌트의 구조와 동작 방식에 대해 서술한다. 컴포넌트가 계층적으로 이루어진 경우 이 부분은 별도의 문서로 분리될 수 있다.

- **Development Environment / Convention:** 개발환경의 구성과 코드 컨벤션, 깃 전략, PR 작성법 등 실제 기여에 필요한 정보를 적는다.

- **History / Decision:** 소프트웨어의 개발 과정에 있었던 의사 결정에 대해 정리한다. 필수적으로 읽어봐야 할 부분이라기보다는 소프트웨어 개발 도중 왜 이렇게 구현했는지 의문점이 들 때 읽어보라고 만든 문서에 가까울 것이다. Component 문서 하위에 들어갈 수도 있고, 독립적인 섹션으로 들어가는 것도 고려해볼 만하다.
