---
title: 공유 오브젝트(.so)란 무엇인가?
tags:
  - computer science
date: 2024-10-17T22:48:20.172Z
---

최근 개인 프로젝트를 진행 중 공유 라이브러리 패키지 배포에 관한 이슈가 있었다. 문제를 정확하게 이해하고자 공유 오브젝트에 대한 내용을 다시 공부해서 이를 정리한다.

![alt text](image.png)

## 라이브러리

일반적으로 라이브러리는 정적 라이브러리(static library)와 공유 라이브러리(shared library)로 나뉜다. 공유 라이브러리는 동적 라이브러리(dynamic library)라고 부르기도 하며, 전자는 유닉스 계열의 운영체제에서, 후자는 윈도우즈 운영체제에서 사용하는 용어다. 본문에서는 리눅스 운영체제를 다루므로 이하 공유 라이브러리로 통일한다.

#### 정적 라이브러리

정적 라이브러리란 가장 직관적인 형태의 라이브러리로, 컴파일 타임에 타깃 바이너리에 복사되어 포함되는 형태의 라이브러리를 말한다. 정적 라이브러리는 `.a` 확장자를 가지며 이는 archive의 약자다.

#### 공유 라이브러리

공유 라이브러리는 런타임에 로드되어 여러 프로그램에 의해 함께 사용될 수 있는 라이브러리다. 공유 라이브러리는 공유 오브젝트(shared object) 파일 `.so` 형식을 가진다.

#### 정적 라이브러리와 공유 라이브러리의 장단점

- 정적 라이브러리는 그 자체가 프로그램에 포함되므로 버전 관리가 명확하며 실행 환경 의존성이 적다.
- 반면 공유 라이브러리는 프로그램이 실행되는 환경에 어떤 버전이 설치되어있는지에 따라 다르게 동작할 수 있다. 그리고 만약 필요한 라이브러리가 설치되어있지 않다면 실행이 불가능하다.
- 정적 라이브러리는 만약 그 라이브러리가 여러 프로그램에서 공통적으로 요구된다면 불필요한 중복으로 용량이 커지며 런타임에 메모리를 많이 차지할 수 있다.
- 반면 공유 라이브러리는 그러한 문제를 줄일 수 있다.

이러한 장단점은 라이브러리가 다른 많은 라이브러리를 참조하여 복잡한 관계를 가질 때 더 명확히 드러난다. 만약 정적 라이브러리만을 사용한다면 바이너리 크기가 무척 커질 것이다. 반면 공유 라이브러리를 사용하는 경우 여러 버전이 혼재하면서 의존성 및 버전의 관리가 무척 힘들어질 수 있다.

## 공유 라이브러리를 사용하는 프로그램의 빌드

> 프로그램이 빌드되는 과정은 실행 파일 형식에 따라 달라진다. 본문에서는 Excutable and Linkable Format (ELF)를 기준으로 설명한다.

프로그램의 빌드 과정은 아래와 같은 단계로 나뉜다.

- 전처리
- 컴파일
- 어셈블
- 링킹

일반적으로 빌드를 할 때는 `gcc`등의 유틸리티를 이용하여 소스코드로부터 곧바로 바이너리를 얻는다. 그러나 `gcc`는 실제로는 `cpp`(전처리기), `cc`(컴파일러), `as`(어셈블러), `ld`(링커)와 같은 독립적인 프로그램들을 사용하는 프론트엔드이며, 실제 작업은 이와 같은 세부적인 단계의 조합으로 이루어진다.

#### 컴파일과 어셈블

컴파일러는 C언어로 작성된 코드를 어셈블리어로 변환하며 어셈블러는 어셈블리어를 기계어로 변환한다. 이때 함수나 전역 변수와 같은 심볼의 위치는 컴파일/어셈블 타임에는 결정될 수 없다. 컴파일러와 어셈블러는 소스 파일 단위로 동작하므로 다른 오브젝트 파일이나 라이브러리에 대해서는 알지 못하기 때문이다. 따라서 컴파일러는 함수나 전역 변수를 사용하는 명령어에 실제 주소값이 아닌 stub을 넣어둔다.

이는 이후 링킹 과정에서 실제 메모리 주소로 대체되는데 이를 재배치(relocation)라 한다. 재배치가 필요한 명령어들의 위치는 재배치 항목(relocation entry)에 기록된다. 이는 ELF 파일의 `.rel` 또는 `.rela` 섹션에 저장되는데 구체적으로는 재배치가 필요한 명령어의 오프셋과 어떤 심볼의 재배치가 필요한지가 기록되어있다. 아래는 재배치 테이블의 예시다.

