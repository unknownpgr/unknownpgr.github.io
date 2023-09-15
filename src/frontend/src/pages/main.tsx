import { useEffect, useRef, useState } from "react";
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

let previousScroll = 0;
let postsCache: PostMetadata[] = [];

function App() {
  const [posts, setPosts] = useState<PostMetadata[]>(postsCache);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function restoreScroll() {
      if (!containerRef.current) return;
      containerRef.current.scrollTop = previousScroll;
    }
    restoreScroll();

    const fetchPosts = async () => {
      const posts = await api.getPosts();
      postsCache = posts;
      setPosts(posts);
    };

    fetchPosts();
  }, []);

  function handleHomeClick() {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleScrollChange() {
    if (!containerRef.current) return;
    const currentScroll = containerRef.current.scrollTop || 0;
    previousScroll = currentScroll;
  }

  return (
    <div
      className={style.container}
      ref={containerRef}
      onScroll={handleScrollChange}
    >
      <div className={style.titleBox}>
        <p className={style.title}>
          Hi,
          <br />
          I'm Unknownpgr,
          <br />A software engineer who loves to build things.
        </p>

        <p className={style.description}>
          I'm currently studying computer science at{" "}
          <a href="https://uos.ac.kr/">University of Seoul</a>,
          <br />
          and working as a tech lead at{" "}
          <a href="https://the-form.io">The Form</a>.
          <br />
          I'm interested in web development, embedded systems, and machine
          learning.
        </p>
      </div>
      <div className={style.scrollDown}>Scroll down to see my posts.</div>
      <h1 className={style.postsTitle}>Posts</h1>
      {posts.map((post) => (
        <Link key={post.id} to={`/posts/${post.id}`}>
          <div className={style.postItem}>
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
