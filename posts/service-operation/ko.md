---
title: 2년 10개월간의 1인 서비스 운영기
tags:
  - development
date: 2023-10-04T13:28:03.688Z
---

저는 부동산 매물을 관리하는 작은 서비스를 운영하고 있습니다. 이 서비스는 어머니를 도와드리기 위해 만든 것으로, 공개되어있기는 하나 일단은 비즈니스로서 운영하지는 않고 있어서 아직까지도 저희 어머니 한 분께서만 사용하고 계십니다.

> https://real-estate.unknownpgr.com

깃 로그를 확인해보니 개발을 시작한 것이 2020년 7월 12일로, 약 2년 10개월째 서비스를 운영하고 있습니다. 작은 서비스이지만 이 서비스를 운영하며 배운 점이 많아 정리해두고자 합니다.

실제 서비스의 개발 과정은 상당히 엉망진창이었고(😅) 아래 글처럼 깔끔하게 진행되지 않았습니다. 그러나 가독성을 위해서 일반적인 개발 과정에 맞추어 깔끔하게 정리해봤습니다.

# 시작

어머니가 부동산 일을 하시게 된 것은 수년 전입니다. 그때는 일을 시작하신 지 얼마 되지도 않았고 매물도 많지 않아 단순히 종이로 된 표에 매물을 기록하셨습니다.

매물은 가면 갈수록 많아졌고 곧 종이로는 매물을 관리하게 어렵게 됐습니다. 아버지께서는 컴퓨터를 전공하시지는 않으셨지만 Visual Basic을 사용하여 엑셀을 다룰 줄 아셨고, CRUD 기능을 가진 프로그램을 만들어주셨습니다.

이 프로그램은

- 매물과 고객을 생성, 검색, 편집, 삭제하는 기능을 가지고 있었습니다.
- 사진이 모아진 디렉토리에서 건물의 이름이 포함된 사진들을 가져와서 캐러셀 형태로 보여주는 기능도 있었습니다.
- 데이터베이스로 숨겨진 시트를 사용했습니다.
- 그래서 필요할 때면 데이터를 곧바로 표로 인쇄하여 사용할 수도 있었습니다.

물론 아버지가 프로그래밍을 깊게 공부하시지 않은 만큼 약간의 문제점은 있었습니다.

- 데이터베이스는 정규화되어있지 않았습니다.
- 건물과 고객은 실제로는 n:n 관계이지만 같은 시트에 관리되어서 오직 1:1 매칭만이 가능했습니다. 그래서 새 고객을 등록하려면 이전 고객 정보를 지워야 했습니다.
- 모든 코드가 한 개 파일에 모여있고 코드의 중복이 많아서 코드 길이는 1만 줄이 넘었습니다.

그럼에도 프로그램은 완벽하게 동작했고 어머니께서는 일하시기가 대단히 편해지셨습니다.

그러나 일을 계속할수록 필요한 기능은 계속 늘어났습니다. 프로그램은 갈수록 복잡해져서 더이상 새로운 기능을 추가하는 것이 불가능하게 되었습니다. 그래서 저는 이 프로그램을 다시 만들어보기로 했습니다.

# 도메인

먼저 개발에 앞서 도메인 지식을 얻어야 했습니다. 물론 그때는 클린 아키텍쳐나 도메인 주도 개발, 엔티티나 유즈케이스같은 개념들을 전혀 몰랐습니다. 그러나 나름의 경험상 도메인 지식과 유저의 상세한 요구사항 없이 프로그래머가 생각했던 대로 프로그램을 만들면 결국에는 전부 고쳐야 한다는 것은 알고 있었습니다. 그래서 저는 어머니를 모셔다 놓고 종이와 연필을 가지고 어떤 UI와 어떤 기능이 필요한지를 물어보았습니다.

이 과정에서 유저와 개발자의 차이, 그리고 유저와 소통하는 방법을 배울 수 있었습니다.

첫 번째로 유저와 대화할 때는 과정이 아니라 결과를 다루어야 한다는 것을 알게 됐습니다. 기능이 내부적으로 어떻게 동작하는지는 유저는 이해할 수 없을 뿐더러 이해할 필요도 없습니다. 유저에게 중요한 것은 결과입니다.