```text
Relocation section '.rela.text' at offset 0x2e0 contains 4 entries:
  Offset          Info           Type           Sym. Value    Sym. Name + Addend
00000000000a  000a00000002 R_X86_64_PC32     0000000000000000 global_var - 4
000000000032  000b00000004 R_X86_64_PLT32    0000000000000000 print_global_var - 4
...하략
```

그리고 이러한 재배치가 이루어지기 위해서는 해당 오브젝트 파일에 어떤 심볼들이 포함되어있는지에 대한 정보도 필요하다. 이는 심볼 테이블에 저장되며 ELF 헤더의 `.symtab`이라는 섹션에 저장된다. 심볼 테이블은 심볼 이름, 유형, 데이터 크기, 해당 심볼이 로드될 메모리 주소 등을 포함한다. 단 링킹이 끝나기 전에는 메모리 주소를 결정할 수 없기 때문에 링킹 이전에는 심볼의 오브젝트 파일 내에서의 상대 위치가 기록되며 링킹 과정에서 대치된다. 아래는 링킹 이전의 심볼 테이블의 예시다.

```text
Symbol table '.symtab' contains 15 entries:
   Num:    Value          Size Type    Bind   Vis      Ndx Name
    ...중략
    10: 0000000000000000     4 OBJECT  GLOBAL DEFAULT    4 global_var
    11: 0000000000000000    36 FUNC    GLOBAL DEFAULT    1 print_global_var
    ... 중략
    13: 0000000000000000     0 NOTYPE  GLOBAL DEFAULT  UND printf
    14: 0000000000000024    25 FUNC    GLOBAL DEFAULT    1 main
```

이때 `NDX` 필드는 심볼이 속한 섹션을 나타낸다. printf의 `UND`는 이 심볼이 외부에서 정의되었음을 의미한다.

#### 링킹

링커는 이렇게 생성된 여러 오브젝트 파일들을 결합한다. 이를 위해 링커는 먼저 심볼 테이블들을 해결(resolve)한다. 이 과정에서 링커는 각 심볼의 절대 주소를 결정하고 심볼 테이블에 기록되었던 상대 주소를 절대 주소로 업데이트한다. 이후 링커는 재배치 항목을 읽어 명령어에 포함된 심볼들을 재배치한다.

이때 만약 빌드 중 오브젝트 파일을 링킹하거나 정적 라이브러리를 사용하는 경우에는 링커가 재배치 항목을 실제 메모리 주소로 대체한다. 그러나 공유 라이브러리는 런타임에 로드되기 때문에 공유 라이브러리가 사용되는 경우 컴파일 타임에는 공유 라이브러리에 포함된 심볼의 위치를 결정할 수 없다. 이때는 Procedure Linkage Table (PLT)와 Global Offset Table (GOT)라는 매커니즘이 사용되는데, 이는 다음 섹션에서 설명한다. 링킹이 완료된 이후에는 심볼 테이블이 필요하지 않다. 다만 공유 라이브러리에 정의된 심볼들은 유지해야 하는데 이는 `.dynsym` 섹션에 유지된다.

> 공유 라이브러리나 실행 파일을 빌드하면 기본적으로 디버깅을 위해 불필요한 심볼 테이블이 포함된다. 용량이 무척 중요한 상황이라면 `strip` 유틸리티를 사용해서 불필요한 심볼을 제거할 수 있다.

## 동적 링커

동적 링커는 프로그램이 런타임에 공유 라이브러리를 사용할 수 있도록 해 주는 프로그램이다. 동적 링커는 프로그램이 실행되는 시점에 ELF 헤더의 `.dynamic` 섹션을 읽어 필요한 공유 라이브러리를 메모리에 로드한다. 그리고 실행 도중 공유 라이브러리의 참조가 일어나는 경우 앞서 언급한 PLT와 GOT라는 매커니즘으로 이를 처리한다.

먼저 링킹 과정에서 공유 라이브러리의 심볼을 사용하는 경우 명령어가 절대 주소를 참조하는 대신 PLT 엔트리로 점프하도록 대치된다. PLT는 프로그램 실행 시 `.dynsym` 섹션으로부터 구성되며 PLT의 각 엔트리는 해당하는 GOT 엔트리의 함수를 실행하는 몇 개의 간단한 명령어로 이루어진다. GOT 엔트리는 초기에는 실제 라이브러리의 주소 대신 동적 링커라는 프로그램의 주소를 가리키도록 설정되어 있다. 동적 링커는 공유 라이브러리로부터 적절한 심볼을 찾아 GOT가 해당 심볼을 가리키도록 업데이트한 후 그 함수를 실행한다. 그러므로 처음에는 공유 라이브러리의 심볼을 참조할 때 동적 링커가 호출되지만 이후에는 공유 라이브러리의 심볼이 곧바로 참조된다.

