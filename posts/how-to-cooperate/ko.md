---
title: 협업 잘하는 법
tags:
  - development
date: 2021-01-09T13:39:34.560Z
---

# 협업을 하기 위한 기본

요새 다른 사람들과 협업할 일이 많습니다. 어떤 프로젝트는 5명이서 동시에 작업을 해도 매끄럽게 돌아가는 반면, 어떤 프로젝트는 3명이 작업하는데도 문제점이 많습니다. 그래서 협업을 어떻게 하면 잘 할 수 있는지, 하면 안 되는 것이 무엇인지에 대해 약간은 알게 되었습니다. 그래서 한번 협업을 잘 하기 위한 사항들을 정리해봤습니다.

다 쓰고 다시 읽어보니 협업할 때뿐만 아니라 혼자서 코딩할 때에도 지키면 좋은 것 같다는 생각이 드네요.

## 오류난 코드는 푸시하지 않는다

**코드에 오류가 있으면 원격 리포지토리에 푸시해서는 안 됩니다.** 이것은 협업에 있어 기본입니다. 이건 애초에 협업이 아니라 깃을 사용할 때의 기본입니다. 오류가 났으면 아예 원격 리포에 푸시를 하지 말던가, 아니면 오류를 해결하고 나서 푸시해야 합니다. **애초에 오류가 난 코드는 푸시 이전에 커밋 자체를 하지 않는 게 좋습니다.** 어떤 이유로 반드시 오류가 난 코드를 푸시해야 할 경우 다른 사람들이 작업하고 있지 않은 새로운 브랜치를 파서 푸시해야지, 작업 중인 브랜치에 오류가 있는 코드를 푸시해서는 절대로 안 됩니다. 그럴 경우 다른 사람들이 작업중인 모든 코드에 전부 같은 오류가 발생하고, 그러면 누군가 그 문제를 해결할 때까지 남은 인원들이 전부 대기하던가, 아니면 각자의 방식으로 그 오류를 고치게 되는데, 그러면 또 나중에 머지할 때 충돌이 발생합니다. 그러므로 **절대로** 오류가 난 코드를 푸시해서는 안 됩니다.

만약 오류가 난 코드를 푸시하지는 않더라도 굳이 커밋을 해야 하는 경우, 반드시 커밋에 오류가 있음을 밝혀야 하며, 메인/마스터 브랜치가 아니라 다른 브랜치를 파서 커밋해야 합니다.

물론 개발을 하다 보면 특정한 상황에서만 드러나는 오류가 있어 발견을 못 하거나, 아니면 git conflict는 나지 않았지만 머지하는 중 오류가 나는 경우도 있습니다. 또는 논리적 오류라서 이게 오류인지 알기 어려운 경우도 있습니다. 이런 경우는 당연히 어쩔 수가 없습니다. 그러나 콘솔창에 오류가 뜨는 등 대놓고 오류가 있는 경우에는 **반드시** 수정해주어야 합니다.

## 실행이 되더라도 오류는 오류다

어떤 언어나 플랫폼들은 사용자 경험을 위해 오류를 콘솔 창에만 띄우고 사용자에게 알리지 않는 경우가 있습니다. 예를 들어, 자바스크립트나 Unity와 같은 경우 어지간히 심각한 오류가 아니고서야 프로그램 전체가 죽어버리는 일은 잘 없습니다. 그래서 어떤 경우에는 '오류가 뜨긴 하는데 잘 되네? 그럼 된 거지'정도의 생각을 하는 경우가 있는 것 같습니다.

**그러나 그 어떤 경우에도 오류는 오류입니다.** 분명히 어딘가에서 코드 실행이 의도한 대로 되고 있지 않으며, 이는 때로는 심각한 보안 취약점이 될 수도 있습니다. 그냥 출력 콘솔창에 오류를 띄우는 것만으로도 다른 오류 메시지를 발견하게 어렵게 만드는 악영향을 미칩니다. 만약 아무리 테스트해봐도 아무런 문제가 없다면 그냥 오류가 난 부분을 통째로 지우면 됩니다. 오류가 났는데 아무런 문제가 없다는 것은, 그 코드는 그냥 아무 의미 없는 코드라는 의미니까요. 그게 아니라면, 당연히 문제가 있어야 합니다.

오류를 내버려둬도 되는 단 한 가지 경우는 플랫폼 자체에서 오류를 띄워서 어쩔 수 없는 경우입니다. 예를 들자면 JavaScript에서 404에러는 예외처리를 하더라도 에러 메시지는 뜹니다. 당연히 그렇다 하다라도 애초에 에러가 나지 않게 하는 것이 훨씬 낫습니다.

