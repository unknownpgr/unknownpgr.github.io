import { useEffect, useState } from "react";
import { PostData } from "./main";
import { ApiService } from "../api";
import { Link, useParams } from "react-router-dom";
import style from "./post.module.css";
import { format } from "date-fns";
import { Footer } from "../components/footer";

const api = new ApiService();

function formatDate(date: string) {
  const d = new Date(date);
  return format(d, "yyyy-MM-dd HH:mm:ss");
}

export function Post() {
  const [post, setPost] = useState<PostData | null>(null);
  const postId = useParams<{ id: string }>().id;

  useEffect(() => {
    if (!postId) {
      return;
    }
    const fetchPost = async () => {
      const post = await api.getPost(postId);
      setPost(post);
    };
    fetchPost();
  }, [postId]);

  if (!post) {
    return (
      <div className={style.loading}>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className={style.container}>
      <Link to="/">
        <header className={style.header}>Unknownpgr</header>
      </Link>
      <div className={style.post}>
        <h1 className={style.title}>{post.title}</h1>
        <p className={style.date}>{formatDate(post.date)}</p>
        <div
          className={style.content}
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </div>
      <Footer />
    </div>
  );
}
