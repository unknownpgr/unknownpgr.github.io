---
title: "Career Master Plan Project"
category: Career
date:
---

# Career Master Plan Project

커리어 - 취업, 창업 등 - 을 위한 마스터플랜을 제작한다.

- 현재 내가 가지고 있는 역량
- 진행한 프로젝트들
- 유의미한 경험들
- 코딩 테스트, CS, 면접 대비 등

커리어 설계에 필요한 다양한 정보를 수집 및 정리한다. 이때 [About page](https://unknownpgr.com/about)와 중복되지 않게 구성하기로 한다. About page에서 누락된 내용은 임시적으로 여기에 적을 수 있으며, 시간날 때 동기화한다.

현재 면접 질문을 모아 본 결과 대략 410개 정도가 모였다. 물론 이 중에는 중복되는 질문도 있을 것이고, 앞으로 면접 대비를 더 하면서 새롭게 얻게 되는 질문도 있을 것이다. 이를 고려할 때 대략 500~600개 정도의 질문이 모일 것으로 예상된다. 마침 이 숫자는 남은 군생활의 두 배와 대충 비슷한 바, 훈련 등으로 컴퓨터를 이용하지 못하는 경우를 고려할 때 하루에 질문 세 개 정도에만 답하면 전역할 때까지는 여유롭게 모든 질문에 대한 답을 채울 수 있을 것이다.

## Projects

- The-Form
- Real-Estate manager
- Git-Key (?)

## What Did I Do?

- Everyday coding
- Dev blog
- Research (including mathematics and physics, Robotics, Electronics)

## Ability

- **Backend**: Node.js(Express, Koa, Next.js), Python(FastAPI, Django), NginX
- **DevOps**: AWS(EC2, S3, Route53, ELB, EKS), Docker, k3s, Grafana, Prometheus, Traefik, GitHub Actions
- **Database**: MySQL, SQLite, Redis, MongoDB
- **Frontend**: React, Next.js, Typescript, HTML5, CSS(SASS, CSS-module), SEO(OgTag, Google Search Console), Analytics (Meta Pixel, Google GTag)
- **Tools**: VSCode, Vim, Eclipse
- **Collaboration**: Git, GitHub, GitLab, Slack
- **Machine Learning**: Tensorflow, Keras, PyTorch, Slurm, MATLAB
- **Embedded / Hardware**: ARM(STM32Fxx), PCB Artwork basics(EasyEDA)
- **Graphics**: WebGL, OpenCV(both C++ and Python)
- **Robotics**: Motor control(PID), Rigid body dynamics(Lagrange dynamics)
- **Language**: C, C++, C#, Python, Java, Javascript, Typescript
- **Blockchain**: Ethereum, Solidity, Truffle, Ganache, Web3.js

## Challenging Experiences

- 엄청 많은 API를 가진 서비스 (real-estate) 만들기.
  - 노가다가 많았다. 이걸 혼자서 정리할 수 있도록 만드는 게 진짜 어려웠다.
  - 방법은 계속 고민 중
  - Typescript Compiler를 공부해서 어느정도 해결 방법을 찾는 중.
  - Telefunc같은 걸 아예 만들 생각을 하는 중이다.
    - Type resolver 직접 작성
    - Recursive 한 타입때문에 고생
      ```
          class ObjectId extends mongodb.ObjectId {
      _id: this;
      }
      ```
    - Stack을 사용하여 간단하게 해결
    - Resolver도 잘 작동함.
    - Router 내에서 session 등 뭔가 접근할 필요가 있음
      - 이 형식을 미리 만들어놓거나 any로 하면 Typescript가 무의미해짐
      - Module Augmentation을 이용하여 해결
        - iron-session이나 telefunc 등 다른 라이브러리들에서도 사용하는 방식임

## Coding Test / Algorithm

- Definition and implementation of basic algorithms including

  - Set / Map / Hash / HashMap
  - Priority Queue (Heap)
  - Binary search methods (considering duplicated elements, elements at end of the array)
  - Cumulative sum, Prefix sum
  - Topological Sort

- Implementation of advanced algorithms including
  - Dijkstra
  - Floyd-Warshall
  - Bellman-Ford
  - Union-Find
  - MST, Kruskal
  - Segment Tree
  - Trie

## Interview Questions

### Common

- [ ] 1분 자기소개
- [ ] 본인이 했던 프로젝트 중에 제일 자신있는거
- [ ] 프로젝트를 하면서 어떤 cs 지식을 응용하였는지
- [ ] 마지막 한마디
- [ ] sk에서 인턴 했던거 채용연계형인지?
- [ ] 왜 떨어졌다고 생각하는지
- [ ] 스펙 말고 직무 역량을 키우기 위해 어떠한 노력을 했는지
- [ ] 데이터베이스 역량을 말로만 말고 증명할 수 있는게 있는지?
- [ ] 학점이 안좋은데 대학생활때 어떤것을 주로 했는지
- [ ] 본인이 학점보다 사람관계를 더 중요시 했던 이유?
- [ ] 대학전공수업 중 기억에 남는 수업
- [ ] 코딩테스트 아쉬웠던점
- [ ] 코딩테스트와 실제 개발과의 차이
- [ ] 대학 다니면서 어려웠던것, 학업
- [ ] 친구가 몇명정도 있는지? + 여가시간은 어떻게 보내는지
- [ ] 프로젝트에 대한 설명
- [ ] 의사소통 역량을 발휘했던 경험
- [ ] 인생 살면서 부정적이었던 경험(그 전에 칭찬들음)
- [ ] 칭찬에 대한 감사를 먼저 표함, 경험에 대한 설명
- [ ] 일런머스크를 존경하는 인물로 뽑은 이유 + 혁신이란 무엇이라고 생각하는지
- [ ] 클라우드가 혁신인 이유
- [ ] 교양수업 들었던 이유
- [ ] 식물과 인간의 미래는 무슨수업? + 노동법의 이해는 무슨내용?
- [ ] 클라우드 써본것
- [ ] aws 이용해본 경험 설명.
- [ ] 영어 성적이 좋지는 않은데 앞으로 더 개선할 생각이 있는지
- [ ] 인턴은 어떤일을 수행했는지 설명
- [ ] 네이버 라인의 동작과정이 어떻게 될 것 같은지
- [ ] 인턴 경험 설명 요청
- [ ] 삼성 SDS를 지원한 이유, 하고싶은 업무
- [ ] 야놀자에 지원한 이유
- [ ] 1년밖에 안됐는데 회사를 옮기려는 이유
- [ ] 본인만의 강점
- [ ] 이직사유
- [ ] 부서 내 협업 툴 사용 경험
- [ ] 블로그 글 작성하던데 어떤 이유로 작성하는지?
- [ ] 최근에 읽은 개발 서적
- [ ] 주도적으로 개발한 내용
- [ ] 개발하면서 어려웠던점과 아쉬웠던점
- [ ] 최근 공부하고 있는 내용
- [ ] 대학다니면서 어려웠던 일이 있었나요?
- [ ] 인생 살면서 부정적인 경험이 있었다면 설명해주세요
- [ ] 4차산업혁명중에서 어떤게 제일 혁신적이라고 생각하나요?
- [ ] 회사생활을 하면서 가장 중요하다고 생각하는 것
- [ ] 100억이 생긴다면 해보고싶은 사업
- [ ] 마지막 하고싶은 말
- [ ] 자기소개서를 요약해서 알려주세요
- [ ] 언제부터 프로그래밍을 하고싶었나요? 계기
- [ ] 다른 직업이 있음에도 프로그래머를 선택한 이유
- [ ] 프로젝트를 진행하면서 어려웠던 프로젝트
- [ ] 개인 프로젝트와 연구실에서 일했을때의 차이점
- [ ] 회사에서 일을 할땐 어떤게 중요하다고 생각하는지
- [ ] 의사소통을 할때 본인만의 강점
- [ ] 프로젝트 중 어떠한 것을 위주로 개발을 했는지
- [ ] IT전문회사가 아닌 은행을 지원한 이유
- [ ] 마이데이터 산업을 신한은행이 어떻게 이끌어가야할지
- [ ] 고객의 요구사항이 지나칠 때 어떻게 해결할 것인지?
- [ ] 고객이 마감기한을 빨리 요구한다면 어떻게 할것인가?

### Java

- [x] ==와 equals의 차이점
  - Java 기준, 전자는 메모리 주소를 비교한다. 후자는 오브젝트의 주소가 아닌 실제 값을 비교한다. 이때 비교가 어떻게 이루어지는지는 해당 클래스의 Equals 구현에 따라 다르다. 그러므로 전자는 논리적으로 Transitive하지만 후자는 그렇지 않을 수 있다. 즉, a.equals(b)이고 b.equals(c)이지만 a.equals(c)는 아닐 수 있다는 의미다.
  - Primitive가 == 연산으로 비교가 가능한 이유는, 자바에서 상수는 Runtime Constant Pool에 전부 들어가고 Stack의 변수 선언부가 해당 Runtime Constant Pool의 주소값을 가지기 때문이다.
    - 그런데 그러면 계산 결과로 나온 값은 ==로 비교할 수 없다는 의미인가?
- [x] Array, LinkedList, ArrayList의 차이점
  - Array
    - 물리 주소와 논리 주소가 동일하다.
    - 그러므로 인덱스 연산자의 사용이 가능하다.
    - 시간복잡도가 O(1)이다.
    - 메모리 공간이 연속적으로 구성된다.
    - 프로그래밍 언어에서 문법으로 지원한다.
    - 크기는 고정적이다.
  - List
    - Collection Framework의, 순서가 있는 데이터의 집합을 나타내는 자료구조다. 저장 공간의 크기가 고정되지 않고 가변적이며 중간에 빈 공간이 허용되지 않는다.
  - ArrayList
    - 내부적으로 Array를 이용해 자료를 저장하는 자료구조다.
    - 배열의 정적인 크기라는 한계점을 극복한다.
    - 이론상 물리 공간과 논리 공간이 동일하지만 배열을 래핑하므로 인덱스 연산자를 직접 활용하지는 못한다.
    - 배열의 크기가 커지면 내부적으로 새로운 배열을 만들어 복사한다.
    - 시간복잡도는 그러므로 배열과 동일하다.
  - LinkedList
    - 양방향 연결 리스트를 구현한 구현체다.
    - 그러므로 메모리 공간이 불연속적이다.
    - 시간복잡도는 링크드리스트의 시간복잡도를 따른다.
- [x] Call by value와 call by reference의 차이점
  - Call by value는 함수를 호출할 때 파라매터가 복사된다. Call by reference는 오직 값의 참조만이 복사된다.
- [x] 자바에서는 call by value와 reference중 어떤 것으로 호출하는가?
  - Primitive는 call by value로, Object는 reference로 호출된다.
- [x] DAO DTO VO 차이
  - DAO (Data Access Object)
    - DB에 직접 접근하여 CRUD를 수행한다.
    - Service와 DB를 연결한다.
    - Repository package.
  - DTO (Data Transfer Object)
    - 데이터 계층 간 교환을 위한 객체다.
    - getter/setter 로직을 가지지 않는다.
    - DB에서 얻은 데이터를 Service나 Controller 등으로 보낼 때 사용한다.
  - VO (Value Object)
    - 값 자체를 표현하는 리터럴의 개념이다.
    - attribute가 모두 같으면 같은 객체로 취급한다.
    - Immutable이다.
    - getter/setter 이외의 로직을 가져도 된다.
- [x] equals()와 hashCode()의 차이점
  - hashCode
    - 객체를 식별하는 하나의 정수를 반환한다.
    - hashCode가 다르면 다른 오브젝트이지만, hashCode가 같다고 같은 오브젝트임이 보장되는 것은 아니다.
  - equals
    - hashCode를 사용하여 비교한 후, 값이 같은 경우 속성을 직접 비교한다.
  - equals 내부에서 hashCode를 사용하므로 equals와 hashCode는 항상 같이 구현해야 한다. 하나만 구현하면 의도와 다르게 동작할 수 있다.

### FE

- [x] 이벤트 루프란?
  - 자바스크립트의 이벤트 루프 시스템은 다음과 같은 요소로 구성된다.
    - Call stack
    - Task Queue
    - Microtask Queue
    - Heap(for variables)
  - 이는 다음과 같은 순서로 작동한다.
    1. 콜스택을 실행한다.
    2. 실행 중 Promise인 비동기작업이 발생하면 Microtask Queue에 집어넣는다.
    3. Promise가 아닌 비동기작업이 발생하는 경우 Task Queue에 집어넣는다.
    4. 콜스택이 비는 경우, Microtask Queue에서 하나를 pop하여 Call stack에 넣는다.
    5. 콜스택이 비고 Microtask queue도 비는 경우 Task queue에서 하나를 pop하여 call stack에 넣는다.
- [x] setTimeout(…, 0)의 실행 타이밍
  - 위 이벤트루프의 동작 방식에 따라, 동기 콜스택이 비고 모든 마이크로태스크가 실행된 후에 동작한다.
- [x] 이벤트 위임이란?
  - 공통 상위 노드를 가진 많은 요소에 동일한 이벤트를 설정해야 할 때, 각 요소에 이벤트를 직접 설정하는 것이 아니라 상위 노드에서 이벤트를 받아서 대신 제어하는 방식이다.
  - HTML에서 이벤트가 캡쳐링 / 버블링 방식으로 동작하므로 가능하다.
    - 캡쳐링 : 이벤트가 상위 요소에서 하위 요소로 전파 (잘 사용되지 않음)
    - 버블링 : 이벤트가 다시 하위 요소에서 상위 요소로 전파
- [x] 일급함수란?
  - A programming language is said to have First-class functions when functions in that language are treated like any other variable.
  - To summarize, If a fucntion can be treated like a variable, it it first-class fucntion.
- [x] 호이스팅이란?
  - 함수/전역 스코프를 실행하기 전에 변수를 선언하는 것.
  - 함수, var로 선언한 변수는 hosting이 발생하지만 const나 let은 발생하지 않음. (temporal dead zones)
- [x] 클로저란?
  - 함수 내부 스코프(lexical scope)의 변수를 함수 반환 후 외부에서 접근하는 것.
  - 보통 고차함수 형식으로 사용하나 객체 기반으로도 불가능한 건 아님.
- [x] 쿠키/세션 구분 설명
  - 쿠키 :
    - 브라우저에서
    - 같은 도메인 내에서
    - 정해진 시간동안 보존되는
    - 서버에 요청을 보낼 때 함께 전송되는
    - 작은 데이터
  - 세션 :
    - 쿠키를 이용하여 구현되는 서버상의 Key-Value Store
    - 또는 개념적으로 유저가 접속해있는 동안 유지되는 컨텍스트를 말하기도 하나, 질문의 의도는 이게 아니겠지.
- [x] Web Server & Web Application Server 구분 설명
  - 사람들이 하도 섞어 써서, 완전히 깔끔하게 구분되는 개념은 아니다.
  - Web Server
    - 웹 서비스를 제공하는 H/W
    - 혹은 Static File을 실행하고 application server을 호출하는 S/W
  - Web Application Server
    - Application (including business logic) 을 구현하는 어플리케이션 서버
    - Web Server를 포함할 수도 있고 안 할 수도 있음
- [x] js에서 원시타입은 무엇이 있나?
  - string
  - number
  - bigint
  - boolean
  - undefined
  - symbol : 볼 일 없음
  - null
- undefined null 차이
  - Undefined
    - 변수가 선언되었지만 값이 할당되지 않은 상태
  - Null
    - 빈 오브젝트를 나타내는 특수한 타입
    - Therefore `typeof null === 'object'`
- [x] this란?
  - In JavaScript, the this keyword refers to an object. Which object depends on how this is being invoked (used or called). The this keyword refers to different objects depending on how it is used:
    - In an object method, this refers to the object.
    - Alone, this refers to the global object.
    - In a function, this refers to the global object.
    - In a function, in strict mode, this is undefined.
    - In an event, this refers to the element that received the event.
    - Methods like call(), apply(), and bind() can refer this to any object.
  - What is bind?
    - Bind takes a method to another mehod.
    - Usually used to preserve `this` keyword.
- [x] prototype, prototype chaining이란?
  - Prototypes are the mechanism by which JavaScript objects inherit features from one another.
  - Prototype itself is also an object, so that it has its own prototype.
  - This is called _prototype chain_ and it ends when prototype is `null`
  - When property of an object is referenced,
    - Runtime looks for property of object itself
    - If can't find it there, looks in the prototype object
      - Do this recursively.
- [x] 시멘틱 웹이란?
  - 말 그대로 의미론적인 웹. HTML Tag에서 단순히 시각적 기능만을 부여하는 것이 아니라 그 태그가 가진 의미까지 분석할 수 있도록 하는 것.
  - Semantic web의 좋은 예시는 header, footer, nav. (또는 button이나 a도 해당될 듯.)
  - Semantic web의 반대되는 예시는 모든 태그를 div로 구현하는 것.
- [x] Unknown과 Any의 차이
  - Semantically, both mean unknown type but act differently.
  - `unknown` is a type-safe counterpart of `any`.
    - Variable of `any` type can assign any type and be assigned to any type.
    - Variable of `unknown` type cannot assign any type and cannot be assigned to any type.

### Others

- [ ] HTTP/2 원리
- [ ] 디피-헬만 키 교환이란?
- [ ] 블록체인이란?
- [ ] RSA 원리
- [ ] 솔리디티 버전별 차이
- [ ] 비트코인 계정 생성 과정

### 삼성전자 2020년 상반기 DS 면접

- [x] 퀵소트 응용방법에 대해 자세히 설명해달라
  - What is quick sort?
    - Divide - and conqure 방식.
    - 중간값 찾기 등에 응용가능할 듯.
- [x] 스마트팩토리 플랫폼 개발할때 고가용성을 위해 어떤것이 필요한가?

  - 직접적인 해결책
    - 모니터링 세분화 및 경고 설정
    - 간결한 아키텍쳐 구축
    - 로그 관리
    - 보안
    - SPOF 제거하기 == 다중화
    - 프로세스 문서화
    - 아케틱쳐 문서화
    - 온보딩 전략 정의 및 수정
    - 책임을 명확하게
    - 커뮤니케이션 개선
    - 재해 복구 추가
    - 카오스 테스트
    - 아키텍쳐 모방 - 다른 회사의
    - QA 클러스터 운영하기
  - 가용성 계산식
    - $
      A(\%) = \frac{MTBF}{MTBF+MTTR}
      $
    - MTBF = Mean time between failure
    - MTTR = Mean time to recover
  - 다운타임 분석
    - 예정된 다운타임 : 30%
    - 소프트웨어 다운 : 40%
      - 서버 소프트웨어 : 30%
      - 클라이언트 소프트웨어 : 5%
      - 네트워크 소프트웨어 : 5%
    - 사람 : 15%
      - 직무태만, 부주의 등
    - 하드웨어 : 10%
    - 환경 : 5%
  - 가용성 단계
    - 1단계
      - 일반적 가용성
      - 백업 (복구 보장 안 됨)
    - 2단계
      - 가용성 증가
      - 데이터 보호 (Raid 5 or Mirroring)
    - 3단계
      - 고가용성
      - 다중화 - 일반적으로 99.98%까지 가용화 가능
    - 4단계
      - 재난 복구 시스템
      - 재난에 대한 자동복구 == failver
  - Reference
    - https://zdnet.co.kr/view/?no=00000039133853

- [x] 데이터베이스 무결성 3가지
  - Entity Integrity
    - Table must have primary key
    - Primary key must be nonnullable unique
  - Referential Integrity
    - Foreign Key must be null or valid primary key of referenced relation
    - There must be an entity in referenced table for every foreign key
  - Domain Integrity
    - Value of entity should meet its constraint
  - Null integrity
    - A condition that some property of a table cannot be null.
  - Unique integrity
    - A condition that some property of a table should be unique in that table.
  - Key integrity
    - A table must have at least one key
- [x] 관계형dbms의 특징

  - Contrast to NoSQL - Schemaless DBMS, They have schema and all fields are (by definition) cannot be nested, and should not be nested.
  - Table represent 'Relation' of elements in domains

- [x] 요즘 db 신기술에 뭐가있는지
  - 크게보면 DBMS 생태계 자체로는 Redis나 MongoDB 마냥 NoSQL이 등장했음
  - 작게 보면 다양한 DBMS들이 등장하고 있는 듯
  - DBMS말고 3 tier architecture의 repository 레이어 관점에서 볼 때, TypeORM이나 Prisma같은 새로운 형식의 ORM들이 등장 중.

### CJ 오쇼핑 2020년 상반기 1차면접 복기

- [x] 대규모 프로모션을 진행할때 고려해야할 사항, 대비방법(미리 대비, 실시간 대비)
  - 대규모 프로모션을 진행하면 대단히 많은 트래픽이 한 번에 몰릴 것으로 예상
  - 따라서 부하 테스트 등을 통해서 미리 로드를 측정해볼 필요가 있다,
- [x] 클라우드 네이티브 환경에 대한 특징
  - 쉽게 확장, 수축이 가능
  - On-Demand로 원하는 만큼, 필요할 때에만 사용 가능
  - 고가용성이 비교적 쉽게 보장됨
  - 비용이 지속적으로 든다는 단점도 존재

### 직무면접

- [ ] 프로젝트 핵심기능
- [ ] db설계 중 중점사항
- [ ] 스프링 시큐리티란 무엇인지?
- [ ] CSRF가 무엇인지?
- [ ] TCP와 UDP의 차이점
- [ ] 물류 관련 프로젝트를 해본 적이 있는지
- [ ] 자바랑 C++비교할 때 자바의 장점
- [ ] 자바의 GC 설명

### 카카오뱅크 2021 상반기 경력 면접

- [ ] 자바가 옛날엔 느렷는데 왜 그랫는지 아느냐
- [ ] 스트링이 이뮤터블인데 왜그러냐
- [ ] 스트링빌더와 스트링 버퍼 차이점
- [ ] 객체지향 5대원칙과 어떻게 그것을 적용하고 있는지
- [ ] 오버라이드 통해서 이콜스와 해시코드를 구현해서 보통 사용하는데 해본적 있는지 그리고 왜 그렇게 해야한다고 생각하는지
- [ ] 그리고 인터페이스에서 메서드를 추상이 아닌 실제 구현이 가능한데 어케 하면되는지
- [ ] orm사용은 왜하는지
- [ ] 줄게이트웨이의 1.0버전의 치명적 문제가 있는데 뭔지 아는지
- [ ] 서킷브레이커 장점- 쿠키랑 세션 차이
- [ ] 자바 버전 별 특징에 대해 아는지
- [ ] acid란 무엇인지
- [ ] 해시맵에서 해시함수를 왜쓰는지
- [ ] 쓰레드에 세이프하다는게 무슨 뜻인지
- [ ] Jvm 구조
- [ ] Gc 과정 설명

### 야놀자 2021년 수시 경력면접

- [ ] 세션 쿠키 토큰
- [ ] 디비 조회 병목현상 => 레디스
- [ ] Rest url 설계
- [ ] 디렉토리 구조 설계
- [ ] 람다
- [ ] 함수형 인터페이스
- [ ] 옵셔널
- [ ] 마이바티스 jpa 차이점
- [ ] Jpa 지연로딩, 페치조인
- [ ] 배치 이중화 처리
- [ ] 스프링 카페인 캐시 설정
- [ ] 로드밸런싱 (엔진엑스, haproxy)
- [ ] 디자인패턴(전략, 빌더, 정적팩토리메소드)
- [ ] 함수형 프로그래밍이란?
- [ ] 원하는 개발문화
- [ ] Oom경험
- [ ] Osi 7계층 설명

### 티빙 2022년 수시 경력 1차면접

- [ ] 자바 8 버전 특징 ​
- [ ] 자바 스트림 특징 ​
- [ ] 자바 옵셔널 특징 ​
- [ ] 자바 11과 자바8차이 ​
- [ ] 스프링부트 버전 ​
- [ ] 최신 서비스 개발 시, 어떤 언어, 프레임워크 사용하고싶은지 ​
- [ ] JPA에서 옵셔널 리턴해줄때 어떻게 처리하는지, 서비스단에서 처리하는지? ​
- [ ] 엔티티에서 DTO 변환할때 어떤 유틸 클래스 쓰는지, 엔티티 내에서 xxxToDTO 메소드 만드는지? ​
- [ ] 객체지향 원칙 Solid에서 사용해본거 ​
- [ ] 전략패턴 설명 ​
- [ ] 정적 팩토리 메소드 설명 ​
- [ ] 회원가입 요청이 갑자기 많이 늘어났을 때 어떻게 할 것인지, 인프라적으로, 애플리케이션적으로 나눠서
- [ ] 스프링 클라우드, 서킷브레이커, 카프카, fast fail 방법 (API Timeout)
- [ ] 테스트 코드 작성은 어떻게 하고 있는지
- [ ] 서비스 클래스 설계할때 중점적으로 생각하는 것
- [ ] 프론트엔드와 백엔드 중 백엔드 선택 이유
- [ ] 회사내에서 주도적으로 기존 코드를 수정한 경험
- [ ] JVM에서 GC 동작과정
- [ ] application.yaml파일에 있는 설정값들이 동작하는 과정​

### 티빙 2022년 수시 경력 2차면접

- [ ] JVM 동작과정 설명
- [ ] static 명령어 사용하는 이유
- [ ] Http랑 tcp 차이
- [ ] Osi7계층 구분 이유
- [ ] 브라우저에서 검색창에 youtube.com 입력했을때 동작과정
- [ ] 뮤텍스와 세마포어 차이
- [ ] 자바 스레드 동시성이슈 해결법
- [ ] Jvm튜닝경험
- [ ] Jvm oom 해결방법
- [ ] Jmeter 경험
- [ ] 플젝 질문들
- [ ] 스프링 프레임워크의 동작 원리 (DI, IOC)

### 2022년 네이버 파이낸셜 상반기 경력 공채 1차면접

- [ ] 정산 솔루션에 쓰이는 기술
- [ ] 스프링 배치, 쿼츠 스케줄러, 카프카
- [ ] 네이버페이랑 어떻게 연동되는지
- [ ] 네이버 자산관리랑 어떻게 연동되는지(소비자 관점에서)
- [ ] 클린코드에 대해 어떻게 구현하는지
- [ ] 테스트 코드를 짤때 본인만의 노하우
- [ ] 스프링을 사용하는 이유
- [ ] 스프링의 구동방식
- [ ] JPA에서 복잡한 쿼리 사용
- [ ] 인덱스 사용 의의
- [ ] 인덱스 사용 주의사항
- [ ] 인덱스에 사용된 자료구조
- [ ] B-tree와 인덱스 사용 주의사항을 연관지어 설명
- [ ] 클라이언트에서 http요청을 보낼때 스프링에서 어떻게 동작하는지
- [ ] 이직하는 이유
- [ ] 자바 static의 생존주기
- [ ] 일반 객체의 생존주기
- [ ] 클래스에 대한 정보는 언제 메모리에 올라가는지
- [ ] 16,17을 고려해서 18을 설명
- [ ] 자신이 갖고있는 장점
- [ ] AOP 설명
- [ ] Transactional Annotation 동작과정 설명
- [ ] 스프링에서 ioc와 di를 안쓰고 코드 작성이 가능한지
- [ ] 유명한 보안취약점에 대해 설명
- [ ] 테스트 코드 짤 때 mocking 쓰는지, 장점?
- [ ] filter 사용 위치
- [ ] HTTP 특성에 대해 설명
- [ ] 세션, 쿠키에 대한 설명, X-Forward-For, JessionID

### 2022년 상반기 네이버 파이낸셜 경력 공채 2차면접

- [ ] 기획자가 로그를 100만개 찍어달라고 요구했을때 해결방안
- [ ] 파일을 만드는것이 db에 저장하는거보다 빠른 이유
- [ ] 쿠폰을 생성할때, 어떻게 만들어야 다른사람이 임의로 쿠폰번호를 입력했을때 문제가 발생하지 않을 수 있는지
- [ ] 내부클래스 생성 시, static을 붙인것과 안붙인것의 차이
- [ ] 자바의 철학이란?
- [ ] 회원 테이블 식별자 어떻게 사용하는지

### 쏘카 2022년 수시 경력 1차면접

- [ ] 스프링 카페인 캐시 사용 이유
- [ ] 레디스 쓰지않은 이유
- [ ] 2번으로 인한 문제점
- [ ] 현재 회사 개발자 구성
- [ ] 로드밸런싱 어떻게 구성되어있는지
- [ ] 단위테스트를 어떻게 짜고있는지
- [ ] 테스트 커버리지에 대한 문제점
- [ ] 도커 서비스 트러블 슈팅 경험
- [ ] 스프링 클라우드 컨피그 서버와 스프링 부트 액츄에이터 적용 경험, 액츄에이터의 매트릭스에 대해 아는지?
- [ ] ReflectionUtils 사용경험
- [ ] Mockito 사용경험
- [ ] 코드 리뷰 경험
- [ ] 라이브코딩 진행
  - [ ] 무한등비급수 라이브 코딩 + 리팩토링 + 클린코드 + 네이밍
- [ ] JPA와 mybatis를 둘다 쓰는 이유
- [ ] 세션 스케쥴링을 하는 이유
- [ ] 세션 만료시간이 없는건지?

### 쏘카 2022년 수시 경력 2차면접

- [ ] 1차면접때 본 라이브코딩을 가지고 단위테스트 라이브코딩
- [ ] 3시간전에 올라온 글이 있던데 그에 대한 질문 > 클래스로딩 시점
- [ ] 왜 클래스로딩에 대해 궁금하게 되었는지? > 스프링 싱글톤 -> 멀티스레딩 -> 스레드 세이프 -> 스레드 풀 -> static은? -> 클래스로딩 순으로 공부

### 지그재그(카카오스타일) 수시 경력 1차면접

- [ ] 단위테스트 레이어별로 작성 전략 및 mocking
- [ ] 단위테스트 작성 시 중요하게 생각하는점
- [ ] JAVA8의 default GC란?
- [ ] 스프링 Transactional 어노테이션 설명
- [ ] java8 GC 설명
- [ ] GC가 중요한 이유
- [ ] 단위 테스트 작성할때 시간 관련된 코드는 어떻게 하는지
- [ ] Transactional 어노테이션을 같은 클래스에서 호출하는 경우?
- [ ] Transactional 어노테이션이 Checked Exception과 Unchecked Exception에서 어떻게 동작하는지
- [ ] Transactional 어노테이션 전파레벨
- [ ] JPA의 N+1 문제

### 면접대비

- [ ] 자바의 final 키워드가 적용되는 세가지 경우에 대해 설명해주세요
- [ ] final키워드와 finally, finalize의 차이점을 말해주세요
- [ ] 자바 api 정렬에서 Arrays.sort()는 어떤 정렬 알고리즘을 사용하나요? 최악의 경우 시간복잡도는? Arrays.sort()의 대안은?
- [ ] 자바 optional에 대해 설명해주세요
- [ ] 자바 static키워드의 생성시기와 소멸시기를 설명해주세요
- [ ] 자바의 객체 리플렉션에 대해 설명해주세요.
- [ ] Jdbc에 대해 설명해주세요
- [ ] JVM의 구조에 대해 설명해주세요
- [ ] 자바 소스코드가 JVM을 통해 실행되는 과정을 설명해주세요
- [ ] 가비지 콜렉터가 동작하는 과정을 설명해주세요
- [ ] 자바에서 Runnable인터페이스와 Thread 클래스의 차이점을 설명해주세요
- [ ] 이렇게 두가지 방법이 지원되는 이유를 설명해주세요
- [ ] 자바의 String/ StringBuffer/ StringBuilder의 차이점에 대해 설명해주세요
- [ ] 자바의 String 객체 생성시 리터럴로 생성하는 것과 new String()으로 객체를 생성하는 것의 차이점을 설명해주세요
- [ ] 자바의 Wrapper class에 대해 설명해주세요
- [ ] 자바의 boxing과 unboxing에 대해 설명해주세요
- [ ] 자바의 가비지 콜렉터에서 메모리 영역에 대해 설명해주세요
- [ ] 가비지 콜렉터의 동작과정을 설명해주세요
- [ ] 객체지향의 장점과 단점을 설명해주세요
- [ ] 객체지향의 특징을 설명해주세요(3가지 물어볼경우와 5가지 물어볼경우에 답이 다름)
- [ ] 멀티스레딩의 장단점에 대해 설명해주세요
- [ ] 생성자란 무엇인가요?
- [ ] 싱글톤 패턴이란 무엇인가요?
- [ ] 싱글톤 객체의 필요성에 대해 설명해주세요
- [ ] 자바에서 싱글톤 패턴을 구현하는 방법은? (3가지중에서 최적의 방법)
- [ ] 자바의 접근제한자에 대해 설명해주세요
- [ ] 파이썬은 접근제한자가 없는데 어떻게 구현해야하나요?
- [ ] 자바의 추상클래스와 인터페이스의 차이점에 대해 설명해주세요
- [ ] 데이터베이스 무결성 3가지에 대해 설명해주세요
- [ ] 관계형 데이터베이스와 비관계형 데이터베이스에 대해 설명해주세요
- [ ] 트랜잭션에 대해 설명해주세요
- [ ] 트랜잭션 ACID에 대해 설명해주세요
- [ ] 트랜잭션 고립성 수준에 대해 설명해주세요
- [ ] Non-repeatable read와 Phantom Read의 차이점에 대해 설명해주세요
- [ ] DB인덱스 설정 시 고려해야할 점을 설명해주세요. 성별과 주민등록번호 중에 어떤 것을 인덱스로 해야할까요? 그 이유는?
- [ ] SQL 인젝션 공격에 대해 설명해주세요
- [ ] SQL인젝션 공격을 막는 방법 중 하나인 prepared statement에 대해 설명해주세요
- [ ] 파이썬은 이것으로 간단하게 sql 인젝션 공격을 막을 수 있습니다. 이것은 무엇일까요?
- [ ] DB정규화에 대해 설명해주세요
- [ ] 정규화의 목적은 무엇인가요?
- [ ] TCP 3way handshaking과 4way handshaking의 차이를 설명해주세요
- [ ] 동기와 비동기 호출에 대해 설명해주세요
- [ ] CDN에 대해 설명해주세요
- [ ] CORS에 대해 설명해주세요
- [ ] HTTP에 대해 설명해주세요
- [ ] HTTP 메소드에 대해 설명해주세요
- [ ] HTTP Get과 Post의 차이점에 대해 설명해주세요
- [ ] HTTP 상태코드 401과 403의 차이점에 대해 설명해주세요
- [ ] HTTP와 HTTPS의 차이점에 대해 설명해주세요
- [ ] IPv6의 특징에 대해 설명해주세요
- [ ] 웹서버에 대해 설명해주세요
- [ ] Was(웹 어플리케이션 서버)에 대해 설명해주세요
- [ ] Nginx에 대해 설명해주세요
- [ ] Nginx와 Apache의 차이점에 대해 설명해주세요
- [ ] 프록시 서버란 무엇인가요?
- [ ] 포워드 프록시와 리버스 프록시에 대해 설명해주세요
- [ ] OSI 7계층이 존재하는 목적에 대해 말해주세요
- [ ] API란 무엇인가요?
- [ ] 그렇다면 REST API란 무엇인가요?
- [ ] 세션과 쿠키의 차이점에 대해 말해주세요(3가지)
- [ ] TCP와 TCP/IP에 대해 각각 설명해주세요
- [ ] 그렇다면 인터넷브라우저(크롬 등)의 주소창에 www.naver.com을 입력했을때 동작과정을 설명해주세요
- [ ] 브로드캐스트, 멀티캐스트, 유니캐스트에 대해 설명해주세요
- [ ] 브로드캐스트와 멀티캐스트는 어떤 차이가 있나요?
- [ ] UDP에 대해 설명해주세요
- [ ] UDP와 TCP의 차이에 대해 설명해주세요
- [ ] 웹 스토리지란 무엇인가요?
- [ ] 웹 스토리지와 쿠키의 차이점은 무엇인가요?
- [ ] 소켓이란 무엇인가요?
- [ ] 포트란 무엇인가요?
- [ ] 로드밸런서란 무엇인가요?
- [ ] L4 로드밸런싱과 L7 로드밸런싱의 차이에 대해 말해주세요
- [ ] 프로세스와 스레드의 차이에 대해 말해주세요
- [ ] 멀티스레딩에서 한 스레드에서 기존 작업을 중단하고 다른 스레드에서 새로운 작업을 처리한 다음 다시 원래 작업을 하려할때 어떻게 정보를 기억하나요?
- [ ] 멀티 프로세스의 장단점을 말해주세요
- [ ] 멀티 스레드의 장단점을 말해주세요
- [ ] IPC의 3가지 방법을 말해주세요
- [ ] 프로세스를 구성하는 저장공간 중 스택과 힙 중 무엇이 더 빠른가요?
- [ ] 선점 스케줄링과 비선점 스케줄링 기법을 각각 하나씩 말해주세요
- [ ] 라운드로빈 스케줄링에 대해 설명해주세요
- [ ] 뮤텍스와 세마포어의 차이점에 대해 설명해주세요
- [ ] 데드락이란 무엇인가요?
- [ ] 데드락의 발생 조건을 말해주세요
- [ ] 데드락 회피기법 중 은행원 알고리즘에 대해 말해주세요
- [ ] 내부 단편화와 외부 단편화에 대해 설명해주세요
- [ ] 페이징 기법에 대해 설명해주세요
- [ ] 페이징 알고리즘 중 FIFO의 단점에 대해 설명해주세요
- [ ] 세그멘테이션 기법에 대해 설명해주세요
- [ ] 캐시 동작의 원리 중 시간지역성과 공간지역성에 대해 설명해주세요
- [ ] 컴파일러와 인터프리터의 장단점에 대해 말해주세요
- [ ] 자바스크립트 호이스팅에 대해 말해주세요
- [ ] 자바스크립트 var, let, const의 차이에 대해 말해주세요
- [ ] 콜백 함수란 무엇인가요?
- [ ] 콜백함수의 문제점과 해결책은 무엇인가요?
- [ ] Ajax란 무엇인가요?
- [ ] 가상 돔이란 무엇인가요? 이러한 개념이 등장한 이유는?
- [ ] SPA란 무엇인가요?
- [ ] MVVM 패턴에 대해 설명해주세요
- [ ] (자료구조) 구구단, 이진탐색, 퀵소트, 해시맵의 시간복잡도를 설명해주세요
- [ ] (자료구조) DP와 재귀함수 중 어떤것을 더 선호하나요?
- [ ] (운영체제) 펌웨어와 운영체제 그리고 커널에 대해 설명해주세요
- [ ] (운영체제) 인터럽트와 폴링에 대해 설명해주세요
- [ ] (네트워크) TCP의 3way handshaking과 4way handshaking 과정을 그려주세요
- [ ] (데이터베이스) NoSQL이란 무엇인가요?
- [ ] (데이터베이스) DB 이력관리 중 선분이력이란 무엇인가요?
- [ ] (자바) 상속관계에서 생성자 호출 순서를 설명해주세요
- [ ] (스프링) 스프링 시큐리티란 무엇인가요?
- [ ] (스프링) JWT의 구조에 대해 설명해주세요
- [ ] (스프링) 스프링 프레임워크를 사용하는 이유는 무엇인가요?

### 신한카드 2020 수시 신입 최종면접

- [ ] 클라우드 (IaaS, PaaS, SaaS) 에 대해 쉽고 알아듣기 편하게 설명해봐라
- [ ] 클라우드 사업을 하는 것에 대한 단점 및 보완방법
- [ ] 웹 개발을 할 때 기술적으로 중요하다고 생각하는 것
- [ ] 신한카드 IT 서비스 중에서 개선해야된다고 생각하는 것
- [ ] IT역량중에 본인들이 특히 자신있는 기술스택

### 패브릭타임 2020 수시 신입 1차면접

- [ ] Spring 에서 동시성 이슈 처리 방법.
  - ex) 동시에 동일한 Request가 들어오는 경우, 어떻게 처리해야할까?
