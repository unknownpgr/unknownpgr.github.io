import React from "react";
import { posts } from "./meta.json";

class ViewPage extends React.Component {
  constructor(props) {
    super(props);

    // Content is html converted markdown file.
    this.Content = <p>Now lading...</p>;
  }

  componentDidMount() {
    const postName = this.props.match.params.postName;
    this.post = posts[postName];

    const jsxFilePath = this.post.jsxFilePath.replace(".jsx", "");
    const mdJsonFilePath = this.post.mdJsonFilePath;
    Promise.all([
      import("./" + jsxFilePath).then((loaded) => {
        const Content = loaded.default;
        this.Content = <Content></Content>;
      }),
      import("./" + mdJsonFilePath).then((loaded) => {
        const md = loaded.default.markdown;
      }),
    ]).then(() => this.forceUpdate());
  }

  render() {
    return (
      <div className="mx-4 mt-4">
        <h1>{this.post?.title}</h1>
        <div>
          <strong>{this.post?.date}</strong>
          <span className="text-muted" style={{ marginLeft: "1rem" }}>
            #{this.post?.category}
          </span>
          <hr></hr>
        </div>
        {this.Content}
      </div>
    );
  }
}

export default ViewPage;
