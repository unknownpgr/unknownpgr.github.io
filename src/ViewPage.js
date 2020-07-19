import React from "react";
import { posts, setting } from "./meta.json";

// Build TOC from toc json
function buildToc(toc) {
  return (
    <ol>
      {toc.map((x) => {
        const child = x.children ? buildToc(x.children) : undefined;
        return (
          <React.Fragment key={x.id + "i"}>
            <li key={x.id + "j"}>
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
    this.Content = <p></p>;
  }

  componentDidMount() {
    const postName = this.props.match.params.postName;
    this.post = posts[postName];

    // Load post, toc file
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
        {/* Title of post */}
        <h1>{this.post?.title}</h1>
        {/* Subtitle of post */}
        <div>
          <strong>{dateStr}</strong>
          <span className="text-muted" style={{ marginLeft: "1rem" }}>
            #{this.post?.category}
          </span>
          <hr style={{ marginTop: "2rem" }}></hr>
        </div>
        {/* Content of post */}
        <div className="blog-post">{this.Content}</div>
      </div>
    );
  }

  componentWillUnmount() {
    // Remove TOC when unmount
    this.props.setToc(<p></p>);
  }
}

export default ViewPage;
