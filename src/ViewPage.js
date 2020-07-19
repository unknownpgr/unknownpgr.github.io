import React from "react";
import { posts, setting } from "./meta.json";

function buildToc(toc) {
  return (
    <ol>
      {toc.map((x) => {
        const child = x.children ? buildToc(x.children) : undefined;
        return (
          <React.Fragment>
            <li key={x.id}>
              <a href={"#" + x.id}>{x.text}</a>
            </li>
            {child}
          </React.Fragment>
        );
      })}
    </ol>
  );
}

class ViewPage extends React.Component {
  constructor(props) {
    super(props);

    // Content is html converted markdown file.
    this.Content = <p>Now lading...</p>;
  }

  componentDidMount() {
    const postName = this.props.match.params.postName;
    this.post = posts[postName];

    const jsxFilePath = this.post.path + "/" + setting.jsxFile;
    const tocFilePath = this.post.path + "/" + setting.tocFile;

    Promise.all([
      import("./" + jsxFilePath).then((loaded) => {
        const Content = loaded.default;
        this.Content = <Content></Content>;
      }),
      import("./" + tocFilePath).then((loaded) => {
        const toc = loaded.default;
        this.props.setToc(buildToc(toc));
      }),
    ]).then(() => this.forceUpdate());
  }

  render() {
    const dateStr = (this.post?.date + "").substr(0, 16).replace("T", " / ");
    return (
      <div className="mx-4 mt-4">
        <h1>{this.post?.title}</h1>
        <div>
          <strong>{dateStr}</strong>
          <span className="text-muted" style={{ marginLeft: "1rem" }}>
            #{this.post?.category}
          </span>
          <hr style={{ marginTop: "2rem" }}></hr>
        </div>
        <div className="blog-post">{this.Content}</div>
      </div>
    );
  }
}

export default ViewPage;
