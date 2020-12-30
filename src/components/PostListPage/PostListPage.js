import React from "react";
import meta from "meta.json";
import CardDeck from "react-bootstrap/CardDeck";
import PostCard from "components/PostCard";
import "./postlistpage.scss";

class PostListPage extends React.Component {

  render() {
    return (
      <CardDeck className="blog-post-list justify-content-around">
        {Object.keys(meta)
          .map(x => meta[x])
          .map((post) => {
            let { category } = post;
            if (this.props.filter && this.props.filter !== category)
              return null;
            return <PostCard {...post} key={post.name}></PostCard>;
          })
          .filter((x) => x)}
      </CardDeck>
    );
  }
}

export default PostListPage;