어머니께서는 프로그램이 로컬에서 돌아가는지 아니면 서버-클라이언트 형태인지, 그게 사용하는 데 있어 어떤 차이가 생기는지를 전혀 모르셨고 스마트폰에서 웹 페이지 바로가기와 네이티브 앱의 차이 역시 알지 못하셨습니다. 하지만 웹 어플리케이션이나 네이티브 앱을 설명하는 대신 '이렇게 하면 인터넷이 연결되어야만 쓸 수 있고 대신 컴퓨터랑 노트북에서 동기화가 자동으로 된다'라고 설명드렸습니다. 실제로는 서버-클라이언트 구조는 동기화와는 아무런 관계도 없습니다. 그러나 유저가 동작 방식을 완벽하게 이해했으므로 구체적인 작동 방식은 별로 중요하지 않았습니다.

그리고 유저는 어떤 것이 필요한지를 잘 모르며, 따라서 유저에게 요구사항을 받을 때는 달성하려는 목적을 조사해야 하며 기능만을 생각하면 안 된다는 것을 알게 되었습니다.

요구사항 중에는 '평'과 '제곱미터'를 변환할 수 있는 계산기와 도로명주소와 지번주소를 변환할 수 있는 변환 페이지를 포함해 달라는 것이 있었습니다. 탭을 하나 추가해서 이런 계산기나 변환기를 구현하는 건 간단합니다. 그러나 조금 더 생각해보면 결국 유저가 원하는 건 변환기나 페이지가 아니라 두 개 정보 중 하나로부터 다른 하나를 얻는 것입니다. 그래서 건물 정보를 입력하는 칸에 도로명주소와 지번주소를 입력하는 칸을 둘 다 만들되, 아무 쪽에나 아무 주소를 입력하면 (예컨대 도로명주소 칸에 지번주소를 입력한다거나) 포커스 아웃될 때 자동으로 적절히 변환된 값이 둘 다 입력되도록 구현했습니다. 평수 역시 평수 입력칸과 제곱미터 입력칸을 둘 다 만들고 한 쪽에 값을 입력하면 다른 쪽은 자동으로 채워지도록 구현했습니다. 이러한 경험으로부터 유저는 때로는 요구사항을 정확하게 설명하지 못하는 경우가 많다는 것을 알게 됐습니다.

다음으로 유저는 자신이 무엇을 바라는지를 정확하게 설명하지 못할 수도 있다는 것을 알게 됐습니다.

건물들이 주소 순서로 나열되기를 바라지만 최근 수정한 순서대로 나열되면 좋겠다는 요구사항이 있었습니다. 그러나 주소와 수정 시간은 둘 다 고유한 값이므로 (다세대 주택의 예외가 있기는 하지만) 이 정렬 기준은 일반적으로 만족시킬 수가 없었습니다. 그래서 유저 인터뷰(?)를 더 진행해봤습니다. 그 결과 주소 순으로 나열되기를 바라는 이유가 지역별로 건물을 관리하기 위해서임을 알게 되었습니다. 즉, 주소가 아니라 지역(지번주소에서 동)을 기준으로 정렬하고 다음으로 정보 수정 시간을 기준으로 정렬하면 되는 것이었습니다. (다만 이후에 여러 정렬 기준이 필요해졌고 결국 정렬 기준을 유저가 직접 선택할 수 있도록 업데이트했습니다.)

마지막으로 프로그래머와 그렇지 않은 사람의 관점 차이는 생각보다 클 수 있다는 것을 알게 됐습니다.

기존 엑셀 프로그램의 데이터를 이전하려고 데이터를 확인해보니 중복되는 데이터가 많았고 참신한(?) 형식의 값들이 많았습니다. 예를 들어 불확실한 날짜를 \*로 표시하는 (2023-01-1\*처럼) 표기 방법이 있었습니다. 어떤 날짜가 2023년 1월 10일에서 20일 사이로 추정된다는 의미입니다. 그런데 이 표기법은 비즈니스적 의미가 있어서 함부로 고칠 수가 없었습니다. 그리고 때로는 이 값을 기준으로 데이터를 정렬해야 할 때도 있었습니다.

