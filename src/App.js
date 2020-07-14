// Import stylesheets
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/main.css";
import img from "./img/github.png";

// Import metatdata
import { posts, postOrder, categories } from "./meta.json";

// Import libraries
import React from "react";
import { Navbar, Nav, Card, CardDeck } from "react-bootstrap";
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
        <h1 className="display-4 py-4 text-center text-light">{blogTitle}</h1>
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
          <Navbar bg="dark" variant="dark" expand="lg" className="rounded-top">
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
      <footer className="page-footer font-small">
        <div id="blog-footer-inner" className="text-center py-4">
          © 2020 Copyright :
          <a href="https://github.com/unknownpgr"> Unknownpgr</a>
        </div>
      </footer>
    </Router>
  );
}

function NoMatchPage() {
  return <div>Path {useLocation().pathname} is unregistered route.</div>;
}

function PostListPage(props) {
  if (props.filter) console.log("filter : ", props.filter);
  return (
    <CardDeck className="pt-4 justify-content-around">
      {postOrder
        .map((post) => {
          let { postPath, title, category } = posts[post];
          if (props.filter && props.filter !== category) return null;
          return (
            <Post
              href={postPath}
              title={title}
              category={category}
              key={post}
            ></Post>
          );
        })
        .filter((x) => x)}
    </CardDeck>
  );
}

function AboutPage(props) {
  return <div> This is my information! </div>;
}

function Post(props) {
  return (
    <Card
      className="text-white bg-dark mb-3 shadow-sm"
      style={{ maxWidth: "24rem", minWidth: "16rem" }}
    >
      <Card.Body>
        <Link to={props.href}>
          <Card.Title>{props.title}</Card.Title>
        </Link>
        <Card.Text>
          This is a wider card with supporting text below as a natural lead-in
          to additional content. This content is a little bit longer.
        </Card.Text>
      </Card.Body>
      <Card.Footer>
        {props.category && (
          <small className="text-muted">
            {"#" + props.category.replace(/ /g, "_")}
          </small>
        )}
      </Card.Footer>
    </Card>
  );
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
