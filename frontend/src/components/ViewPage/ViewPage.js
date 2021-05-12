import React from "react";
import dateFormat from "libs/dateFormat";
import { Link } from "react-router-dom";
import TOC from "./TOC";
import AdjacentPost from "./AdjacentPost";
import UtterancesContainer from "containers/UtterancesContainer";
import "./viewpage.scss";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Constants from "constants/constants";

function ViewPage({ post, html, toc, adj, posts }) {

  // When the page is refreshed, go to the top of the page
  if (!html) {
    window.scrollTo(0, 0);
  }

  return (
    <div className="view-page">
      <div className="title">
        <Link to="/">{Constants.BLOG_TITLE}</Link>
      </div>
      <div className=" post-header">
        <h1 className="post-title">
          {post ? post.title : "Loading post..."}
        </h1>
        <div>
          <OverlayTrigger
            placement="top"
            overlay={post ? <Tooltip id="button-tooltip">{new Date(post.date) + ''}</Tooltip> : null}>
            <span>{dateFormat(post ? new Date(post.date) : new Date(), true)}</span>
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
        <div className="toc"><TOC toc={toc}></TOC></div>
        <div className={"blog-post " + (html ? '' : 'blog-post-loading')} dangerouslySetInnerHTML={{ __html: html }}></div>
        <div className="adj-posts">
          <div className="adj-post">
            <AdjacentPost adj={adj[0]} />
          </div>
          <div className="adj-post">
            <AdjacentPost adj={adj[1]} next />
          </div>
        </div>
        <div className="category-list">
          <div className="label">
            Other posts in <Link to={"/categories/" + post?.category}>{post?.category}</Link> category
          </div>
          <ul>
            {
              posts.map(p => {
                let bold = post?.name === p.name;
                return <li className={bold ? "bold" : ""}><Link to={"/posts/" + p.name}>{p.title}</Link></li>;
              })
            }
          </ul>
        </div>
        {/* Comment section */}
        <UtterancesContainer />
      </div>
    </div >
  );
}

export default ViewPage;
