---
title: 블로그 개발을 시작하다👨‍💻[5] - SPA
tags:
  - blog development
date: 2020-08-06T22:06:33.625Z
---

이전 포스트에서 다뤘던 이모지 문제를 해결한 후, 더이상 문제될 것은 없다고 생각했었습니다. 그런데 프로그래밍이라는 것이 항상 그렇듯이, 언제나 새로운 문제가 생깁니다.



![r/ProgrammerHumor - Debugging be like... 출처 : https://www.reddit.com/r/ProgrammerHumor/comments/9g4vml/debugging_be_like/](m0xy5opltgm11.jpg)



바로 블로그를 Single Page Application으로 개발했다는 점입니다.

# SPA(Single Page Application)의 역사

문제에 앞서, SPA가 무엇인지를 한번 알아봅시다.

## 기존 웹페이지의 문제점

SPA라는 개념이 생기기 전의 웹사이트에서는 새로운 내용을 보여주려면 <u>서버에서 매번 새로운 html파일을 로드</u>해야 했었습니다.  이런 경우, 단점이 몇 가지 생깁니다.

- 페이지 전체를 새로고침해야 하므로, 페이지가 렌더링되는 동안 유저는 빈 화면을 보면서 기다려야 합니다.
- Header나 Footer같이 실제로는 여러 페이지에 공통적으로 나오는 요소들도 매번 새롭게 다운로드 / 렌더링됩니다.
- 그러므로 웹페이지가 보여지는 데에 시간이 오래 걸립니다.
- 새로고침하는동안 페이지가 깜빡거리게 되므로, 미관상 좋지 않습니다.

## SPA의 개념

그래서 SPA라는 개념이 생겨났습니다. SPA는 Single Page Application의 약자로, 웹페이지를 매번 새롭게 로딩하는 것이 아니라 <u>JavaScript를 사용하여 필요한 부분만을 새로 로딩</u>하는 방식을 의미합니다.

- 예를 들어, 제 블로그의 카테고리를 이동하면, 모든 구성요소를 새로 렌더링하는 것이 아니라 꼭 필요한 부분인 포스트 리스트만을 새로 렌더링합니다.
- [React Router](https://reactrouter.com/native/example/Basic) 사이트에서, 왼쪽 Examples 섹션의 각 예제들을 눌러보시면 감이 더 잘 올 것 같습니다.

따라서 웹페이지를 SPA로 구성하면, 다양한 화면을 보여주기 위해 단 하나의 html / js만 있으면 충분합니다. 웹페이지를 변경할 필요가 있을 때에는 필요한 부분만 바꾸면 되기 때문입니다.

## 초기 SPA의 치명적 단점

물론 SPA가 처음 등장했을 때부터 완벽하지는 않아서, 초기에는 단점이 몇 가지 있었습니다.

### 특정 페이지로 이동 불가능

예를 들어, [한국콘텐츠학회](http://www.koreacontents.or.kr/)의 웹페이지는 SPA로 구성되어있습니다. (누가 만들었는지는 모르겠지만, SPA인 주제에 페이지를 이동할 때마다 새롭게 렌더링되는군요.🤔) 그러므로 이 사이트에서 특정 페이지로 이동한 후, URL을 복사하여 새 탭에서 열어보면 그냥 메인 페이지가 열립니다. 뿐만 아니라, 단순히 새로고침만 하더라도 메인 페이지로 이동해버립니다

### History 관리가 안 됨

웹브라우저에서 뒤로가기 버튼을 누르면, 브라우저는 사용자를 직전의 URL로 이동시킵니다. 그런데 SPA는 URL변화가 없기 때문에, 한 사이트 내에서 뒤로가기 등이 전혀 작동하지 않았습니다.

### 검색 안 됨(❗)

그리고 궁극적으로, **검색이 안 됩니다.**

보통 검색 엔진들은 사이트의 URL을 기준으로 페이지를 구분합니다. 그런데 SPA로 구성한 웹페이지의 경우, 내용이 아무리 많더라도 사이트의 URL은 단 하나밖에 없습니다. `index.html`파일 하나 내에서 모든 과정이 다 이루어지기 때문입니다. 그러므로 검색 엔진은 맨 처음에 로딩되는 딱 하나의 페이지만이 존재하는 것으로 인식합니다. 쇼핑몰, 블로그, 카페, 위키백과...등 각 페이지의 내용이 중요한 사이트의 경우, 검색이 안 되는 것은 치명적인 단점입니다.

## HTML5-History API의 등장

이후 이런 문제점을 해결하는 여러 방법이 등장하였습니다.

### Hash

그중 하나는 Hash입니다. <u>Hash란 한 페이지 내에서 특정 엘리먼트로 이동할 때 사용</u>하는 URL 형식으로, URL뒤에 `#ELEMENT_ID`와 같이 특정 엘리먼트의 ID를 추가하면 됩니다. 위키백과에서 쉽게 발견할 수 있습니다.

```
https://en.wikipedia.org/wiki/Single-page_application#Technical_approaches
```

위 URL을 자세히 살펴보면 뒷부분에 `#`으로 시작하는 부분이 있습니다. 이것이 바로 Hash입니다. [위 URL](https://en.wikipedia.org/wiki/Single-page_application#Technical_approaches)로 접속해보면 페이지의 맨 위로 이동하는 것이 아니라 `id`가 `Technical_approaches`인 엘리먼트가 있는 위치로 이동합니다. Hash는 한 사이트 내에서 엘리먼트의 위치를 가리키기 때문에, `<a>`태그나 JavaScript를 사용하여 URL의 Hash를 바꾸는 경우 URL은 변하지만 웹페이지가 새로 로딩되지는 않습니다. 그래서 어떤 라이브러리들의 경우 이를 이용하여 SPA를 구현했었습니다. (아마 [Angular](https://angular.io/)가 이런 방식을 사용하는 것으로 압니다.)

물론 Hash도 완벽한 솔루션은 아니었습니다. 일단 위에서 언급한 첫 번째와 두 번째 문제는 해결되었지만, 어떤 검색 엔진들은 Hash를 무시해버리기 때문에 역시 검색이 잘 되지 않는 문제가 있었습니다.

그리고 이는 정석이 아니라 일종의 트릭이므로, URL이 보기에 어색해집니다.

```
https://unknownpgr.github.io/#/posts/some-post
```

...아무래도 중간에 이상한 것이 끼이니, 영 어색합니다.

### HTML5 History API

그러나 HTML5가 등장하면서, 모든 문제점이 한 번에 사라집니다.

HTML5의 기능 중에는 [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)라는 것이 있습니다. 요약하자면 URL 및 History를 마음대로 조작할 수 있는 기능입니다. 이전에는 주소창의 URL을 바꾸려면 실제로 페이지를 이동해야만 했지만, 이제는 History API를 이용하여 페이지 이동 없이도 새로운 사이트를 방문한 것처럼 URL을 조작할 수 있게 되었습니다.

그리고 이를 이용하여 React의 Browser Router가 등장하였습니다. Browser Router란 새로운 페이지로 이동할 때 실제로는 페이지 라우팅이 전혀 일어나지 않지만 <u>URL을 바꾸어 페이지를 이동한 것처럼 보이게 하는 기술</u>입니다. [React Router](https://reactrouter.com/)라는 라이브러리를 사용하여 이를 사용할 수 있습니다.

# GitHub Page의 역습

그래서 저는 SPA로 블로그를 만드는 것에 아무런 문제가 없음을 믿어 의심치 않았습니다. 그런데 GitHub Page가 정적 웹서버를 사용하여 호스팅된다는 것이 문제였습니다.

예를 들어 `https://unknownpgr.github.io/posts/blog-dev-4`페이지의 경우, 실제로 저런 경로가 존재하는 것이 아닙니다. 실제로 존재하는 것은 `https://unknownpgr.github.io/index.html`파일밖에 없고, 위의 URL은 Browser Router를 통해 URL만을 바꾼 것입니다. 하지만 이런 사실을 전혀 모르는 GitHub Page의 정적 서버는 `https://unknownpgr.github.io/posts/blog-dev-4`라는 파일이 없다고 생각하여 저 경로로 접근하면 404를 반환합니다.

## 해결 방법

물론 하늘이 무너져도 솟아날 구멍은 있는 법이어서, 다행스럽게도 해결 방법이 있었습니다.

GitHub에서 루트 디렉토리에 `404.html`을 만들면 404 발생 시 GitHub Page의 기본 404 페이지 대신 저 페이지가 나옵니다. 이를 이용하여 404페이지에서 다시 메인 페이지(`/`)로 리다이렉트하되, GET parameter를 사용하여 원래 어떤 페이지가 요청되었는지를 반환하는 것입니다.

```html
<!-- 404.html -->
<script>
    const url = `/?page=${encodeURIComponent(window.location.pathname)}`;
    window.location.replace(url);
</script>
```

이후, 메인 페이지에서는 `page` 파라매터를 검사, 만약 파라매터가 존재하면 Browser Router를 사용하여 해당 페이지로 리다이렉트시켜줍니다. 

```jsx
// App.js
...
let param = window.location.search.substr(1);
let redirect = undefined;
if (param.indexOf("page=") >= 0) {
        let dest = decodeURIComponent(param.replace("page=", ""));
    console.log("Redirect to " + dest);
    if (dest.indexOf("/404.html") >= 0) {
        console.log("Ignore redirect to 404 page.");
	} else redirect = <Redirect to={dest} />;
}
...
```

이런 방법을 통해 GitHub Page의 정적인 서버를 사용하면서도 SPA 블로그를 서비스할 수 있게 되었습니다.
