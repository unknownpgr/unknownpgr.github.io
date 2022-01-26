import React, { useEffect } from "react";
import dateFormat from "libs/dateFormat";
import { Link } from "react-router-dom";
import TOC from "./TOC";
import AdjacentPost from "./AdjacentPost";
import UtterancesContainer from "containers/UtterancesContainer";
import "./viewpage.scss";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Constants from "constants/constants";
import { useMetadata } from "context/metaContext";

function useAdjacentPost(currentPostName) {
  const meta = useMetadata();

  let previous = null;
  let next = null;

  let posts = Object.keys(meta);
  let postIndex = posts.indexOf(currentPostName);

  if (postIndex > 0) {
    next = meta[posts[postIndex - 1]];
  }

  if (postIndex < posts.length - 1) {
    previous = meta[posts[postIndex + 1]];
  }

  return [previous, next];
}

function CategoryPosts({ post }) {
  const meta = useMetadata();
  if (!post) return null;

  const { category, name } = post;
  let center = 0;
  const posts = Object.keys(meta)
    .filter((key) => meta[key].category === category)
    .map((key, i) => {
      if (key === post.name) center = i;
      return meta[key];
    });

  const start = Math.max(Math.min(center - 2, posts.length - 5), 0);
  const end = Math.min(Math.max(center + 3, 5), posts.length);

  const subposts = [];
  for (let i = start; i < end; i++) {
    subposts.push(posts[i]);
  }

  return (
    <div className="category-list">
      <div className="label">
        Other posts in <Link to={"/categories/" + category}>{category}</Link>{" "}
        category
      </div>
      <ul>
        {subposts.map((post) => {
          const bold = name === post.name;
          return (
            <li key={post.name} className={bold ? "bold" : ""}>
              <Link to={"/posts/" + post.name}>{post.title}</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ViewPage({ isLoading, post, html, toc }) {
  const [prev, next] = useAdjacentPost(post.name);
  useEffect(() => {
    if (isLoading) window.scrollTo(0, 0);
  }, [isLoading]);

  return (
    <div className="view-page">
      <div className="title">
        <Link to="/">{Constants.BLOG_TITLE}</Link>
      </div>
      <div className=" post-header">
        <h1 className="post-title">{post ? post.title : "Loading post..."}</h1>
        <div>
          <OverlayTrigger
            placement="top"
            overlay={
              post ? (
                <Tooltip id="button-tooltip">
                  {new Date(post.date) + ""}
                </Tooltip>
              ) : null
            }>
            <span>
              {dateFormat(post ? new Date(post.date) : new Date(), true)}
            </span>
          </OverlayTrigger>
          <Link to={`/categories/${post?.category}`}>
            <span className="text-muted" style={{ marginLeft: "1rem" }}>
              #{post?.category}
            </span>
          </Link>
        </div>
      </div>
      <div>
        <hr style={{ marginTop: "2rem" }}></hr>
      </div>
      <div className="container">
        <div className="toc" hidden={isLoading}>
          <TOC toc={toc}></TOC>
        </div>
        {isLoading ? (
          <div className="blog-post blog-post-loading">Loading...</div>
        ) : (
          <div
            className="blog-post"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
        <div className="adj-posts">
          <div className="adj-post">
            <AdjacentPost adj={prev} />
          </div>
          <div className="adj-post">
            <AdjacentPost adj={next} next />
          </div>
        </div>
        <CategoryPosts post={post} />
        {/* Comment section */}
        {isLoading ? (
          "Comment section is loading..."
        ) : (
          <UtterancesContainer hash={post?.name} />
        )}
      </div>
    </div>
  );
}

export default ViewPage;
