import React from "react";
import { Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";
import dateFormat from "libs/dateFormat";
import "./postcard.scss";

function PostCard(props) {
  const categoryStr = "# " + props.category;

  return (
    <Card className="post-card m-4">
      <Card.Img
        variant="top"
        src={props.thumbnail ? props.thumbnail : "/code.png"}
        className="card-img"
      ></Card.Img>
      <Card.Body>
        <Link to={"/posts/" + props.name}>
          <Card.Title>
            {props.title}
          </Card.Title>
        </Link>
        <Card.Subtitle className="mb-2 text-muted">
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id="button-tooltip" {...props}>{new Date(props.date) + ''}</Tooltip>}>
            <small> {dateFormat(new Date(props.date))}</small>
          </OverlayTrigger>
          <Link to={`/categories/${props.category}`}>
            <small className="text-muted">{" " + categoryStr}</small>
          </Link>
        </Card.Subtitle>
      </Card.Body>
    </Card>
  );
}

export default PostCard;
