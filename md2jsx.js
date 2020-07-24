const md2html = new (require("showdown").Converter)({
  tables: true,
  prefixHeaderId: "header", // It requires header prefiex because first full-korean header will be converted to empty string.
  ghCodeBlocks: true,
});

var HTMLtoJSX = require("htmltojsx");

// Replace string with custom function
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

// Replace emoji to <Emoji/> tag.
function replaceEmoji(str) {
  let regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/;
  return replaceMap(
    str,
    regex,
    (emoji) =>
      `<span class="emoji" role="img" aria-label="emoji" aria-hidden="true">${emoji}</span>`
  );
}

// Replace image source from src="src.jpg" to src={require("./src.jpg")}
function replaceImgSrc(str) {
  let regex = /src="[^'"]+"/;
  function func(str) {
    let src = str.replace(/(src\=)?"/g, "");
    console.log(src);
    return `src={require("${src.startsWith(".") ? "" : "./" + src}")}`;
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
  html = replaceEmoji(html);
  let jsx = html2jsx.convert(html);
  jsx = replaceImgSrc(jsx);

  return `import React from 'react';export default function(props){return(<React.Fragment>${jsx}</React.Fragment>);};`;
}

module.exports = md2jsx;
