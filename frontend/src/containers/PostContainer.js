import React, { Component } from "react";
import ViewPage from "components/ViewPage/ViewPage";
import { withRouter } from "react-router-dom";
import withMetadata from "hocs/withMetadata";

function getAdjacentPost(meta, currentPostName) {
  let previous = null;
  let next = null;

  let posts = Object.keys(meta);
  let postIndex = posts.indexOf(currentPostName);

  if (postIndex > 0) {
    next = meta[posts[postIndex - 1]];
  }

  if (postIndex < (posts.length - 1)) {
    previous = meta[posts[postIndex + 1]];
  }

  return [previous, next];
}

function getCategoryPosts(meta, currentPostName) {
  let { category } = meta[currentPostName];
  let center = 0;
  let posts = Object.keys(meta)
    .filter(key => meta[key].category === category)
    .map((key, i) => {
      if (key === currentPostName) center = i;
      return meta[key];
    });

  if (posts.length < 5) return posts;
  if (center < 2) center = 2;
  if (center > posts.length - 3) center = posts.length - 3;
  let subposts = [];
  for (let i = -2; i < 3; i++) {
    subposts.push(posts[center + i]);
  }
  return subposts;
}

class PostContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      post: null,
      adj: [null, null],
      html: null,
      toc: [],
      posts: []
    };
  }

  componentDidMount() {
    this.update();
    this.unlisten = this.props.history.listen(this.update);
  }

  componentWillUnmount() {
    this.unlisten();
  }

  componentDidUpdate(preProps, preState) {
    if (this.props.meta !== preProps.meta) this.update();
  }

  // Update will be called whenever post changes.
  update = async () => {
    // Get post name
    let postName = null;
    {
      let list = this.props.history.location.pathname.split('/');
      postName = list.pop();
      if (!postName) postName = list.pop();
      if (!postName) return;
      if (!this.props.meta[postName]) return;
      if (this.state.post && this.state.post.name === postName) return;
    }

    let meta = this.props.meta;
    let post = meta[postName];
    let adj = getAdjacentPost(meta, postName);
    let posts = getCategoryPosts(meta, postName);

    this.setState({ post, adj, html: null, toc: [], posts });

    let [html, toc] = await Promise.all([
      fetch('/posts/' + postName + '/post.html')
        .then(data => data.text()),
      fetch('/posts/' + postName + '/toc.json')
        .then(data => data.json())
    ]);

    this.setState({ html, toc });
  };

  render() {
    return <ViewPage {...this.state}></ViewPage>;
  }
}

export default withRouter(withMetadata(PostContainer));
