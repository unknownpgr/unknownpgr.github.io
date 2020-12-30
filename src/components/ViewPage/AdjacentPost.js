import React from "react";
import { Link } from "react-router-dom";

export default function AdjacentPost({ adj, next }) {
  if (adj) {
    let previousLink = "/posts/" + adj.name;
    return <Link to={previousLink}>{adj.title}</Link>;
  } else {
    return (
      <button className="link-button" onClick={() => alert("없어용")}>
        No {next ? "next" : "previous"} post
      </button>
    );
  }
}