- [ ] Spring 에서 Circular Dependency 를 피하기 위해서는 어떻게 해야할까?
- [ ] Spring 으로 서버를 두었을때, 무중단 배포 방법.​
- [ ] Scenario Case 질문
  ```
  Spring으로 만든 서버에서, black list ip를 관리 및 서버를 보호하고 싶다.
  black list ip는 ip4의 형태로 관리되며, 그 형태는
  192.168.0.1(32bit),
  192.168.0.xxx(24bit),
  192.168.xxx.xxx(16bit),
  192.xxx.xxx.xxx(8bit)
  와 같이 상위 8n bit로 판변한다고 할때,
  DB 구성 및 Request 마다 판별하는 방법은?
  (black list ip는 약 10만개, 초당 리퀘스트는 100개로 가정)
  ```

### 룩핀 2020 수시 신입 인터뷰

- [ ] 시간복잡도가 중요한 이유
- [ ] O(N^2) / O(logN) 시간복잡도를 가지는 자료구조
- [ ] Array와 Set의 차이점

### 이스트소프트 2020 공채 신입

- [ ] 인덱스 복합키 설정을 어떻게 했는지​
- [ ] HTTP와 HTTPS의 차이점
- [ ] HTTP Body란?
- [ ] Get과 Post의 차이점
- [ ] Rest API란
- [ ] 데이터 중복이 많은 열과 적은 열 중 어떠한 것을 인덱스로 만들어야하는지
- [ ] 스프링 IOC와 DI란?
- [ ] DI의 장점
- [ ] 단방향 암호화와 양방향 암호화
- [ ] 도커란 무엇인지
- [ ] 프로세스와 스레드의 차이점
- [ ] 리눅스에서 kill 명령어

