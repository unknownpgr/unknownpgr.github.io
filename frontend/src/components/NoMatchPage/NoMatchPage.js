import React from "react";
import "./noMatchPage.scss";
import nomatch from "./nomatch.jpg";

export default function NoMatchPage() {
    return <div className="no-match-page">
        <h1>This page is empty!</h1>
        <img src={nomatch} alt="" />
        <p>...아무것도 없어용...</p>
    </div>;
}
