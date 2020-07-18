// Import stylesheets
import "./scss/custom.scss";
import img from "./img/github.png";
import Post from "./Post";

// Import metatdata
import { posts, postOrder, categories } from "./meta.json";

// Import libraries
import React from "react";
import { Navbar, Nav, CardDeck } from "react-bootstrap";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  useLocation,
} from "react-router-dom";

function App() {
  const blogTitle = "{ UnknownPgr }";

  return (
    <Router>
      <div className="blog-title">
        <h1 className="display-4 py-4 text-center">{blogTitle}</h1>
        <a href="https://github.com/unknownpgr">
          <img
            src={img}
            alt="GitHub"
            className="position-absolute rounded-circle"
            id="blog-github"
          ></img>
        </a>
      </div>
      <div id="blog-wrapper">
        <div id="blog-side-left">{/* Currently empty! */}</div>
        <div id="blog-center" className="shadow">
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
          <div className="container">
            <Switch>
              <Route exact path="/" component={PostListPage} />
              <Route path="/posts/:postName" component={PostPage} />
              <Route path="/categories/:category" component={CategoryPage} />
              <Route path="/about" component={AboutPage} />
              <Route component={NoMatchPage} />
            </Switch>
          </div>
        </div>
        <div id="blog-side-right">
          <ul>
            {Object.keys(categories).map((category) => {
              const str = `${category}(${categories[category].postCount})`;
              return (
                <li key={category}>
                  <Link to={`/categories/${category}`}>{str}</Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <footer className="page-footer font-small mb-4">
        <div id="blog-footer-inner" className="text-center py-4">
          © 2020 Copyright :
          <a href="https://github.com/unknownpgr"> Unknownpgr</a>
        </div>
      </footer>
      <div id="bar">
        <span id="bar-l">SSH: web-dev.iptime.org</span>
        <span id="bar-r">
          Branch : master # # # # # I added this VSCode-like status bar just for
          fun. lol
        </span>
      </div>
    </Router>
  );
}

function NoMatchPage() {
  return <div>Path {useLocation().pathname} is unregistered route.</div>;
}

function PostListPage(props) {
  if (props.filter) console.log("filter : ", props.filter);
  return (
    <CardDeck className="blog-post-list pt-4 justify-content-around">
      {postOrder
        .map((post) => {
          let { category } = posts[post];
          if (props.filter && props.filter !== category) return null;
          return <Post {...posts[post]} key={post}></Post>;
        })
        .filter((x) => x)}
    </CardDeck>
  );
}

function AboutPage(props) {
  return <div> This is my information! </div>;
}

class PostPage extends React.Component {
  constructor(props) {
    super(props);
    // Content is html converted markdown file.
    this.Content = <p>Now lading...</p>;
  }

  componentDidMount() {
    const postName = this.props.match.params.postName;
    const { jsxFilePath } = posts[postName];
    import("./" + jsxFilePath.replace(".jsx", "")).then((loaded) => {
      const Content = loaded.default;
      this.Content = <Content></Content>;
      this.forceUpdate();
    });
  }

  render() {
    return <div>{this.Content}</div>;
  }
}

function CategoryPage(props) {
  return <PostListPage filter={props.match.params.category}></PostListPage>;
}

export default App;
