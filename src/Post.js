import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";

function Post(props) {
  const dateStr = (props.date + "").substr(0, 16).replace("T", " / ");
  const categoryStr = "#" + props.category.replace(/ /g, "_");

  return (
    <Card className="m-4" style={{ maxWidth: "24rem", minWidth: "16rem" }}>
      <Card.Img variant="top" src="/code.svg" className="card-img"></Card.Img>
      <Card.Body>
        <Link to={"/" + props.postPath}>
          <Card.Title>{props.title}</Card.Title>
        </Link>
        <Card.Subtitle className="mb-2 text-muted">{dateStr}</Card.Subtitle>
        <Card.Text>{props.text}</Card.Text>
      </Card.Body>
      <Link to={`/categories/${props.category}`}>
        <Card.Footer>
          <small className="text-muted">{categoryStr}</small>
        </Card.Footer>
      </Link>
    </Card>
  );
}

export default Post;
