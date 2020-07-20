// Import stylesheets
import "./scss/custom.scss";

// Import metatdata
import { categories, postOrder } from "./meta.json";

// Import libraries
import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";

import BrowserRouter from "react-router-dom/BrowserRouter";
import Route from "react-router-dom/Route";
import Link from "react-router-dom/Link";
import Switch from "react-router-dom/Switch";

// Import UIs
import img from "./img/github.png";
import ViewPage from "./ViewPage";
import PostListPage from "./PostListPage";

function App() {
  const blogTitle = "{ UnknownPgr }";
  return (
    <BrowserRouter>
      <a href="https://github.com/unknownpgr">
        <img
          src={img}
          alt="GitHub"
          className="position-absolute rounded-circle"
          id="blog-github"
        ></img>
      </a>
      <Switch>
        <Route path="/posts/:postName" component={ViewPage}></Route>
        <Route exact path="/about" component={AboutPage} />
        <Route>
          <div className="blog-title">
            <h1 className="display-4 py-4 text-center">{blogTitle}</h1>
          </div>
          <div className="container">
            <Navbar id="navbar" expand="lg" className="rounded-top">
              <Navbar.Brand>UnknownPgr의 블로그.</Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                  <Link className="p-2" to="/">
                    Main
                  </Link>
                  <Link className="p-2" to="/about">
                    About
                  </Link>
                </Nav>
              </Navbar.Collapse>
            </Navbar>
            <hr></hr>
            <Route exact path="/" component={PostListPage} />
            <Route path="/categories/:category" component={CategoryPage} />
          </div>
          <div id="blog-side-right">
            <ul>
              <li>
                <Link to="/">all({postOrder.length})</Link>
              </li>
              {Object.keys(categories).map((category) => {
                const str = `${category}(${categories[category].count})`;
                return (
                  <li key={category}>
                    <Link to={`/categories/${category}`}>{str}</Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </Route>
        <Route component={NoMatchPage} />
      </Switch>
      <footer className="page-footer font-small mb-4">
        <div id="blog-footer-inner" className="text-center py-4">
          © 2020 Copyright :
          <a href="https://github.com/unknownpgr"> Unknownpgr</a>
        </div>
      </footer>
    </BrowserRouter>
  );
}

function ParamRouter(props) {
  console.log(props);
  return (
    <Route
      {...props}
      render={(innerProps) => (
        <props.inner {...innerProps} {...props}></props.inner>
      )}
    ></Route>
  );
}

function NoMatchPage() {
  return <div>Path is unregistered route.</div>;
}

function AboutPage(props) {
  return <div> This is my information! </div>;
}

function CategoryPage(props) {
  return <PostListPage filter={props.match.params.category}></PostListPage>;
}

export default App;
