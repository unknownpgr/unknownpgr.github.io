// Import stylesheets
import "./app.scss";

// Import libraries
import React from "react";
import { BrowserRouter, Route, Switch, Redirect, Link } from "react-router-dom";

// Import custom UIs
import PostContainer from "containers/PostContainer";
import PostListPage from "components/PostListPage/PostListPage";
import LabPage from "components/LabPage/LabPage";
import AboutPage from "components/AboutPage/AboutPage";
import Nav from "components/Nav/Nav";
import GoogleAds from "components/GoogleAds/GoogleAds";
import Categories from "components/Categories/Categories";

// Import constants
import Constants from "constants/constants";
import NoMatchPage from "components/NoMatchPage/NoMatchPage";

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

  return (
    <>
      <BrowserRouter>
        {redirect}
        <Switch>
          <Route path="/posts/:postName" component={PostContainer} />
          <Route>
            <div className="blog-title">
              <h1 ><Link to="/">{Constants.BLOG_TITLE}</Link></h1>
            </div>
            <div className="container container-main">
              <Nav />
            </div>
            <hr className="hr-full"></hr>
            <Switch>
              <Route exact path="/O_o" >
                <AboutPage />
              </Route>
              <Route>
                <div className="container container-main">
                  <Switch>
                    <Route exact path="/" component={PostListPage} />
                    <Route path="/categories/:category" component={CategoryPage} />
                    <Route exect path="/categories" component={Categories} />
                    <Route path="/lab" component={LabPage} />
                    <Route component={NoMatchPage} />
                  </Switch>
                </div>
              </Route>
            </Switch>
          </Route>
        </Switch>
      </BrowserRouter>
      <div className="google-ads">
        <GoogleAds>
          <ins class="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-5695206410217978"
            data-ad-slot="3086325939"
            data-ad-format="auto"
            data-full-width-responsive="true"></ins>
        </GoogleAds>
      </div>
      <footer className="page-footer">
        <div className="footer-inner">
          <div className="logos">
            <a href="https://github.com/unknownpgr">
              <img
                src="/github.png"
                alt="GitHub"
                className="logo rounded-circle"
              ></img>
            </a>
          </div>
          <div className="blog-footer">
            © 2020 Copyright :
            <a href="https://github.com/unknownpgr"> Unknownpgr</a>
          </div>
        </div>
      </footer>
    </>
  );
}

function CategoryPage(props) {
  return <PostListPage filter={props.match.params.category} />;
}

export default App;
