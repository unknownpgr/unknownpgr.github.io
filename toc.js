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
function getToc(html) {
  // Get header tags
  // This regex is not perfect. but, It works anyway.
  const headers = [...html.matchAll(/<h[0-9]+[^<>]*>.+<\/h[0-9]+[^<>]*>/g)];

  // Make stack
  let stack = [];
  let current = [];

  // Make header tree with inverse DFS
  headers.forEach((header) => {
    const [raw] = header;
    const id = raw.match(/id="[^"]+"/)[0].replace(/id=|"/g, "");
    const text = raw.replace(/<\/?h[0-9]+[^<>]*>/g, ""); // Remove <hx> tag
    const [depth] = raw.match(/[0-9]+/);

    // If new item has higher depth than current depth
    while (depth > stack.length + 1) {
      stack.push(current);
      current = [];
    }

    // If new item has lower depth than current depth
    while (depth < stack.length + 1) {
      const temp = current;
      current = stack.pop();
      if (current.length == 0) current.push({});
      current[current.length - 1].children = temp;
    }
    current.push({ id, text });
  });

  // Don't forget to return to root after entire iteration.
  while (stack.length) {
    const temp = current;
    current = stack.pop();
    if (current.length == 0) current.push({});
    current[current.length - 1].children = temp;
  }

  return current;
}

module.exports = getToc;
