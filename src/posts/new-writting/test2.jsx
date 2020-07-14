
import React from 'react'
export default function(props) {
    return (
        <div className="blog-post">
        <h1 id="">글 써보기.</h1>
<p>이제 깃허브 블로그를 거의 다 만들었습니다. 그러므로, 한글로 된 제대로 된 글을 하나 써 봅시다.</p>
<h2 id="-1">테스트해보기</h2>
<p>여러 렌더링들이 정상적으로 이뤄지는지 테스트해보겠습니다.</p>
<h3 id="-2">리스트</h3>
<ol>
<li>ordered list가 제대로 렌더링되는가?</li>
<li>Unordered list가 제대로 렌더링되는가?</li>
</ol>
<p>아래는 unordered list입니다.</p>
<ul>
<li>First item</li>
<li>Second item</li>
<li>Inner item 1</li>
<li>Inner item 2</li>
</ul>
<h3 id="-3">코드</h3>
<p>아래는 <code>코드</code>입니다.</p>
<h3 id="-4">인용</h3>
<p>뿐만 아니라.</p>
<blockquote>
  <p>인용도 있습니다.</p>
  <blockquote>
    <p>이중 인용도 됩니다.</p>
  </blockquote>
</blockquote>
<h3 id="-5">라인</h3>
<p>선도 그어보겠습니다.</p>
<hr />
<p>표는 저번에 확인했으니 생략!</p>
        </div>
    );
};