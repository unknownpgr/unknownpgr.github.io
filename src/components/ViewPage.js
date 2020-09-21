import React from "react";
import meta from "meta.json";
import { Link } from "react-router-dom";
import "scss/view.scss";
import dateFormat from "dateFormat";

function AdjacentPost(props) {
  let adj = props.adj;
  let next = props.next;
  if (adj) {
    let previousLink = "/posts/" + adj.name;
    return <Link to={previousLink}>{adj.title}</Link>;
  } else {
    return (
      <a href="./" onClick={() => alert("없어용")}>
        No {next ? "next" : "previous"} post
      </a>
    );
  }
}

function getAdjacentPost(currentPostName) {
  let previous;
  let next;

  if (currentPostName) {
    let category = meta[currentPostName].category;
    let categoryPost = Object.keys(meta).filter(
      (post) => meta[post].category === category
    );
    let postIndex = categoryPost.indexOf(currentPostName);
    if (postIndex < 0) postIndex = -2;
    previous = meta[categoryPost[postIndex + 1]];
    next = meta[categoryPost[postIndex - 1]];
  }

  return { previous, next };
}

class ViewPage extends React.Component {
  constructor(props) {
    super(props);
    this.Content = <p></p>;
    this.adjacentPost = { previous: "", next: "" };
    this.update = this.update.bind(this);
  }

  componentDidMount(prevProps) {
    this.update();
    this.unlisten = this.props.history.listen(() => this.update());
  }

  componentWillUnmount() {
    this.unlisten();
  }

  update() {
    let postName;
    let list = this.props.history.location.pathname.split("/")
    postName = list.pop()
    if (!postName) postName = list.pop()
    if (!postName) return;
    this.post = meta[postName];

    // Load post, toc file
    const jsxFilePath = postName + "/1.md";

    /**
     *    Important!
     *
     *    Webpack performs a static analyse at build time.
     *    Therefore, to import resources in non-child directory,
     *    Relative path should be provided as string literal.
     *
     *    Additionally, if the directory containing the jsx files are deleted,
     *    the real-time server will not be able to find them even if the directory is restored.
     *    (I don't know why.)
     */

    this.adjacentPost = getAdjacentPost(postName);

    fetch('/posts/' + postName + '/post.html')
      .then(data => data.text())
      .then(html => {
        this.Content = <div className="blog-post" dangerouslySetInnerHTML={{ __html: html }}></div>
        this.forceUpdate()
      })

    // Add Uterances comment
    let script = document.createElement("script");
    let anchor = document.getElementById("inject-comments-for-uterances");
    anchor.innerHTML = "";
    script.setAttribute("src", "https://utteranc.es/client.js");
    script.setAttribute("crossorigin", "anonymous");
    script.setAttribute("async", true);
    script.setAttribute("repo", "unknownpgr/unknownpgr.github.io");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("label", "Comment💬");
    script.setAttribute("theme", "github-light");
    anchor.appendChild(script);

    // Go to top of the page
    window.scrollTo(0, 0);
  }

  render() {
    let adj, previousPost, nextPost;
    if ((adj = this.adjacentPost)) {
      previousPost = (
        <AdjacentPost adj={adj.previous} next={false}></AdjacentPost>
      );
      nextPost = <AdjacentPost adj={adj.next} next={true}></AdjacentPost>;
    }

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
          {this.Content}
          <div id="adjPosts">
            <div>
              {"← "}
              {previousPost}
            </div>
            <div>
              {nextPost}
              {" →"}
            </div>
          </div>
          {/* Comment section */}
          <div id="inject-comments-for-uterances"></div>
        </div>
      </React.Fragment>
    );
  }
}

export default ViewPage;
