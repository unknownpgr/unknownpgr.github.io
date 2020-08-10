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
  id?: String;
  text?: String;
  children?: toc[];
};

function getToc(html: string): toc[] {
  // Get header tags
  // This regex is not perfect. but, It works anyway.
  const headers = [];
  for (let match in html.matchAll(/<h[0-9]+[^<>]*>.+<\/h[0-9]+[^<>]*>/g)) {
    headers.push(match);
  }

  // Make stack
  let stack: toc[][] = [];
  let current: toc[] = [];

  function add(condition: boolean) {
    while (condition) {
      const temp: toc[] = current;
      const top: undefined | toc[] = stack.pop();

      // Null check top for typescript
      if (!top) continue;
      current = top;
      if (current.length == 0) current.push({});
      current[current.length - 1].children = temp;
    }
  }

  // Make header tree with inverse DFS
  headers.forEach((header) => {
    const raw = header[0];
    let id: any = raw.match(/id="[^"]+"/);
    id = id[0].replace(/id=|"/g, "");

    const text = raw.replace(/<\/?[^<>]*>/g, ""); // Remove html tag
    const depth: any = raw.match(/[0-9]+/); // For example, depth of <h4> tag is 4.

    // If new item has higher depth than current depth
    while (depth > stack.length + 1) {
      stack.push(current);
      current = [];
    }

    // If new item has lower depth than current depth
    add(depth < stack.length + 1);
    current.push({ id, text });
  });

  // Don't forget to return to root after entire iteration.
  add(stack.length > 0);

  return current;
}

module.exports = getToc;
