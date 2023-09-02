import { useEffect, useState } from "react";
import { ApiService } from "../api";
import style from "./main.module.css";
import { Link } from "react-router-dom";
import { Footer } from "../components/footer";

export interface PostMetadata {
  id: string;
  title: string;
  date: string;
  tags: string[];
}

export interface PostData extends PostMetadata {
  html: string;
}

function parseDate(date: string) {
  const dt = new Date(date);
  const y = dt.getFullYear();
  const m = (dt.getMonth() + 1).toString().padStart(2, "0");
  const d = dt.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const api = new ApiService();

function App() {
  const [posts, setPosts] = useState<PostMetadata[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const posts = await api.getPosts();
      setPosts(posts);
    };
    fetchPosts();
  }, []);

  function handleHomeClick() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className={style.container}>
      <div className={style.titleBox}>
        <p className={style.title}>
          Hi,
          <br />
          I'm Unknownpgr,
          <br />A software engineer who loves to build things.
        </p>

        <p className={style.description}>
          I'm currently studying computer science at{" "}
          <a href="https://uos.ac.kr/">University of Seoul</a>, and working as a
          CTO at <a href="https://the-form.io">The Form</a>.
          <p>
            I'm interested in web development, embedded systems, and machine
            learning.
          </p>
        </p>
      </div>
      <div className={style.scrollDown}>Scroll down to see my posts.</div>
      <h1 className={style.postsTitle}>Posts</h1>
      {posts.map((post) => (
        <Link to={`/posts/${post.id}`}>
          <div key={post.id} className={style.postItem}>
            <span className={style.postItemTitle}>{post.title}</span>
            <span className={style.postItemDate}>{parseDate(post.date)}</span>
          </div>
        </Link>
      ))}
      <Footer />
      <nav className={style.nav}>
        <div className={style.navButtons}>
          <button onClick={handleHomeClick}>Home</button>
          <Link to="/posts/about">
            <button>About</button>
          </Link>
        </div>
        <div className={style.gradient}></div>
      </nav>
    </div>
  );
}

export default App;