## Warning==Error

가끔씩, 어떤 코드들은 컴파일하다 보면, 혹은 실행 중에, 아니면 IDE에서 warning이 엄청나게 뜨는 경우가 있습니다. Warning이 뜨는 이유는 대부분 문법적으로는 문제가 없지만 논리적으로 문제가 있거나, 추후 문제가 발생할 가능성이 상당히 높은 경우입니다. 그런데 협업을 하다 보면 서로의 코드를 100% 이해하고 있기가 힘듭니다. 그런 경우에 이런 warning을 해결하지 않으면 결국은 에러로 발전합니다. 그러므로 협업을 할 때에는 반드시 푸시하기 전에 모든 warning을 해결하고 푸시해야 합니다.

Warning이 발생하는데 무시해도 되는 경우는 딱 한 가지 경우밖에 없습니다. 추후 다른 사람이 반드시 사용하게 되는 함수나 변수를 작성하였는데 아직까지 이 함수를 사용할 사람이 사용하지 않았고 언어 자체가 interface등을 지원하지 않아서 어쩔 수 없이 unused~~류의 에러가 발생하는 경우.

## 사용하지 않는 코드는 지워라

이건 상당히 많은 코드에서 보이는 문제점인데, 더이상 쓰지 않는 코드를 지우지 않는 것입니다. 쓰지 않는 코드가 남아있을 경우 협업을 할 때 다른 사람들이 그 코드가 무슨 일을 하는지 알기가 **매우** 어려워집니다. 물론 이런 경우 IDE에서 띄워 주는 warning만 잘 처리해주더라도 상당 부분이 해결됩니다. 그러나 어떤 경우에는 변수를 실제로는 전혀 사용하지 않으면서 그 변수를 할당하거나 검사하는 경우가 있습니다. 이런 경우 IDE에서는 warning을 띄우지 않기 때문에 코드를 처음 보는 입장에서는 코드를 전부 해석하지 않고서는 이게 유의미한지 아닌지를 알 수 없습니다.

어쩌면 이게 당장 실행상의 오류가 아니기 때문에 큰 문제가 안 된다고 생각할 수도 있습니다. 그러나 사용하지 않는 코드는 마치 시한폭탄과도 같아서, 쌓이고 쌓이다 보면 나중에 원인을 찾기 어려운 오류가 발생했을 경우 **그 원인을 절대로 찾지 못하게** 만들어줍니다. 특히 코드를 처음부터 같이 작성한 사람이 아니라 새로운 개발자가 들어왔을 때, **유지보수를 원천적으로 차단하는** 주범이기도 합니다. **사용하지 않는 코드는 반드시 삭제해야 합니다. 사용하지 않는 코드는 반드시 삭제해야 합니다. 사용하지 않는 코드는 반드시 삭제해야 합니다.** 중요해서 4번이나 적었습니다.

그리고 어떤 경우에는, 아예 가만히 두는 것보다야 훨씬 낫지만, 사용하지 않는 코드를 제대로 된 설명도 없이 그대로 주석처리해두는 경우가 있습니다. 이것도 가능하면 피하는 게 좋습니다. 굳이 이렇게 주석처리를 해 두어야 한다면, 그 코드를 작성한 목적, 그 코드의 역할, 굳이 안 지우고 주석처리해둔 이유를 같이 적어두어야 합니다. 특히 git으로 관리되는 프로젝트에서는 이전 버전의 코드를 볼 수 있고, branch를 사용할 수도 있기 때문에 이렇게 할 이유가 전혀 없습니다. 그래서 저는 협업 중에 이러한 코드를 보면 그냥 지워버립니다. 물론 git에서 복구가 가능할 경우에만 그렇게 합니다.

## 주석은 필수

여러 사람이 함께 작업할 때 주석은 선택이 아닌 필수입니다. 특히 함수와 변수 이름같은 경우, 어떤 역할을 하는지 주석으로 적어놓지 않으면 그 기능을 전혀 알 수 없는 경우가 많습니다. 예를 들어 어떤 변수 타입이 `int`이고 이름이 `time`입니다. 이 경우 어찌 보면 시간을 나타내는 변수임이 당연해서 굳이 주석을 달 필요가 없어보일 수도 있습니다. 그러나 코드를 처음 읽는 입장에서는 이것이 datetime인지, 아니면 프로그램이 시작되고 난 후부터 카운트되는 시간인지, 게임이라면 한 라운드가 시작된 후의 시간인지, 또 저장되는 형식이 초인지, 분인지, 시간인지, 날짜인지, 아니면 UNIX time인지 전혀 알 수 없습니다. 그러므로 주석이 반드시 필요합니다.