### 위메프 2020년 상반기 신입공채 1차면접

- [ ] 애너그램인지 아닌지 확인하는 라이브코딩
- [ ] c에서 call by value vs call by reference
- [ ] c에서 동적할당 및 해제 방법
- [ ] c에서 동적할당된 메모리가 다른 곳에서도 쓰이고 있을때 한쪽에서 해제한다면 어떤 문제가 발생하는지와 그 해결방법
- [ ] 자바의 추상클래스 vs 인터페이스
- [ ] final 명령어를 변수, 클래스, 메소드에 붙였을때 생명주기
- [ ] string을 따옴표 선언했을때와 new로 선언했을 때의 차이
- [ ] 재귀함수로 팩토리얼 구현하기
- [ ] 구구단의 이진탐색/ 퀵소트/ 해시맵 간 시간복잡도 차이
- [ ] 싱글턴 패턴이란? 용도는?
- [ ] 토론면접 + 개별질문 (2:8)
  1.  토론 주제 : 전산시스템을 개발할 때 통합개발을 해야하는지 부서별 개발을 해야하는지
  2.  토론에 대한 개별질문 1개씩
  3.  대한항공에 와서 어떠한 프로그램을 개발하고 싶은지
  4.  DT 중에 어떠한 것을 해보고 싶은지
  5.  애자일 프로세스를 아는지
  6.  하이브리드 앱과 네이티브 앱의 차이점

