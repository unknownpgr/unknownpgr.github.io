import React from "react";
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

  const { category, name } = post;
  let center = 0;
  const posts = Object.keys(meta)
    .filter((key) => meta[key].category === category)
    .map((key, i) => {
      if (key === post.name) center = i;
      return meta[key];
    });

  if (center < 2) center = 2;
  if (center > posts.length - 3) center = posts.length - 3;

  let subposts = [];
  for (let i = -2; i < 3; i++) {
    subposts.push(posts[center + i]);
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

function ViewPage({ post, html, toc }) {
  console.log(post, html, toc);

  // When the page is refreshed, go to the top of the page
  if (!html) {
    window.scrollTo(0, 0);
  }

  const [prev, next] = useAdjacentPost(post.name);

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
        <div className="toc">
          <TOC toc={toc}></TOC>
        </div>
        <div
          className={"blog-post " + (html ? "" : "blog-post-loading")}
          dangerouslySetInnerHTML={{ __html: html }}></div>
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
        <UtterancesContainer hash={post?.name} />
      </div>
    </div>
  );
}

export default ViewPage;
