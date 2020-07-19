import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";

function Post(props) {
  const dateStr = (props.date + "").substr(0, 16).replace("T", " / ");
  const categoryStr = "# " + props.category;

  return (
    <Card className="m-4" style={{ maxWidth: "24rem", minWidth: "16rem" }}>
      <Card.Img variant="top" src="/code.svg" className="card-img"></Card.Img>
      <Card.Body>
        <Link to={"/" + props.path}>
          <Card.Title>{props.title}</Card.Title>
        </Link>
        <Card.Subtitle className="mb-2 text-muted">
          <span style={{ marginRight: "1rem" }}>{dateStr}</span>
          <Link to={`/categories/${props.category}`}>
            <small className="text-muted">{categoryStr}</small>{" "}
          </Link>
        </Card.Subtitle>
        <Card.Text>{props.text}</Card.Text>
      </Card.Body>
    </Card>
  );
}

export default Post;