그런데 동적 링커는 그 자신 역시 공유 라이브러리다. 따라서 동적 링커를 로드하기 위해 동적 링커가 필요한 문제가 발생한다. 그래서 ELF 파일의 `.interp` 섹션에는 동적 링커의 위치가 포함되어 있으며 프로그램의 진입점 코드에 동적 링크를 메모리에 로드하는 코드가 포함되어있다. 그래서 동적 링커를 링킹하기 위해 동적 링커가 필요한 문제는 발생하지 않는다. 또한 이러한 이유로 동적 링커는 그 위치가 정해져있어야 하며 이는 표준으로 `/lib/ld.so`, `/lib/ld-linux.so` 또는 `/lib64/ld-linux-x86-64.so`으로 정해져있다.

> ELF 헤더를 수정하여 다른 동적 링커를 사용하는 것도 가능하다. 그러나 다른 시스템에서는 프로그램을 실행할 수 없을 것이다.

또한 동적 링커 역시 외부 공유 라이브러리에 의존할 수 있다. 그래서 동적 링커는 자기 자신의 의존성을 먼저 해결하는 초기화 과정을 포함한다.

## 링커의 공유 라이브러리 탐색

공유 라이브러리는 프로그램에 포함되지 않는다. 그러나 링커가 링킹을 올바르게 수행하기 위해서는 컴파일 시에도 공유 라이브러리를 참조할 수 있어야 한다. 왜냐하면 정의되지 않은 심볼이 있는 경우 공유 라이브러리에서 그것을 찾아야 하기 때문이다.

정의되지 않은 모든 심볼을 런타임에 공유 라이브러리에서 찾도록 설정할 수도 있다. 그러나 그렇게 하면 개발자의 실수로 심볼을 정의하지 않은 경우 컴파일 타임에 이 실수를 발견할 방법이 없기 때문에 일반적으로는 그렇게 해서는 안 된다.

> 정의와 선언은 다르다. 정의와 관계없이 선언이 되어 있지 않으면 컴파일 시 반드시 오류가 발생하게 된다.

링커는 다음과 같은 순서로 공유 라이브러리를 탐색한다.

1. 컴파일 옵션 (`-L`)으로 지정된 경로
1. `/lib`, `/usr/local/lib` 등 gcc 표준 라이브러리 경로
1. `LD_LIBRARY_PATH` 환경 변수
1. `rpath`, `runpath` 로 지정된 경로 (아래 섹션에서 설명)
1. 그 외 기타

`-L` 옵션은 여러 개 줄 수 있으며, 같은 경로를 여러 번 지정해도 문제가 발생하지는 않는다. 링커는 위 순서대로 탐색했을 때 가장 처음으로 검색된 라이브러리를 선택하며 이후에 같은 이름의 라이브러리가 발견되더라도 무시한다.

## 동적 링커의 공유 라이브러리 탐색

동적 링커는 다음과 같은 순서로 공유 라이브러리를 탐색한다.

1. ELF 헤더의 `RPATH`에 설정된 경로 (단 `RUNPATH` 설정이 없는 경우)
1. `LD_LIBRARY_PATH`로 지정된 경로
1. ELF 헤더의 `RUNPATH`에 설정된 경로
1. 캐시 파일 `/etc/ld.so.cache`에 지정된 경로
1. 런타임 링킹 규칙 파일 `/etc/ld.so.conf`
1. 기본 시스템 라이브러리 경로 `/lib`, `/usr/local/lib` 등

> RPATH는 예전에 사용되던 설정으로 `LD_LIBRARY_PATH` 환경변수를 무시하기 때문에 최근에는 사용하지 않는다. 그리고 `LD_LIBRARY_PATH`는 디버깅이나 테스트 용도로 사용되는 경로로, 배포할 때 이 경로에 의존하거나 이 경로를 변경하면 안 된다.

## 공유 라이브러리의 관리

시스템에는 공유 라이브러리를 관리하기 위한 잘 설계된 버전 관리 정책이 필요하다. 왜냐하면 공유 라이브러리는 업데이트를 거치며 여러 버전이 존재할 수 있고 여러 프로그램은 각기 다른 버전의 공유 라이브러리에 의존할 수 있기 때문이다. 그리고 프로그램이 실행되는 도중에 라이브러리가 업데이트되기도 한다. 리눅스에서는 이러한 문제를 해결하기 위해 라이브러리 파일의 이름과 심볼릭 링크를 사용하여 공유 라이브러리의 버전을 관리한다.

리눅스에서 모든 라이브러리는 적어도 두 개의 이름을 가진다.

