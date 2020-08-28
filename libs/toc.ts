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

type toc = {
  id?: string;
  text?: string;
  children?: toc[];
};

/**
 * Return matched part of given string.
 * For example, when str='asssssdf' and regex=/s+/, it returns 'sssss'.
 * When there are no match, it returns empty string.
 * This function is not designed for global regex(/.../g).
 * Therefore, do not use it.
 */
function getMatch(str: string, regex: RegExp): string {
  let match = str.match(regex);
  if (match == null) return "";
  return match[0];
}

/**
 * Return table of content object of given html.
 * @param html HTML string to build TOC(Table of Content).
 */
function getToc(html: string): toc[] {
  // Get header tags
  // This regex may not be perfect. but, It works anyway. IDK why.
  let headers = html.match(/<h[0-9]+[^<>]*>.+<\/h[0-9]+[^<>]*>/g);
  if (headers == null) return [];

  // Make stack
  let stack: toc[][] = [];
  let current: toc[] = [];

  // Ascend to upper node of given depth
  function ascend(depth: number) {
    // Stack is deeper than given depth
    while (depth - 1 < stack.length) {
      const temp: toc[] = current;
      const top: undefined | toc[] = stack.pop();

      // Null check top for typescript
      if (top == null) throw new Error("TOC stack is empty.");

      // Update 'current' variable
      current = top;

      // Add child of current
      if (current.length == 0) current.push({});
      current[current.length - 1].children = temp;
    }
  }

  // Make header tree with inverse DFS(list -> tree)
  headers.forEach((header) => {
    let id: string = getMatch(header, /id="[^"]+"/).replace(/id=|"/g, "");

    let text = header.replace(/<\/?[^<>]*>/g, ""); // Remove html tag
    let depth: number = +getMatch(header, /[0-9]+/); // For example, depth of <h4> tag is 4.

    // If new item has higher(deeper) depth than current depth, descend.
    while (depth - 1 > stack.length) {
      stack.push(current);
      current = [];
    }

    // If new item has lower depth than current depth
    ascend(depth);
    current.push({ id, text });
  });

  // Return to root after entire iteration.
  ascend(1);
  return current;
}

module.exports = getToc;