**함수의 경우에는 주석이 더 중요합니다.** 함수는 코드들의 묶음으로써 여러 동작을 수행할 수 있기 때문에 적절한 주석을 달지 않으면 아예 무슨 일을 하는 함수인지 전혀 알 수 없는 경우도 있습니다.

물론 주석을 다는 데에도 규칙이 있으며, 어떤 주석은 안 다느니만 못한 경우도 있습니다. **그러나** 주석이 많으면 지우면 되지만 없으면 어떻게 할 방법이 없습니다. 주석을 달아야할지 말지 고민이라면 다는 편이 낫습니다.

## 네이밍은 컨벤션에 맞게

함수나 변수의 이름을 붙일 때 반드시 지켜야 하는 규칙은 `(_|[a-zA-Z])(_|[a-zA-Z]|[0-9])*`밖에 없습니다. **그러나** 함수나 변수의 명명에 있어 일반적으로 사용하는 규칙들이 있으며, 이 규칙을 컨벤션이라 부릅니다. 이런 컨벤션이라고 하면 보통 여러 단어가 있을 때 표기법(e.g. camelCase, snake_case, kebab-case)등을 생각합니다. 그러나 제가 더 중요하게 생각하는 것은 단어의 선정입니다. 케이스같은 건 나중에 IDE의 refactoring 기능으로 바꾸어도 늦지 않습니다.

예를 들어 `set`으로 시작하는 함수는 어떤 변수의 값을 설정하는 함수여야 하고, `get`으로 시작하는 함수는 변수의 값을 가져오는 함수여야 합니다. `on`으로 시작하는 함수는 콜백 함수여야 하며, `is`로 시작하는 함수는 `boolean`값을 반환해야 합니다. 변수 이름의 경우 `i`,`j`,`k`는 대부분 iteration을 위한 index로만 사용되며 `l`은 거의 배열의 길이를 나타내기 위해 사용됩니다.

또 짝이 맞아야 하는 이름도 있습니다. `get`과 `set`같은 것입니다. 보통 `start`는 `finish`나 `end`와 짝이 맞으며, `create`는 `delete`나 `remove`와 짝이 맞습니다. `push`는 거의 100% `pop`과 짝이 맞으며, 스택 기능을 가지는 경우가 아니면 거의 사용되지 않습니다. 비슷하게 `(en)queue`는 `dequeue`와 같이 사용되며, 큐 기능을 가지는 경우가 아니면 거의 사용되지 않습니다. `pause`는 `resume`, `save`는 `load`, `read`는 `write`와 짝이 맞습니다. 따라서 어떤 값을 저장하는 기능을 `write`라는 이름으로 구현했다면, 그 값을 다시 가져올 때는 `read`라는 이름으로 구현해야지, `load`라는 이름이나 `get`이라는 이름으로 구현하는 것은 지양해야 합니다.

그리고 그럴듯해보이지만 거의 사용되지 않은 단어도 많습니다. 예를 들어 `make`라는 동사는 뭔가를 만든다는 의미이지만, 보통 뭔가를 만들 때에는 `create`를 사용하고, 값을 생성할 때에는 `generate`를 사용하지 `make`라는 단어는 잘 쓰지 않습니다. `bring`역시 뭔가를 가져온다는 뜻이지만, 보통 `get`, `load`, `read`를 사용하고 `bring`은거의 쓰지 않습니다.

이런 컨벤션을 잘 지키면 코드의 가독성을 크게 향상시킬 수 있습니다. 반대로 컨벤션과 아주 다르게 코딩하면 **코드가 난독화한 것보다 읽기 어려워질 수도 있습니다.** 과장이 아니라 진짜로 그렇습니다. 난독화는 아예 아무런 규칙이 없지만, **잘못 작성한 이름은 함수나 변수의 기능을 다른 기능으로 오해하게 만들기 때문에** 오히려 난독화한 것보다 더 읽기 어려워질 수도 있습니다.

