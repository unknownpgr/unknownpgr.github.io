import React, { Component } from "react";
import { posts, postOrder, categories } from "./meta.json";
import { CardDeck } from "react-bootstrap";
import Post from "./Post";

class PostListPage extends Component {
  render() {
    return (
      <CardDeck className="blog-post-list justify-content-around">
        {postOrder
          .map((post) => {
            let { category } = posts[post];
            if (this.props.filter && this.props.filter !== category)
              return null;
            return <Post {...posts[post]} key={post}></Post>;
          })
          .filter((x) => x)}
      </CardDeck>
    );
  }
}

export default PostListPage;
