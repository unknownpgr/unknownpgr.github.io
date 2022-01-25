import React from "react";

// Build table of content (TOC) from toc json
export default function TOC({ toc }) {
  if (!toc) return null;

  const headerLevel = (t) => +t.type.substr(1);
  let stack = [];
  let current = [];
  let key = 0;
  toc.forEach((t) => {
    while (stack.length + 1 < headerLevel(t)) {
      stack.push(current);
      current = [];
    }
    while (stack.length + 1 > headerLevel(t)) {
      let temp = current;
      current = stack.pop();
      if (current.length === 0) current = temp;
      else current.push(<ul key={key} children={temp}></ul>);
      key++;
    }
    current.push(
      <li key={key}>
        <a
          href={"#" + t.id}
          dangerouslySetInnerHTML={{ __html: t.content }}></a>
      </li>
    );
    key++;
  });
  while (stack.length > 0) {
    let temp = current;
    current = stack.pop();
    if (current.length === 0) current = temp;
    else current.push(<ul key={key} children={temp}></ul>);
    key++;
  }
  return <ul children={current}></ul>;
}
