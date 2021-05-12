import React from "react";
import CardDeck from "react-bootstrap/CardDeck";
import PostCard from "components/PostCard/PostCard";
import "./postlistpage.scss";
import mapDict from "libs/mapDict";
import withMetadata from "hocs/withMetadata";

function PostListPage({ filter, meta }) {
  return (
    <div className="blog-post-list">
      {
        filter && <div className={"category"}>
          <h1>{filter}</h1>
        </div>
      }
      <CardDeck className="justify-content-around">
        {
          mapDict(meta, (postName, post) => {
            if (filter && filter !== post.category)
              return null;
            return <PostCard {...post} key={postName}></PostCard>;
          }).filter((x) => x)
        }
      </CardDeck>
    </div>
  );
}

export default withMetadata(PostListPage);
