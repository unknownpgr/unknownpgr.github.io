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
    const jsxFilePath = posts[postName].jsxFilePath.replace(".jsx", "");
    const mdJsonFilePath = posts[postName].mdJsonFilePath;
    import("./" + jsxFilePath).then((loaded) => {
      const Content = loaded.default;
      this.Content = <Content></Content>;
      this.forceUpdate();
    });
    import("./" + mdJsonFilePath).then((loaded) => {
      const md = loaded.default.markdown;
    });
  }

  render() {
    return <div>{this.Content}</div>;
  }
}

export default ViewPage;
