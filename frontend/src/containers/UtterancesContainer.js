import React, { useEffect, useRef } from 'react';

export default function UtterancesContainer({ hash }) {
  const ref = useRef(null);

  useEffect(() => {
    // Add Uterances comment
    let script = document.createElement("script");
    let anchor = ref.current;
    anchor.innerHTML = "";
    script.setAttribute("src", "https://utteranc.es/client.js");
    script.setAttribute("crossorigin", "anonymous");
    script.setAttribute("async", true);
    script.setAttribute("repo", "unknownpgr/unknownpgr.github.io");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("label", "Comment💬");
    script.setAttribute("theme", "github-light");
    anchor.appendChild(script);
  }, [hash]);

  return (
    <div ref={ref} />
  );
}
