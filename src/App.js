// Import stylesheets
import 'bootstrap/dist/css/bootstrap.min.css';

// Import metatdata
import meta from './meta.json'

// Import libraries
import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  useLocation
} from 'react-router-dom';

function App() {
  return (
    <Router>
      <Navbar bg='dark' variant='dark' expand="lg">
        <Navbar.Brand>This is a blog title!</Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Link to="/">Main</Link>
            <Link to="/about">About</Link>
          </Nav>
        </Navbar.Collapse>

      </Navbar>
      <Switch>
        <Route exact path="/">
          <Main></Main>
        </Route>
        <Route path="/posts/:postName" component={Post}>
        </Route>
        <Route path="/about" component={About}>
        </Route>
        <Route component={NoMatch}>
        </Route>
      </Switch>
    </Router>
  );
}

function NoMatch() {
  return (
    <div>Path {useLocation().pathname} is unregistered route.</div>
  )
}

function Main() {
  return (
    <div>
      TEST
      <ul>
        <h1>Post List</h1>
        {meta.posts.map((post, i) =>
          <li key={i}>
            <Link to={post.postPath} >{post.title}</Link>
          </li>
        )}
      </ul>
      List Fin
    </div>
  )
}

function About(props) {
  return <div>
    This is my information!
</div>
}

function Post(props) {
  return (
    <div>Selected post = {props.match.params.postName}</div>
  )
}

export default App;
