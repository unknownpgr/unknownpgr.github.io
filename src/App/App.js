// Import stylesheets
import "./app.scss";

// Import metatdata
import meta from "meta.json";

// Import libraries
import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { BrowserRouter, Route, Link, Switch, Redirect, withRouter } from "react-router-dom";

// Import custom UIs
import img from "img/github.png";
import PostContainer from "containers/PostContainer/PostContainer";
import PostListPage from "components/PostListPage/PostListPage";
import LabPage from "components/LabPage";
import AboutPage from "components/AboutPage/AboutPage.js";

console.log("Powered by : React " + React.version);

let categories = {};
for (let key in meta) {
  let cur = meta[key];
  if (categories[cur.category] === undefined) categories[cur.category] = 1;
  else categories[cur.category]++;
}

function App() {
  // process 404
  {
    let param = window.location.search.substr(1);
    if (param.indexOf("page=") >= 0) {
      let dest = decodeURIComponent(param.replace("page=", ""));
      if (dest.indexOf("/404.html") >= 0) {
        console.log("Ignore redirect to 404 page.");
      } else {
        console.log("Redirect to " + dest);
        return <Redirect to={dest} />;
      }
    }
  }

  const blogTitle = "{ UnknownPgr }";
  return (
    <>
      <a href="https://github.com/unknownpgr">
        <img
          src={img}
          alt="GitHub"
          className="position-absolute rounded-circle"
          id="blog-github"
        ></img>
      </a>
      <BrowserRouter>
        <Switch>
          <Route path="/posts/:postName" component={PostContainer} />
          <Route exact path="/about" component={AboutPage} />
          <Route>
            <div className="blog-title">
              <h1 className="display-4 py-4 text-center">{blogTitle}</h1>
            </div>
            <div className="container container-main">
              <BNWR />
              <hr></hr>
              <Route exact path="/" component={PostListPage} />
              <Route path="/categories/:category" component={CategoryPage} />
              <Route path="/lab" component={LabPage} />
            </div>
          </Route>
          <Route component={NoMatchPage} />
        </Switch>
      </BrowserRouter>
      <footer className="page-footer font-small mb-4">
        <div id="blog-footer-inner" className="text-center py-4">
          © 2020 Copyright :
          <a href="https://github.com/unknownpgr"> Unknownpgr</a>
        </div>
      </footer>
    </>
  );
}

function BlogNav(props) {
  let cat = null;
  let params = props.location.pathname.split('/');
  cat = params.pop();
  if (!cat) cat = params.pop();
  return (
    <Navbar id="navbar" expand="lg" className="rounded-top">
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto" id="collapse">
          <Link className="p-2" to="/">
            Main
          </Link>
          <Link className="p-2" to="/about">
            About
          </Link>
          <Link className="p-2" to="/lab">
            Lab
          </Link>
          <div id="blog-side-right">
            <Link className="p-2" to="/">
              All({Object.keys(meta).length})
            </Link>
            {Object.keys(categories).map((category) => {
              const str = `${category}(${categories[category]})`;
              if (category === cat) {
                return (
                  <Link
                    className="p-2"
                    key={category}
                    to={`/categories/${category}`}
                  >
                    <strong>{str}</strong>
                  </Link>
                );
              } else {
                return (
                  <Link
                    className="p-2"
                    key={category}
                    to={`/categories/${category}`}
                  >
                    {str}
                  </Link>
                );
              }
            })}
          </div>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

const BNWR = withRouter(BlogNav);

function NoMatchPage() {
  return <div>Path is unregistered route.</div>;
}

function CategoryPage(props) {
  return <PostListPage filter={props.match.params.category} />;
}

export default App;
