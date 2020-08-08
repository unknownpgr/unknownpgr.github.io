const md2html = new (require("showdown").Converter)({
  tables: true,
  prefixHeaderId: "header", // It requires some prefiex because the id of first non english header tag will be empty string.
  ghCodeBlocks: true,
});
const HTMLtoJSX = require("htmltojsx");

// Regex for emoji detection
const REGEX_EMOJI = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/;

// Replace string with given custom function
function replaceMap(str, regex, func) {
  let processed = "";
  let left = str;
  while (true) {
    let match = left.match(regex);
    if (!match) break;
    processed += left.substring(0, match.index) + func(match[0]);
    left = left.substring(match.index + match[0].length);
  }
  processed += left;
  return processed;
}

// Wrap emoji with span tag.
function wrapEmoji(str) {
  let regex = REGEX_EMOJI;
  return replaceMap(
    str,
    regex,
    (emoji) =>
      `<span class="emoji" role="img" aria-label="emoji" aria-hidden="true">${emoji}</span>`
  );
}

// Add {/*eslint-disable-next-line*/} to remove 'Comments inside children section of tag should be placed inside braces' errors;
// This happens when full URL is inside some element.
// e.g. <div>The URL of Google is http://www.google.com </div>
function escapeComment(str) {
  let processed = "";
  str.split("\n").forEach((line) => {
    if (line.indexOf("//") >= 0) {
      processed += "{/*eslint-disable-next-line*/}\n";
    }
    processed += line + "\n";
  });
  return processed;
}

// Replace image source from src="src.jpg" to src={require("./src.jpg")}
function replaceImgSrc(str) {
  let regex = /<[^>]+src="[^'"]+"/;
  function func(str) {
    let src = str.replace(/<[^>]+src="/g, "").replace(/"/g, "");
    let replace = str.replace(
      /src="[^'"]+"/,
      `src={require("${(src.startsWith(".") ? "" : "./") + src}")}`
    );
    return replace;
  }
  return replaceMap(str, regex, func);
}

// Convert markdown to jsx
function md2jsx(md, className = "Markdown") {
  let html2jsx = new HTMLtoJSX({
    createClass: false,
    outputClassName: className,
  });

  let html = md2html.makeHtml(md);
  html = wrapEmoji(html);
  let jsx = html2jsx.convert(html);
  jsx = replaceImgSrc(jsx);
  jsx = escapeComment(jsx);
  return `import React from 'react';export default function(props){return(<React.Fragment>${jsx}</React.Fragment>);};`;
}

module.exports = md2jsx;