### E1 2019년 하반기 신입공채 1차면접

실무진 면접

- [ ] 재귀함수와 DP중 시간복잡도가 낮은것, 어떤 것을 더 선호하는지? 그 이유?
- [ ] 프로젝트 관련 질문​ -토론면접(협상토론 - 갑사와 을사간의 실제 협상처럼 진행 - 중요도 떨어짐) -코딩테스트(2문제/DFS(재귀)/완전탐색(BFS))

### 해외 기업 면접

- [ ] MAU가 10억정도 되는 서비스를 디자인해봐라.
- [ ] 카프카 구조는?
- [ ] 카프카가 reliability를 보장할 수 있는 이유는?
- [ ] ETag http header란?
- [ ] HTTP/2?3 에서 Connection Header재사용이 막힌 이유는?
- [ ] HTTP UDP Based로 바뀐 이유는?
- [ ] QUIC 설명
- [ ] CSSOM?
- [ ] SSL이란?
- [ ] OAuth 설명 - 구조 그려봐라
- [ ] TCP UDP 차이는?
- [ ] TCP Connect Disconnect에 대해 설명해봐
- [ ] 정규화 비정규화 예시 들어서 설명해봐
- [ ] 데브옵스가 뭐야?
- [ ] 성능테스트에서 얻었던 인사이트는?
- [ ] CI/CD 파이프라인은?
- [ ] 쿠버네티스 사용해서 컨테이너 배포 말고 그냥 배포는 어떻게 할 거야?
- [ ] 모니터링 해봤니?
- [ ] 프로메테우스가 뭘 위한 도구인지?
- [ ] 우리가 모니터링할 매트릭이 뭐가 있나?
- [ ] 프로메테우스가 어떻게 로그를 저장하지?
  - 그게 단점인데 어떻게 보완할까?
- [ ] 트러블 슈팅 경험은?
- [ ] 어떤 툴을 썼는지?
- [ ] 플랫폼은 어떤 아키텍쳐로 만들 건지?
- [ ] IaC써봤는지?
- [ ] 어떤 서비스를 만들고 싶은지? e.g. Google Health Check
- [ ] 0.1 + 1.1 == 1.2 틀린 이유

## Interesting Posts / Blogs

- https://frogred8.github.io/docs/014_cache_line/
- https://github.com/boostcamp-ai-tech-4/ai-tech-interview
- https://github.com/JaeYeopHan/Interview_Question_for_Beginner
- https://github.com/gyoogle/tech-interview-for-developer
- https://github.com/ksundong/backend-interview-question
- https://github.com/WooVictory/Ready-For-Tech-Interview
