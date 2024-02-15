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

function createIndexString(
  name: string,
  date: string,
  stringLength: number = 80
) {
  function getWidth(char: string) {
    const code = char.charCodeAt(0);
    // Escape characters like 0xe9(é)
    if (code >= 0x80 && code <= 0x9f) return 1;
    if (code >= 0xa1 && code <= 0xdf) return 1;
    if (code >= 0xe0 && code <= 0xff) return 1;
    // Normal characters
    if (code >= 0x20 && code <= 0x7e) return 1;
    if (code >= 0xff00 && code <= 0xffef) return 2;
    // For emojis, only check the first character.
    if (code == 0xd83d) return 1;
    if (code >= 0xdc00 && code <= 0xdfff) return 0;
    // Escape zero-width characters.
    if (code >= 0x200b && code <= 0x200f) return 0;

    return 2;
  }

  function getLength(str: string) {
    let length = 0;
    for (let i = 0; i < str.length; i++) {
      const width = getWidth(str.charAt(i));
      length += width;
    }
    return length;
  }

  while (getLength(name) > stringLength - 3) {
    name = name.slice(0, -1);
  }
  const nameLength = getLength(name);

  let dots = "  ";
  for (let i = 0; i < stringLength - nameLength; i++) {
    dots += ".";
  }
  dots += "  ";

  return `${name}${dots}${date}`;
}

const api = new ApiService();

let postsCache: PostMetadata[] = [];

function App() {
  const [posts, setPosts] = useState<PostMetadata[]>(postsCache);
  const [pageWidth, setPageWidth] = useState(window.innerWidth);
  const titleBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const posts = await api.getPosts();
      postsCache = posts;
      setPosts(posts);
    };
    fetchPosts();

    function handleResize() {
      setPageWidth(window.innerWidth);
      if (titleBoxRef.current) {
        titleBoxRef.current.style.height = `${window.innerHeight}px`;
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={style.container}>
      <div ref={titleBoxRef} className={style.titleBox}>
        <div className={style.titleContent}>
          <p className={style.title}>
            Hi,
            <br />
            I'm Unknownpgr,
            <br />A software engineer who loves to build things.
          </p>
          <p>
            I'm currently studying computer science at{" "}
            <a href="https://uos.ac.kr/">University of Seoul</a>,
            <br />
            and working as a tech lead at{" "}
            <a href="https://the-form.io">The Form</a>.
            <br />
            I'm interested in web development, embedded systems, and machine
            learning.
            <br />
            Click <Link to="/posts/about">here</Link> to learn more about me.
          </p>
          <div>
            <br />
            <br />
            Scroll down to see my posts.
          </div>
        </div>
      </div>
      <div className={style.posts}>
        <h1>Posts</h1>
        <br />
        {posts.map((post) => (
          <div key={post.id}>
            <Link to={`/posts/${post.id}`}>
              {createIndexString(
                post.title,
                parseDate(post.date),
                Math.min(80, pageWidth * 0.125)
              )}
            </Link>
            <br />
            <br />
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}

export default App;
