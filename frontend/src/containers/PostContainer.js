import React, { useEffect } from "react";
import ViewPage from "components/ViewPage/ViewPage";
import { withRouter } from "react-router-dom";
import { useState } from "react";
import { useMetadata } from "context/metaContext";

function PostContainer({ history }) {
  const meta = useMetadata();

  const [html, setHTML] = useState(null);
  const [toc, setToc] = useState(null);
  const [currentPostName, setCurrentPostName] = useState(null);

  let list = history.location.pathname.split("/");
  let postName = list.pop();
  if (!postName) postName = list.pop();

  const post = meta[postName];

  useEffect(() => {
    if (!postName) return;
    if (!post) return;

    (async () => {
      const [html, toc] = await Promise.all([
        fetch("/posts/" + postName + "/post.html").then((data) => data.text()),
        fetch("/posts/" + postName + "/toc.json").then((data) => data.json()),
      ]);

      setHTML(html);
      setToc(toc);
      setCurrentPostName(postName);
    })();
  }, [post, postName]);

  const isLoading = postName !== currentPostName;

  return <ViewPage {...{ post, html, toc, isLoading }}></ViewPage>;
}

export default withRouter(PostContainer);
