import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiService, PostResponse } from "../api";
import { Footer } from "../components/footer";
import style from "./post.module.css";
import { Helmet } from "react-helmet";

const api = new ApiService();

function formatDate(date: string) {
  const d = new Date(date);
  return format(d, "yyyy-MM-dd HH:mm:ss");
}

export function Post() {
  const [response, setPost] = useState<PostResponse | null>(null);
  const postId = useParams<{ id: string }>().id;

  useEffect(() => {
    if (!postId) return;
    const currentPostId = response?.post.id;
    if (!currentPostId) {
      const fetchPost = async () => {
        const post = await api.getPost(postId);
        setPost(post);
      };
      fetchPost();
    } else if (currentPostId !== postId) setPost(null);
  }, [postId, response]);

  if (!response) {
    return (
      <div className={style.loading}>
        <h1>Loading...</h1>
      </div>
    );
  }

  const { post, adjustedPosts } = response;
  const { previous, next } = adjustedPosts;
  const url = location.protocol + "//" + location.host + "/posts/" + post.id;
  const title = "Unknownpgr - " + post.title;

  return (
    <>
      <Helmet>
        {/* Canonical */}
        <link rel="canonical" href={url} />
        {/* Title */}
        <title>{title}</title>
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
      </Helmet>
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
          <hr />
          <div className={style.nav}>
            {previous ? (
              <div className={style.previous}>
                <Link to={`/posts/${previous.id}`} className={style.previous}>
                  <span>Prev: </span>
                  <span>{previous.title}</span>
                </Link>
              </div>
            ) : (
              <div />
            )}
            {next ? (
              <div className={style.next}>
                <Link to={`/posts/${next.id}`} className={style.next}>
                  <span>Next: </span>
                  <span>{next.title}</span>
                </Link>
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
