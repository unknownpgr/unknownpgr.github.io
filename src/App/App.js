// Import stylesheets
import "./app.scss";

// Import libraries
import React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

// Import custom UIs
import img from "img/github.png";
import PostContainer from "containers/PostContainer/PostContainer";
import PostListPage from "components/PostListPage/PostListPage";
import LabPage from "components/LabPage";
import AboutPage from "components/AboutPage/AboutPage.js";
import Nav from "components/Nav/Nav";

console.log("Powered by : React " + React.version);

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
              <Nav />
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

function NoMatchPage() {
  return <div>Path is unregistered route.</div>;
}

function CategoryPage(props) {
  return <PostListPage filter={props.match.params.category} />;
}

export default App;
