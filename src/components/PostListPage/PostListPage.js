import React from "react";
import meta from "meta.json";
import CardDeck from "react-bootstrap/CardDeck";
import PostCard from "components/PostCard/PostCard";
import "./postlistpage.scss";
import mapDict from "libs/mapDict";

function PostListPage({ filter }) {
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

export default PostListPage;
