"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.md2jsx = void 0;
var md2html = new (require("showdown").Converter)({
    tables: true,
    prefixHeaderId: "header",
    ghCodeBlocks: true,
});
var htmltojsx_1 = __importDefault(require("htmltojsx"));
var html2jsx = new htmltojsx_1.default({
    createClass: false,
});
// Regex for emoji detection
var REGEX_EMOJI = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/;
// Replace string with given custom function
function _replaceMap(str, regex, func) {
    var processed = "";
    var left = str;
    while (true) {
        var match = left.match(regex);
        if (!match)
            break;
        if (!match.index)
            break;
        processed += left.substring(0, match.index) + func(match[0]);
        left = left.substring(match.index + match[0].length);
    }
    processed += left;
    return processed;
}
// Wrap emoji with span tag.
function _wrapEmoji(str) {
    var regex = REGEX_EMOJI;
    return _replaceMap(str, regex, function (emoji) {
        return "<span class=\"emoji\" role=\"img\" aria-label=\"emoji\" aria-hidden=\"true\">" + emoji + "</span>";
    });
}
// Add {/*eslint-disable-next-line*/} to remove 'Comments inside children section of tag should be placed inside braces' errors;
// This happens when full URL is inside some element.
// e.g. <div>The URL of Google is http://www.google.com </div>
function _escapeComment(str) {
    var processed = "";
    str.split("\n").forEach(function (line) {
        if (line.indexOf("//") >= 0) {
            processed += "{/*eslint-disable-next-line*/}\n";
        }
        processed += line + "\n";
    });
    return processed;
}
/**
 * Replace image source of img tag from string to require().
 * For example, convert <img src="src.jpg"> to <img src={require("./src.jpg")}>
 * @param {String} jsx JSX string
 * @returns A dictionary of {result,imgs}. result is converted string and imgs is an array of image sources.
 */
function _replaceImgSrc(jsx) {
    var regex = /<[^>]+src="[^'"]+"/;
    var imgs = [];
    function func(str) {
        var src = str.replace(/<[^>]+src="/g, "").replace(/"/g, "");
        imgs.push(src);
        var replace = str.replace(/src="[^'"]+"/, "src={require(\"" + ((src.startsWith(".") ? "" : "./") + src) + "\")}");
        return replace;
    }
    return { result: _replaceMap(jsx, regex, func), imgs: imgs };
}
/**
 * Convert markdown to jsx.
 * @param {String} md
 * @returns A dictionary of {result,imgs}. result is converted string and imgs is an array of image sources.
 */
function md2jsx(md) {
    var html = md2html.makeHtml(md);
    html = _wrapEmoji(html);
    var jsx = html2jsx.convert(html);
    var _a = _replaceImgSrc(jsx), result = _a.result, imgs = _a.imgs;
    result = _escapeComment(result);
    result = "import React from 'react';export default function(props){return(<React.Fragment>" + result + "</React.Fragment>);};";
    return { result: result, imgs: imgs };
}
exports.md2jsx = md2jsx;
