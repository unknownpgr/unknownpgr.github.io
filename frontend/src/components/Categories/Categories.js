import React from "react";
import { Link, withRouter } from "react-router-dom";
import mapDict from "libs/mapDict";
import "./categories.scss";
import { useMetadata } from "context/metaContext";

function Categories() {
  const meta = useMetadata();

  const categories = {};
  let totalCount = 0;
  for (let key in meta) {
    let { category } = meta[key];
    if (!categories[category]) categories[category] = 1;
    else categories[category]++;
    totalCount++;
  }

  return (
    <div className={"categories"}>
      <ul>
        <li>
          <Link to={`/`}>{`all(${totalCount})`}</Link>
        </li>
        {Object.entries(categories).map(([category, count]) => (
          <li key={category}>
            <Link to={`/categories/${category}`}>
              {`${category}(${count})`}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default withRouter(Categories);
