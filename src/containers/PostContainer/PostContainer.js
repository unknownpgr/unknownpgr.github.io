import React, { Component } from "react";
import meta from "meta.json";
import ViewPage from "components/ViewPage/ViewPage";
import { withRouter } from "react-router-dom";

function getAdjacentPost(currentPostName) {
  let previous = null;
  let next = null;

  let category = meta[currentPostName].category;
  let categoryPost = Object.keys(meta).filter(
    (post) => meta[post].category === category
  );
  let postIndex = categoryPost.indexOf(currentPostName);

  if (postIndex > 0) {
    next = meta[categoryPost[postIndex - 1]];
  }

  if (postIndex < (categoryPost.length - 1)) {
    previous = meta[categoryPost[postIndex + 1]];
  }

  return [previous, next];
}

class PostContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      post: null,
      adj: [null, null],
      content: '',
      toc: []
    };
  }

  componentDidMount() {
    this.update();
    this.unlisten = this.props.history.listen(this.update);
  }

  componentWillUnmount() {
    this.unlisten();
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
      if (!meta[postName]) return;
    }

    let post = meta[postName];
    let adj = getAdjacentPost(postName);
    this.setState({ post, adj, html: '', toc: [] });

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

export default withRouter(PostContainer);
