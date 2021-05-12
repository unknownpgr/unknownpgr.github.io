import React from "react";
import { Link } from "react-router-dom";

export default function AdjacentPost({ adj, next }) {
  if (adj) {
    let previousLink = "/posts/" + adj.name;
    return <Link to={previousLink}>{next ? "NEXT →" : "← PREV"}</Link>;
  } else {
    return null;
  }
}
