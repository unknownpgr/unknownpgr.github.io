import React, { useEffect, useRef } from "react";

export default function Utterances({ hash }: { hash: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add Utterances comment
    const anchor = ref.current;
    if (!anchor) return;
    const script = document.createElement("script");
    anchor.innerHTML = "";
    anchor.appendChild(script);

    // TODO: Resolve  Failed to execute 'insertAdjacentHTML' on 'Element': The element has no parent. error
    script.setAttribute("src", "https://utteranc.es/client.js");
    script.setAttribute("crossorigin", "anonymous");
    script.setAttribute("async", "true");
    script.setAttribute("repo", "unknownpgr/unknownpgr.github.io");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("label", "Comment💬");
    script.setAttribute("theme", "github-light");
  }, [hash]);

  return <div ref={ref} />;
}
