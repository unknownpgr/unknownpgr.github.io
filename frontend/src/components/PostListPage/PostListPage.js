import React from "react";
import CardDeck from "react-bootstrap/CardDeck";
import PostCard from "components/PostCard/PostCard";
import "./postlistpage.scss";
import { useMetadata } from "context/metaContext";

function PostListPage({ filter }) {
  const meta = useMetadata();

  let postList = Object.entries(meta);
  if (filter)
    postList = postList.filter(([, { category }]) => category === filter);

  postList = postList.map(([postName, post]) => (
    <PostCard {...post} key={postName} />
  ));

  return (
    <div className="blog-post-list">
      {
        <div className="category" hidden={!filter}>
          <h1>{filter}</h1>
        </div>
      }
      <CardDeck className="justify-content-around">{postList}</CardDeck>
    </div>
  );
}

export default PostListPage;
