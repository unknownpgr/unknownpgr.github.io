import React, { Component } from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";

function Post(props) {
  return (
    <Card className="mb-3" style={{ maxWidth: "24rem", minWidth: "16rem" }}>
      <Card.Img
        variant="top"
        src="/code.png"
        // style={{ width: "80%" }}
      ></Card.Img>
      <Card.Body>
        <div className="blog-card-title">
          <Link to={props.postPath}>
            <Card.Title>{props.title}</Card.Title>
          </Link>
          <Card.Subtitle>
            {(props.date + "").substr(0, 16).replace("T", " / ")}
          </Card.Subtitle>
        </div>
        <Card.Text>{props.text}</Card.Text>
      </Card.Body>
      <Link to={`/categories/${props.category}`}>
        <Card.Footer>
          {props.category && (
            <small className="text-muted">
              {"#" + props.category.replace(/ /g, "_")}
            </small>
          )}
        </Card.Footer>
      </Link>
    </Card>
  );
}

export default Post;
