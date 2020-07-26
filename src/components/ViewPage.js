import React from "react";
import { posts, setting } from "meta.json";
import { Link } from "react-router-dom";
import "scss/view.scss";
import dateFormat from "dateFormat";

// Build TOC from toc json
function buildToc(toc) {
  return (
    <React.Fragment>
      {toc.map((x) => {
        const current = x.text ? (
          <li>
            <a href={"#" + x.id}>{x.text}</a>
          </li>
        ) : undefined;
        const child = x.children ? <ol>{buildToc(x.children)}</ol> : undefined;
        return (
          <React.Fragment key={x.id + "i"}>
            {current}
            {child}
          </React.Fragment>
        );
      })}
    </React.Fragment>
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
    const jsxFilePath = postName + "/" + setting.jsxFile;
    const tocFilePath = postName + "/" + setting.tocFile;
    console.log(jsxFilePath);

    /**
     *    Important!
     *
     *    Webpack performs a static analyse at build time.
     *    Therefore, to import resources in non-child directory,
     *    Relative path should be provided as string literal
     *
     *    Additionally, if the directory containing the jsx file itself is deleted,
     *    the real-time server cannot find it even if the directory is restored.
     *    I don't know why.
     */

    Promise.all([
      import(`../posts/${jsxFilePath}`).then((loaded) => {
        const Content = loaded.default;
        this.Content = <Content></Content>;
      }),
      import(`../posts/${tocFilePath}`).then((loaded) => {
        const toc = loaded.default;
        this.toc = buildToc(toc);
      }),
    ]).then(() => this.forceUpdate());

    // Add comment section
    let script = document.createElement("script");
    let anchor = document.getElementById("inject-comments-for-uterances");
    script.setAttribute("src", "https://utteranc.es/client.js");
    script.setAttribute("crossorigin", "anonymous");
    script.setAttribute("async", true);
    script.setAttribute("repo", "unknownpgr/unknownpgr.github.io");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("label", "Comment💬");
    script.setAttribute("theme", "github-light");
    anchor.appendChild(script);
  }

  render() {
    return (
      <React.Fragment>
        <div className="title">
          <Link to="/">{"{ Unknown }"}</Link>
        </div>
        <div className="container">
          <h1 className="post-title">
            {this.post ? this.post.title : "Loading post..."}
          </h1>
          <div>
            <strong>
              {dateFormat(
                this.post ? new Date(this.post.date) : new Date(),
                true
              )}
            </strong>
            <Link to={`/categories/${this.post?.category}`}>
              <span className="text-muted" style={{ marginLeft: "1rem" }}>
                #{this.post?.category}
              </span>
            </Link>
          </div>
        </div>
        <div>
          <hr style={{ marginTop: "2rem" }}></hr>
        </div>
        <div className="container">
          <ol id="toc">{this.toc}</ol>
          {/* Content of post */}
          <div className="blog-post">{this.Content}</div>
          {/* Comment section */}
          <div id="inject-comments-for-uterances"></div>
        </div>
      </React.Fragment>
    );
  }
}

export default ViewPage;
