---
title: 블로그 개발을 시작하다👨‍💻[4] - Emoji / Image
tags:
  - blog development
date: 2020-07-27T01:49:37.301Z
---

# 의외의 복병💂‍♂️

개발을 하다 보니 문제점이 하나 있었습니다. 바로 이모지였는데요.  요새 좀 힙한 블로그나 글에서는 다 이모지를 쓰던데, React에서는 이모지를 바로 삽입할 수가 없었기 때문입니다. 

- 콘솔 에러가 나는 예

  ```html
  <p>EMOJI😀</p>
  ```

- 올바른 예

  ```html
  <p>EMOJI<span role="img" aria-label="smile">😀</span></p>
  ```

왠지는 잘 모르겠습니다. 아마 어떤 브라우저에서는 이모지가 제대로 렌더링이 되지 않을 수 있기 때문에 이런 식으로 조치하는 게 아닌가 생각됩니다. (재미있는 점은 본문(`<p>`태그)에만 이모지를 삽입할 수 없고, `<h1>`등 다른 태그에는 별다른 조치 없이 이모지가 잘 들어간다는 점입니다. 흠...)

제가 인터넷에서 찾은 제일 괜찮은 해법은 [Emoji 태그를 따로 만드는 거였습니다.](https://medium.com/@seanmcp/%EF%B8%8F-how-to-use-emojis-in-react-d23bbf608bf7) 다만 이 해법은 본인이 직접 Component를 건드려서 페이지를 작성할 때에는 문제가 없지만 마크다운을 jsx로 변환하는 상황에서는 사용하기가 매우 번거롭습니다. 마크다운을 작성할 때마다 `<Emoji>`태그를 넣어줘야 하니까요.

물론 [이모지를 검출하는 regex](https://stackoverflow.com/questions/24840667/what-is-the-regex-to-extract-all-the-emojis-from-a-string)가 이미 있기 때문에, 저는 간단하게 모든 이모지를 `<Emoji>`로 감싸는 함수를 작성, 마크다운에서 이 함수를 적용한 후 html로 변환을 했습니다.

# 2차 오류 - Escape🏃‍♀️🏃‍♂️

이 방법을 적용할 수 없는 부분은 바로 코드 블럭이었습니다. 코드를 작성할 때, 코드 블럭 안에 이모지를 넣는 경우가 생길 수 있습니다. 이 글 처음 부분만 보더라도 코드 블럭 안에 이모지가 들어갑니다. 이런 경우 마크다운에서 그대로 치환을 할 경우 Emoji tag가 코드 블럭 안에 들어가버립니다.

```html
👉이런 문자열이
```

```jsx
<Emoji>👉</Emoji>이런 문자열이 //이렇게 됩니다.
```

그런데 마크다운을 html로 변환해주는 [컨버터](https://www.npmjs.com/package/showdown)는 당연히 이것이 코드의 일부분이라고 인식하여 변환 시 이모지 태그를 escape 해버리고, 따라서 결과물에서는 저런 태그가 그대로 보이게 됩니다.

그래서 찾은 해결 방법이 마크다운으로 변환한 후에 이모지를 치환하는 거였습니다.(...)

# 3차 오류 - Image

이제 글에 이모지가 잘 들어가는 듯 싶었습니다. 물론 TOC를 만들 때 태그가 그대로 보이는 문제점이 발생하기는 했는데, 그냥 정규표현식을 사용한 replace로 싹 날렸습니다.

근데 포스트에 이미지를 넣으려 했더니 이번엔 이미지가 또 로드가 안 됩니다. 문제는 jsx파일 생성 방식에 있었습니다. 현재는 그렇지 않지만, 이전에는 md파일을 html로 변환한 후 그걸 그냥 functional component가 통째로 반환하도록 구성했었습니다(....)

```js
const html = converter.makeHtml(markdown);
const jsx = `import React from 'react';export default function(props){return(<React.Fragment>${html}</React.Fragment>);};`;
// jsx 를 파일로 저장
```

그러면 이미지 태그 역시 html과 같은 방식으로 삽입됩니다.

```jsx
function Component(){
    return(
        // Some jsx~~~
        <img src="./image.jpg"></img>
        // Some jsx~~~
    );
}
```

 React는 빌드 시 webpack을 사용하는데, webpack은 img 태그의 src속성을 특별히 파싱하지 않습니다. 그러므로 빌드의 결과로 생성된 img 태그의 src 속성에는 jsx파일에 대한 상대경로로 이미지 위치가 지정되어있는데, 이 경로는 build폴더 안에 존재하지 않으므로 웹브라우저가 요청해도 서버가 이미지를 줄 수 없습니다.

img태그에 올바르게 상대경로를 지정하는 방법은 아래와 같이 require을 하는 것입니다.

```jsx
<img src={require("./image.jpg")}></img>
```

그러면 webpack은 이것이 외부 리소스를 로드한다는 것을 알고 번들링을 할 때 이 이미지를 자동으로 build 디렉토리에 포함합니다.

이것 역시 이미지 태그의 `src` 속성을 전부 치환함으로써 해결했습니다.

# 4차 오류 - Tag style

그런데 또 오류가 뜹니다. html과 jsx의 미묘한 태그 스타일 차이가 원인이었습니다. `<img>`태그를 닫을 때 html에서는 꺾쇠괄호 하나만으로(`<img>`)닫습니다. 그런데 jsx에서는 슬래시를 꼭 써줘야만 합니다(`<img/>`). 

이쯤 오니까 앞으로 뭔가 추가할 때마다 이런 원인으로 인하여 새로운 오류가 발생할 것 같은 느낌이 강하게 듭니다. 그래서 html을 jsx로 바꿀 때 string에다가 바로 박아넣는 방법을 쓰는 대신 제대로 된 라이브러리를 쓰기로 결정했습니다. 그래서 마크다운을 html로 바꾼 후 그것을 라이브러리를 통해서 다시 jsx파일로 바꿔줍니다.

# 5차 오류 - 또 이모지

html을 jsx로 바꿀 때 [htmltojsx라이브러리](https://www.npmjs.com/package/htmltojsx)를 이용했었습니다. 그런데 여기서 또 문제가 발생했습니다. `<Emoji>`태그를 변환했더니 `<emoji>`가 된 것입니다. 즉, 모든 태그가 소문자가 되어버렸습니다. 아마도 모든 html태그는 전부 소문자이기 때문에 개발자가 파싱할 때 toLowercase함수를 사용하여 일관되게 태그 이름을 바꿔버렸나 봅니다.

그래서 `<Emoji>`태그를 포기하고 그냥 `<span role="img" aria-label="smile">😀</span>` 이렇게 긴 html태그를 그냥 삽입하기로 했습니다.

# 최종 결과물

그래서 최종적으로 마크다운을 jsx로 변환하는 과정은 다음과 같습니다.

1. 마크다운을 `showdown`라이브러리를 사용하여 html로 변환한다.
2. html로 변환한 내용에서 이모지를 `<span>`태그로 감싼다.
3. 이를 `html2jsx`라이브러리를 사용하여 jsx파일로 변환한다.
4. `<img>`태그의 `src` 속성을 `require`을 사용하도록 바꿔준다.

그리하여 이런 길고도 험한 삽질 끝에, 블로그 포스트 시스템을 완성하게 되었습니다.
