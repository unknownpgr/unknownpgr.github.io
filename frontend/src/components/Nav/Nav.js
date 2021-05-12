// import Constants from "constants/constants";
import React from 'react';
import { Link } from "react-router-dom";
import "./nav.scss";

function Nav() {
  return <nav className={"blog-nav"}>
    {/* <Link className="title" to="/">{Constants.BLOG_TITLE}</Link> */}
    <Link className="menu" to="/"> Main </Link>
    <Link className="menu" to="/about"> About </Link>
    <Link className="menu" to="/categories"> Categories </Link>
    <Link className="menu" to="/lab"> Lab </Link>
  </nav>;
}

export default Nav;