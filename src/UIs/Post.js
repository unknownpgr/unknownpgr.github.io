import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import dateFormat from "dateFormat";

function Post(props) {
  return (
    <Card className="m-4" style={{ maxWidth: "24rem", minWidth: "16rem" }}>
      <Card.Img variant="top" src="/code.svg" className="card-img"></Card.Img>
      <Card.Body>
        <Link to={"/" + props.path}>
          <Card.Title>
            <strong>{props.title}</strong>
          </Card.Title>
        </Link>
        <Card.Subtitle className="mb-2 text-muted">
          <span style={{ marginRight: "1rem" }}>
            <small> {dateFormat(new Date(props.date))}</small>
          </span>
          <Link to={`/categories/${props.category}`}>
            <small className="text-muted">{"# " + props.category}</small>
          </Link>
        </Card.Subtitle>
        <Card.Text>{props.text}</Card.Text>
      </Card.Body>
    </Card>
  );
}

export default Post;
