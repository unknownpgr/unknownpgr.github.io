// Import stylesheets
import 'bootstrap/dist/css/bootstrap.min.css';

// Import metatdata
import { posts, postOrder, categories } from './meta.json'

// Import libraries
import React, { useState } from 'react';
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
            <Nav.Link><Link to="/"     > Main</Link></Nav.Link>
            <Nav.Link><Link to="/about">About</Link></Nav.Link>
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
        {postOrder.map(post => {
          const { postPath, title } = posts[post]
          return <li key={post}>
            <Link to={postPath} >{title}</Link>
          </li>
        })}
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

class Post extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      content: <p>Now lading...</p>
    }
  }

  componentDidMount() {
    const postName = this.props.match.params.postName
    const { jsxFilePath } = posts[postName]
    import('./' + jsxFilePath.replace('.jsx', '')).then(loaded => {
      const Comp = loaded.default
      this.setState({
        content: <Comp></Comp>
      })
    })
  }


  render() {
    return (
      <div>
        {this.state.content}
      </div>
    )

  }
}

export default App;