나중에 이 문제를 해결하기 위해 이 부분의 날짜 데이터를 Datetime 대신 String 형식으로 저장하도록 했습니다. 대신 이 별표 표기법 외의 새로운 형식을 사용할 수 없도록 제한했습니다. 그리고 이 데이터를 기준으로 정렬할 때는 별표를 5로 치환한 값을 사용하도록 구현해서 문제를 해결했습니다.

# 개발

도메인을 습득한 후에는 서비스 개발을 시작했습니다.

- React와 Chakra UI를 사용하여 프론트엔드를 만들었습니다.
- Koa를 사용하여 백엔드를 구축했습니다.
- 데이터베이스로는 Mongo Atlas를 이용했고 Prisma를 사용하여 스키마와 데이터베이스 클라이언트를 관리했습니다.
- DB를 제외한 나머지 컴포넌트는 모두 제 개인 서버에 있는 쿠버네티스 클러스터 위에 배포했습니다.

개발하면서도 다양한 문제와 고민이 발생했습니다.

- 한 개 건물의 속성은 약 90개나 됐습니다.
- 속성들은 대단히 자주 바뀌었습니다.
- 그리고 이에 따른 UI 변경 역시 잦았습니다.

이 문제는 유연한 아키텍쳐를 구현해서 해결했습니다.

- 데이터베이스가 MongoDB로 구성되어 있어 스키마를 바꾸기가 용이했습니다.
- Prisma를 사용했으므로 데이터베이스 스키마와 클라이언트 타입 검사 역시 자동으로 수행할 수 있었습니다.
- Back-front간의 API는 tsoa를 사용하여 OpenAPI 스펙을 자동으로 생성했습니다.
- 프론트엔드 API 호출 역시 `openapi-generator-cli`를 사용해서 자동으로 생성했습니다.

건물의 속성이 너무 많고 복잡해서 '그냥 Prisma에서 자동으로 생성해주는 타입을 entity로 사용할까?' 라는 고민도 정말 많이 했었습니다. 그러나 그러면 비즈니스 로직이 데이터베이스 스키마에 의존하여 의존성 역전 원칙을 위배합니다. 어쩌면 나중에 Prisma보다 더 좋은 ORM이 나올 수도 있습니다. 만약 Prisma의 타입에 의존하고 있었다면 새로운 ORM을 도입하기 곤란할 것입니다. 그래서 결국 entity를 따로 만들어서 사용했습니다. 다행스럽게도 Prisma에서는 반환되는 오브젝트의 타입을 강제해주는데다 Typescript는 같은 property를 가지면 같은 타입으로 간주되기 때문에 리포지토리는 별로 복잡하지 않은 구조로 만들 수 있었습니다.

프론트와 백에서 entity를 공유해야 하는지, 아니면 별개의 entity를 만들어 사용해야 하는지도 고민이었습니다. 그런데 근본적으로 프론트와 백은 애초에 아키텍쳐에서 고민할 문제가 아닙니다. 기능에 따라 컴포넌트를 구성한 후 그 컴포넌트가 프론트에 적합한지 백에 적합한지에 따라 프론트와 백의 경계를 그어야 하며, 프론트와 백을 먼저 생각해서는 안 되는 거였습니다. 그래서 프론트와 백에서 entity를 공유하는 것은 아키텍쳐적으로는 문제가 없다고 판단했고 실제로도 이렇게 구현했습니다.

프론트엔드에는 꽤 많은 비즈니스 로직이 포함됩니다. 그래서 이를 단순한 표현 레이어로 생각할 수 없었습니다. 또 프론트와 백이라는 서비스 경계를 데이터가 오가는데 필요한 만큼만 DTO를 만들어야 되는 것이 아닌지도 고민해봤습니다. 그러나 이러한 부분은 필요에 따라 얼마든지 백-프론트 경계를 수정하여 해결할 수 있다고 판단했습니다. 그래서 1인 개발인데다 아직 서비스 도메인이 안정화되지 않은 만큼 지금은 편의를 위하여 entity를 그대로 사용하고, 나중에 서비스가 안정화되면 그때 최적화를 위해 DTO를 만들어 사용하기로 결정했습니다.

