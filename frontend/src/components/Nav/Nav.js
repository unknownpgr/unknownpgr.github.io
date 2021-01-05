import React, { useState } from 'react';
import { withRouter, Link } from "react-router-dom";
import "./nav.scss";
import mapDict from "libs/mapDict";
import withMetadata from "hocs/withMetadata";

function Nav({ location, meta }) {

  let [open, setOpen] = useState(false);

  let categories = {};
  {
    let totalCount = 0;
    for (let key in meta) {
      let { category: cat_ } = meta[key];
      if (categories[cat_] === undefined) categories[cat_] = { link: `/categories/${cat_}`, count: 1 };
      else categories[cat_].count++;
      totalCount++;
    }
    categories = { all: { link: '/', count: totalCount }, ...categories };
  }

  let cat = null;
  {
    let list = location.pathname.split('/');
    cat = list.pop();
    if (!cat) cat = list.pop();
  }

  let toggleClass = open ? 'toggle-open' : '';
  let navClass = open ? 'nav-open' : '';
  let toggleText = open ? 'X' : '=';

  return <nav className={"blog-nav"}>
    <button className={"toggle " + toggleClass} onClick={() => setOpen(!open)}>{toggleText}</button>
    <div className={"nav-view " + navClass} onClick={() => setOpen(false)}>
      <Link className="p-2" to="/"> Main </Link>
      <Link className="p-2" to="/about"> About </Link>
      <Link className="p-2" to="/lab"> Lab </Link>
      <hr></hr>
      <div id="blog-side-right">
        {mapDict(categories, (category, { link, count }) => {
          const boldClass = (cat === category) || (link === '/' && !cat) ? 'bold' : '';
          return (
            <Link
              className={"p-2 " + boldClass}
              key={category}
              to={link}>
              {`${category}(${count})`}
            </Link>
          );
        })}
      </div>
    </div>
  </nav>;
}

export default withRouter(withMetadata(Nav));