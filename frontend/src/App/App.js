// Import stylesheets
import "./app.scss";

// Import libraries
import React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

// Import custom UIs
import PostContainer from "containers/PostContainer";
import PostListPage from "components/PostListPage/PostListPage";
import LabPage from "components/LabPage";
import AboutPage from "components/AboutPage/AboutPage";
import Nav from "components/Nav/Nav";
import GoogleAds from "components/GoogleAds/GoogleAds";

console.log("Powered by : React " + React.version);

function App() {
  // process 404
  let redirect = null;
  {
    let param = window.location.search.substr(1);
    if (param.indexOf("page=") >= 0) {
      let dest = decodeURIComponent(param.replace("page=", ""));
      if (dest.indexOf("/404.html") >= 0) {
        console.log("Ignore redirect to 404 page.");
      } else {
        console.log("Redirect to " + dest);
        redirect = <Redirect to={dest} />;
      }
    }
  }

  const blogTitle = "{ UnknownPgr }";
  return (
    <>
      <a href="https://github.com/unknownpgr">
        <img
          src="/github.png"
          alt="GitHub"
          className="position-absolute rounded-circle"
          id="blog-github"
        ></img>
      </a>
      <BrowserRouter>
        {redirect}
        <Switch>
          <Route path="/posts/:postName" component={PostContainer} />
          <Route exact path="/about" >
            <div className="blog-title">
              <h1 className="display-4 py-4 text-center">{blogTitle}</h1>
            </div>
            <div className="container container-main">
              <Nav showLeft={false} />
            </div>
            <hr className="hr-full"></hr>
            <AboutPage />
          </Route>
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
      <div>
        <GoogleAds>
          <ins class="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-5695206410217978"
            data-ad-slot="3086325939"
            data-ad-format="auto"
            data-full-width-responsive="true"></ins>
        </GoogleAds>
      </div>
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
