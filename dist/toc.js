"use strict";
/*

Build a table-of-content json from given HTML.
The top level object of json is an array containing json objects that represent h1 tag.
Each h1-json objects in the top level array are like:
  {
    "id": "id-of-header",
    "text": "text-of-header",
    "children": [
      ...
    ]
  }
objects in children are h2-json between current h1 and next h1.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToc = void 0;
function getToc(html) {
    // Get header tags
    // This regex is not perfect. but, It works anyway.
    var headers = [];
    for (var match in html.matchAll(/<h[0-9]+[^<>]*>.+<\/h[0-9]+[^<>]*>/g)) {
        headers.push(match);
    }
    // Make stack
    var stack = [];
    var current = [];
    function add(condition) {
        while (condition) {
            var temp = current;
            var top = stack.pop();
            // Null check top for typescript
            if (!top)
                continue;
            current = top;
            if (current.length == 0)
                current.push({});
            current[current.length - 1].children = temp;
        }
    }
    // Make header tree with inverse DFS
    headers.forEach(function (header) {
        var raw = header[0];
        var id = raw.match(/id="[^"]+"/);
        id = id[0].replace(/id=|"/g, "");
        var text = raw.replace(/<\/?[^<>]*>/g, ""); // Remove html tag
        var depth = raw.match(/[0-9]+/); // For example, depth of <h4> tag is 4.
        // If new item has higher depth than current depth
        while (depth > stack.length + 1) {
            stack.push(current);
            current = [];
        }
        // If new item has lower depth than current depth
        add(depth < stack.length + 1);
        current.push({ id: id, text: text });
    });
    // Don't forget to return to root after entire iteration.
    add(stack.length > 0);
    return current;
}
exports.getToc = getToc;
