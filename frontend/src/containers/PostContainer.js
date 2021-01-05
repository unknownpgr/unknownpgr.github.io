import React, { Component } from "react";
import ViewPage from "components/ViewPage/ViewPage";
import { withRouter } from "react-router-dom";
import withMetadata from "hocs/withMetadata";

function getAdjacentPost(meta, currentPostName) {
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
      html: null,
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

    let post = this.props.meta[postName];
    let adj = getAdjacentPost(this.props.meta, postName);
    this.setState({ post, adj, html: null, toc: [] });

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