개발 환경과 서버를 구축하는 것도 재밌는 과정이었습니다. 이 서비스는 프론트 서버, 백 서버, MongoDB와 레디스 4개의 컴포넌트가 있어야 정상 동작합니다. 그런데 로컬에서 개발 서버를 띄우자니 다른서비스의 개발 서버의 포트와 충돌하는 경우가 잦았습니다. 포트를 바꾸는 건 어렵지 않지만 그럴 때마다 카카오 로그인 등을 위해 외부에 등록된 개발 서버 정보를 새롭게 수정해줘야 했습니다. 이 문제는 추후에 개발한 [http-tunneling](https://github.com/unknownpgr/http-tunnelling) 툴을 활용하여 도메인으로 접근할 수 있도록 개발 서버를 구성해서 깔끔하게 해결했습니다.

# 리팩토링

위 섹션에서는 마치 처음부터 도메인에 맞추어 클린한 아키텍쳐를 설계하고 개발한 것처럼 적었습니다. 그러나 처음에 언급했듯이 실제로는 다양한 시행착오를 겪었고, 엄청난 리팩토링을 진행했습니다.

#### 타입스크립트

가장 먼저, 처음에는 타입스크립트를 사용하지 않고 자바스크립트를 사용했었습니다. 그래서 타입 검사가 이루어지 않아 발생하는 오류도 많았습니다. 이 문제는 단순히 소스코드 전체를 타입스크립트로 리팩토링함으로써 해결했습니다. 한 달, 혹은 그 이상이 걸렸던 것으로 기억합니다.

#### 백엔드 아키텍쳐

이후에는 아키텍쳐 문제가 발생했습니다. 이 프로젝트를 처음 시작할 때는 아키텍쳐 설계를 잘 알지 못해 koa router 안에 비즈니스 로직을 작성해버렸습니다. 물론 데이터베이스 레이어도 분리되지 않아서 primsa를 직접 호출했습니다. 이런 아키텍쳐는 메모장이나 일기장 서비스처럼 비즈니스 로직이 작고 간단한 경우에는 유용하지만, 로직이 조금만 복잡해지더라도 유지보수가 어려워집니다. 클린 아키텍쳐 책을 읽고 나서야 이 문제를 어떻게 해결해야 하는지 알게 되었고, 백엔드를 클린 아키텍쳐에 기반하도록 수정하여 해결했습니다. API를 비롯하여 코드베이스가 크게 변해서 연속적인 배포가 불가능한 상황이었지만 다행히 이 서비스는 유저가 1명밖에 없기 때문에 서비스를 적당한 타이밍에 중지하고 재배포할 수 있었습니다.

#### 프론트엔드 아키텍쳐

프론트엔드 아키텍처를 잘 설계하지 못해 발생하는 문제도 있었습니다. 서비스의 주요 UI는 건물이나 고객 정보를 입력/표시하는 Input Component (예를 들면 Text area, toggle button 등)입니다. 처음에는 그 변경을 쉽게 할 수 있도록 Input Component에 적절한 entity의 attribute 이름을 prop으로 공급하면 Input Component 내에서 context에 있는 entity 오브젝트의 필드를 수정할 수 있도록 구현했습니다. 이 구현은 UI 변경을 쉽게 만들어주었지만 프론트엔드 로직, Input Component, React Framework 세 가지를 대단히 강하게 결합했습니다. 그래서 시간이 지나니 기능을 추가하는 것이 대단히 어려워졌습니다. 결국 이것 역시 비즈니스 로직, 프레임워크, UI를 깔끔하게 분리하도록 완전히 다시 작성했습니다.

그런데 데이터가 call stack을 따라 흐르는 backend와는 다르게, 프론트엔드에서는 데이터가 call stack을 따라 흐르지 않습니다. 즉, 어떤 함수(보통 event handler)에서 state(혹은 model)을 업데이트한 경우, 그 함수와 전혀 무관한 다른 UI 컴포넌트들이 업데이트될 수 있다는 의미입니다. 그러므로 프론트엔드에서는 비즈니스 로직을 단순 클래스로 작성해서는 안 되고 React등에서 이를 관찰할 수 있는 방식을 제공해야 합니다. 이를 구현하기 위해 다양한 방법 - Proxy, Frameworks (e.g. Redux / Context API), PubSub - 을 시도해봤으나 역시 단순한 listener만한 것이 없었습니다 그래서 클래스에 addEventListener함수를 만들고 이 함수를 사용하는 hook을 추가하여 클린 아키텍쳐를 유지하면서 react에서 사용할 수 있도록 구현했습니다.

#### GraphQL

좋아보이는 기술을 무작정 도입했다가 낭패를 본 적도 있습니다. 전에 새로운 기술을 사용해보겠다고 무작정 GraphQL을 적용한 적이 있습니다. 리스트 UI 등을 구현할 때 엔티티를 통째로 들고 오면 불필요한 데이터가 너무 많이 전송되므로 이를 줄이겠다는 의도였습니다. 도입할 때는 깔끔하고 세련된 기술이라고 생각했습니다. 그러나 작업하면서 다양한 문제에 마주쳤습니다.

- 데이터를 입맞에 맞게 가져오기에는 적절하지만 복잡한 필터를 적용하거나 데이터를 조작하기는 꽤 어렵습니다.
- N+1 문제가 생각보다 크게 작용합니다.
- 데이터 타입이 너무 복잡해서 프론트에서 구조를 깔끔하게 가져가기가 힘듭니다.

그래서 결국 REST API로 돌아갔습니다. 이 리팩토링을 수행하면서 GraphQL과 비즈니스 로직을 너무 강하게 결합했다는 것도 깨달았고, 이후에는 앞서 언급한 것처럼 프론트에서도 구현과 추상을 분리해냈습니다.

#### CQRS

복잡한 aggregation이 필요해서 얼떨결에 CQRS를 구현하기도 했습니다. 고객 리스트에서 대금 지불이 이루어지지 않은 고객을 상위에 노출시키는 작업이었는데, 이걸 구현하기 위해서는

1. 각 고객이 가진 거래들 중
2. 대금 지불이 이루어지지 않은 거래가 존재하는지를 알아낸 후
3. 이 순서로 정렬을 수행해야 합니다.

MongoDB에서 Aggregation은 RDB의 Join과 다르게 성능이 그렇게 좋지 않습니다. 그런데 정렬까지 하게 되니 대단히 비효율적인 연산을 하게 되었습니다. 그래서 아예 Read를 위한 모델을 따로 만들었습니다. 이 모델은 고객 모델에 대금이 지불이 이루어지지 않은 거래들의 ID를 추가한 모델이며 고객을 수정하거나 거래를 수정하면 이 모델도 함께 수정되도록 구현했습니다. 이 경우 한 번에 한 명의 고객만을 수정하는데다 정렬도 하지 않으므로 시간복잡도는 늘어나지 않지만, 조회할 때는 인덱스를 사용할 수 있으므로 성능이 대폭 향상되었습니다. 이게 Read model을 분리한 일종의 CQRS라는 걸 나중에 알게 되었습니다.

# 배포

배포 역시 쉬운 일이 아니었습니다. 그나마 다행인 점은 리포지토리를 분리하기 귀찮았던 나머지 프론트와 백을 하나의 리포지토리에 몰아 넣고 개발했던 것입니다. 그게 모노레포라는 하나의 방식이라는 것은 나중에 알게 되었습니다.

그럼에도 불구하고 배포 프로세스를 작성하는 것은 생각보다 어려웠습니다. 처음에는 ArgoCD, GitHub Actions 등 다양한 CI/CD 툴들을 사용해봤습니다. 그러나 ArgoCD를 사용하자니 이미지 빌드와 배포가 분리되어서 배포 프로세스가 복잡해졌습니다. GitHub Actions에서 모든 것을 처리하는 것은 나름 괜찮은 방법이었지만 너무 느렸고 시크릿 관리가 어려웠습니다.

무엇보다 큰 문제는 관리 포인트였습니다. 앞서 시도한 방법들은 모두 완벽하게 동작했지만 오직 저 혼자서 이 프로젝트를 개발한다는 것이 문제였습니다. 관리 포인트가 많아질수록 관리하기가 어려워지기 때문입니다. 예컨대 ECR, GitHub Actions, ArgoCD를 사용한다고 가정하면 서비스 하나를 추가하거나 이미지 이름을 변경하려면 소스코드를 포함하여 건드려야 할 부분이 네 가지나 됩니다.

그러면서 앞서 말한 멋진 CI/CD 스택들은 모두 많은 사람이 모여 개발하는 경우를 상정하여 설계된 것이고 소규모 프로젝트에서 저런 스택들을 도입하는 것은 그냥 겉멋에 불과하다는 걸 깨달았습니다. 그래서 빌드와 배포를 모두 간단한 쉘 스크립트를 도입해서 해결했습니다. 빌드는 로컬에서 docker buildx를 사용하여 수행되며 이미지 빌드가 성공하면 kustomize를 사용하여 배포 환경(production/staging)에 맞는 단일 manifest 파일을 생성합니다. 이 파일에서 이미지 이름은 모두 환경 변수 형식으로 되어 있어 envsubst를 사용하여 치환합니다. 이렇게 만들어진 manifest 파일은 git에 추적됩니다. 초기에는 시크릿 관리 방법을 몰라 보안상의 이유로 이를 추적하지 않았지만 이후 Sealed Secret을 도입하여 추적할 수 있도록 만들었습니다. 이후 kubectl을 사용하여 로컬에서 배포를 수행합니다.

이 방식은 대단히 효율적입니다. 전에 GitHub Actions를 사용했을 때는 배포 기간이 3~5분까지 걸렸지만 이를 1분 이내로 단축할 수 있었습니다. 기본적으로 이전에는 푸시 이후 빌드를 위한 VM을 시작하고, Git Clone을 수행하며, registry에서 Docker cache를 로드하는 과정에 꽤 많은 시간이 소요됐습니다. 그러나 이 방식을 도입함으로써 빌드 환경 구성이나 Git Clone이 불필요해졌습니다. Docker cache는 local cache를 사용하므로 캐시 로드 시간은 사실상 무시할 수 있습니다. 그래서 아무 변경사항이 없는 경우 기존의 배포 프로세스에서 적어도 30초가 소요되던 것을 0.9초로 단축했습니다.

# 형상관리

형상관리 역시 GitFlow 대신 간략화된 새로운 방법을 도입했습니다.

- 브랜치는 main과 feature들로 나뉩니다.
- Feature 개발이 필요할 때는 main에서 feature를 생성합니다.
- 기능 개발이 완료된 이후 테스트를 수행하고, main에 feature를 합칩니다.

이로부터 배포 과정은 다음과 같이 이루어집니다.

- 배포를 수행합니다.
- 그러면 현재 배포된 서비스의 모든 정보를 담고 있는 `manifest.yaml` 파일이 생성됩니다.
- 이를 Git 에 commit합니다.
- 이 버전이 안정적인 경우 stable로 tagging합니다.

이러한 형상관리 방식은 kubernetes resource 자체가 Git으로 추적되는 단일 파일에 관리되기 때문에 오류가 발생한 경우 rollback이 간단하다는 것이 큰 장점입니다. 문제가 발생하면 그 커밋으로 돌아가서 해당 manifest.yaml파일을 배포하기만 하면 되기 때문입니다.

# 결론

이 프로젝트를 진행하면서 다양한 문제를 만났고 그 문제들을 해결하면서 많은 것을 배웠습니다. 이러한 경험은 스스로 프로덕트를 운영해봐야만 얻을 수 있는 귀중한 자산이라 생각합니다. 그리고 이 프로젝트를 통해 배운 것들은 다음 프로젝트에도 큰 도움이 될 것이라고 생각합니다.