그런데 어떤 경우에는 아무리 생각해도 이 함수나 변수를 위한 적절한 컨벤션이 없는 경우가 있습니다. 그런 경우 보통 코딩을 잘못한 경우로, 한 개 함수 안에 너무 많은 기능을 넣으려다 보니 그런 일이 발생하게 됩니다. 저는 그럴 때에는 함수를 적절하게 분리한 후, 그래도 어쩔 수 없는 경우 적절한 이름을 붙이고 그 함수가 어떤 일을 하는지 아주 상세하게 주석을 달아줍니다.

## 네이밍에는 적절한 정보를

함수나 변수 이름에는 적절한 정보가 포함되어야 합니다. 아까 위에서 주석의 예시에서 보았듯, 예컨대 변수나 함수 이름이 `time`, `init`, `go`, `run` 등인 경우 그 이름으로부터 정보를 추측하기가 어렵습니다. 그러므로 `initScene`, `processRunningTime` 등 적절한 정보를 제공해주는 것이 좋습니다. 물론 모든 변수나 함수 이름을 `TransactionAwarePersistenceManagerFactoryProxy`처럼 엄청나게 길게 지으라는 의미는 아닙니다. (실제로 있는 클래스 이름입니다.) 적절히 주석과 타협을 보면 됩니다.

## 전역변수는 가능하면 지양할 것

전역변수는 다른 모든 것들과 마찬가지로 코드 해석을 매우 어렵게 만드는 주범입니다. 전역변수는 가능하면 사용을 지양해야 합니다. 굳이 전역변수를 사용할 일이 있다면 딱 한 군데에서 할당하고 나머지에서는 참조만 하는 형식이 좋습니다. 저는 전역변수가 4개 이상이 되면 그때부터 뭔가 문제가 있는 것으로 생각하고 있습니다.

이때 전역변수란 수정 가능한 변수를 말하는 것입니다. **상수**는 말 그대로 상수. 전역이라도 **변수**가 아니기 때문에 **전역 상수는 전역 변수가 아닙니다.** 막 써도 됩니다. 마찬가지로 함수도 (람다처럼 변수 형태로 선언되었다고 하더라도) 수정가능하지 않으므로 전역 변수가 아닙니다.

그리고 가끔 C언어에서의 static과 같이 한 함수 내에서만 사용되는 전역변수가 있습니다. 이런 경우 접근제한자를 private으로 하는 것은 기본이고, 그 함수 바로 위에 선언하여 그 함수에서만 사용된다는 것을 알려주는 것이 좋으며, `counter`, `time`등 다른 곳에서 사용할 법한 이름을 지양해야 합니다.

# 협업을 할 때 지키면 좋은 것들

위 내용들은 협업을 할 때 반드시 지켜야 할 것이었다면, 아래 내용들은 권장사항입니다. 물론 아래 내용도 필수라 생각하는 사람도 많겠지만, 저는 간단한 프로젝트라면 이런 것까지 강요하지는 않습니다.

- 적절한 code formatter를 사용할 것. 그리고 모두가 동일한 설정을 공유할 것.
- ESLint등 적절한 analyzer를 사용하여 code quality를 유지할 것. 이것 역시 모두가 공유해야 함.
- 한 커밋에 여러 수정을 하지 말 것. 만약 커밋하는 것을 잊었다면 stage기능을 적극적으로 사용하여 분리하여 커밋할 것.
- 커밋 메시지는 명령문으로, 동사 원형을 사용하여, 첫 글자는 대문자로.
  - This commit will "Commit message"라 생각하고 커밋 메시지를 작성하면 됨. (맨 처음 init 커밋은 예외)
    - This commit will "Add data sort function" (O)
    - This commit will "Added data sort function" (X)
    - This commit will "Function name refactor" (X)
- 함수의 파라매터 개수는 가능하면 4개 이하로 할 것. 항상 제공해야 하는 파라매터가 아니라면 default value를 제공할 것.
  - 반대로 항상 제공해야 하는 파라매터라면 default value를 제공하지 않을 것.
- 함수는 가능하면 pure function으로 작성할 것.
- 프로젝트를 시작할 때 잘 구조화해서 모듈화한 후, 그 모듈을 각 팀원들에게 분배할 것. 그렇게 해야 conflict를 최소화할 수 있음.
- 만약 내가 끝내는 프로젝트가 아니라, 누군가에게 인수인계할 가능성이 있는 프로젝트라면 document를 작성할 것.
  - 그러기 어렵다면 적어도 README라도 깔끔하게 작성할 것.
- 개발 과정을 한두 줄로 요약한 개발 일지를 작성할 것. 추후 `어? 이때 왜 이랬더라?`하는 일을 막을 수 있음.