- `real name`: 실제 라이브러리 파일의 이름으로 `libmylib.so.1.2.3`과 같이 자세한 버전 번호를 포함한다.
- `soname`: 라이브러리의 호환성을 나타내는 특별한 이름으로, 다음 규칙을 따른다.
  - `lib` 접두사로 시작한다. 특별한 예외로 C언어 최하위 라이브러리는 `lib`접두사로 시작하지 않는다.
  - `.so` + 메이저 버전 번호. 메이저 버전이란 라이브러리의 Application Binary Interface (ABI)가 바뀌지 않는 업데이트를 말한다. 즉, 그 내부 동작이 달라질지라도 메이저 버전이 같으면 코드 레벨에서 호환된다.
- 일반 이름: 필수가 아니며 개발을 위해 사용되는 이름이다. `libmylib.so` 처럼 단순히 라이브러리 이름에 `.so` 확장자가 붙는다.

예를 들어 `libmylib.so.1`은 적절한 soname이다.

> `soname`은 _소-네임_ 또는 _에스-오-네임_ 으로 읽는다.

리눅스에서는 이러한 soname을 갖는, 실제 라이브러리 파일에 대한 심볼릭 링크를 생성한다. 그리고 실제 프로그램은 real name이 아닌 soname을 참조해야만 한다. 이렇게 함으로써 프로그램은 마이너 버전이 다른 라이브러리가 설치된 경우에도 그 호환성을 유지할 수 있다. 개발자 또한 배포할 때 ABI가 달라지면 반드시 메이저 버전을 업데이트해야만 한다.

이에 따라 공유 라이브러리는 다음과 같은 심볼릭 링크 구조를 가진다.

```text
libmylib.so.1 -> libmylib.so.1.2.3 (심볼릭 링크, 동적 링커가 참조)
libmylib.so.1.2.3 (실제 라이브러리 파일)
```

soname을 갖는 심볼릭 링크는 `ldconfig` 유틸리티로 생성한다. `ldconfig` 유틸리티는 적절한 soname을 갖는 심볼릭 링크를 생성하고 이를 `/etc/ld.so.conf` 파일에 등록하여 동적 링커가 빠르게 찾을 수 있도록 캐싱한다. 일반적인 데비안 패키지에서는 설치 이후 post-installation script에서 이러한 동작을 수행하므로 사용자가 이 유틸리티를 실행할 필요는 없다.

## 공유 라이브러리를 사용한 개발

공유 라이브러리를 사용하기 위해서는 공유 라이브러리 바이너리와 일반 이름을 가지는 심볼릭 링크, 헤더 파일이 필요하다. 일반 이름을 가지는 심볼릭 링크는 개발에만 사용되며 보통 최신 라이브러리를 사용하고자 할 것이므로 최신 soname 심볼릭 링크에 대한 참조를 가진다. 그러나 필요에 따라서는 이전 버전의 soname에 대한 심볼릭 링크가 될 수도 있다.

공유 라이브러리를 사용하기만 할 때는 일반 이름을 갖는 심볼릭 링크나 헤더 파일은 불필요하다. 그러므로 이는 보통 패키지에 포함시키지 않으며 공유 라이브러리 및 일반 심볼릭 링크와 헤더 파일을 함께 가지는 라이브러리를 개발 라이브러리로 별도로 배포한다. 이러한 개발 라이브러리들은 보통 `-dev` 접미사를 가진다.

그러므로 개발 패키지를 설치한 경우 다음과 같이 심볼릭 링크 구조를 가지게 된다.

```
libmylib.so -> libmylib.so.1 (심볼릭 링크, 컴파일 시 사용, 필수는 아님)
libmylib.so.1 -> libmylib.so.1.2.3 (심볼릭 링크, 동적 링커가 참조)
libmylib.so.1.2.3 (실제 라이브러리 파일)
```

## 결론

공유 라이브리리를 사용하여 프로그램을 빌드하는 과정, 프로그램이 실행될 때 공유 라이브러리가 동적으로 링킹되는 과정, 그리고 공유 라이브러리를 관리하는 방법에 대해 정리했다.

## References

- https://ko.wikipedia.org/wiki/%EC%A0%95%EC%A0%81_%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC
- https://tldp.org/HOWTO/Program-Library-HOWTO/static-libraries.html
- https://en.wikipedia.org/wiki/Shared_library
- https://en.wikipedia.org/wiki/Global_Offset_Table
- https://en.wikipedia.org/wiki/Linker_(computing)
- https://octo.org.uk/posts/shared-object-names/
- https://aimlesslygoingforward.com/blog/2014/01/19/bundling-shared-libraries-on-linux/
- https://tldp.org/HOWTO/Program-Library-HOWTO/shared-libraries.html
- https://www.bogotobogo.com/cplusplus/libraries.php