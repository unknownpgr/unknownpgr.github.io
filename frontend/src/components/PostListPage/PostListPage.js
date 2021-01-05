import React from "react";
import CardDeck from "react-bootstrap/CardDeck";
import PostCard from "components/PostCard/PostCard";
import "./postlistpage.scss";
import mapDict from "libs/mapDict";
import withMetadata from "hocs/withMetadata";

function PostListPage({ filter, meta }) {
  return (
    <CardDeck className="blog-post-list justify-content-around">
      {
        mapDict(meta, (postName, post) => {
          if (filter && filter !== post.category)
            return null;
          return <PostCard {...post} key={postName}></PostCard>;
        }).filter((x) => x)
      }
    </CardDeck>
  );
}

export default withMetadata(PostListPage);
