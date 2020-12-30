import React, { Component } from 'react';

class UtterancesContainer extends Component {

  componentDidMount() {
    // Add Uterances comment
    let script = document.createElement("script");
    let anchor = this.ref;
    anchor.innerHTML = "";
    script.setAttribute("src", "https://utteranc.es/client.js");
    script.setAttribute("crossorigin", "anonymous");
    script.setAttribute("async", true);
    script.setAttribute("repo", "unknownpgr/unknownpgr.github.io");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("label", "Comment💬");
    script.setAttribute("theme", "github-light");
    anchor.appendChild(script);
  }

  render() {
    return (
      <div ref={ref => this.ref = ref}>
      </div>
    );
  }
}

export default UtterancesContainer;