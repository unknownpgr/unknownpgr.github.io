import React from "react";
import { posts, postOrder } from "meta.json";
import CardDeck from "react-bootstrap/CardDeck";
import PostCard from "components/PostCard";

class PostListPage extends React.Component {
  render() {
    return (
      <CardDeck className="blog-post-list justify-content-around">
        {postOrder
          .map((post) => {
            let { category } = posts[post];
            if (this.props.filter && this.props.filter !== category)
              return null;
            return <PostCard {...posts[post]} key={post}></PostCard>;
          })
          .filter((x) => x)}
      </CardDeck>
    );
  }
}

export default PostListPage;
