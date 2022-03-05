import React from "react";
import { Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";
import dateFormat from "libs/dateFormat";
import "./postcard.scss";

function PostCard({ name, category, title, date, thumbnail }) {
  const categoryStr = "# " + category;

  return (
    <Card className="post-card m-4">
      <Link to={`/posts/${name}/`}>
        <Card.Img
          variant="top"
          src={thumbnail ? thumbnail : "/code.png"}
          className="card-img"></Card.Img>
      </Link>
      <Card.Body>
        <Link to={`/posts/${name}/`}>
          <Card.Title>{title}</Card.Title>
        </Link>
        <Card.Subtitle className="mb-2 text-muted">
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip id="button-tooltip">{new Date(date) + ""}</Tooltip>
            }>
            <small> {dateFormat(new Date(date))}</small>
          </OverlayTrigger>
          <Link to={`/categories/${category}/`}>
            <small className="text-muted">{" " + categoryStr}</small>
          </Link>
        </Card.Subtitle>
      </Card.Body>
    </Card>
  );
}

export default PostCard;
