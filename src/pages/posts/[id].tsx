import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import React from "react";
import styles from "../../styles/post.module.css";

// Packages required from backend
import { Post, PostMetadata } from "../../types";
import { getPost, getPostsMetadata } from "../../backend";
import Link from "next/link";
import Head from "next/head";
import Utterances from "../../components/Utterances";

function getPostsInSameCategory(currentPost: Post, metadata: PostMetadata[]) {
  const { category } = currentPost;
  const posts = metadata.filter((post) => post.category === category);
  const postNames = posts.map((post) => post.name);
  const postIndex = postNames.indexOf(currentPost.name);

  if (posts.length < 5) return posts;

  let center = postIndex;
  if (center < 2) center = 2;
  if (center > posts.length - 3) center = posts.length - 3;
  const subPosts = [];
  for (let i = -2; i < 3; i++) {
    subPosts.push(posts[center + i]);
  }
  return subPosts;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPostsMetadata();
  const postNames = posts.map((post) => post.name);
  return {
    paths: postNames.map((id) => ({ params: { id } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<{
  post: Post;
  postsInSameCategory: PostMetadata[];
}> = async (context) => {
  const postName = context.params?.id;
  if (typeof postName !== "string")
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };

  const post = await getPost(postName);
  const posts = await getPostsMetadata();

  if (!post)
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };

  const postsInSameCategory = getPostsInSameCategory(post, posts);

  return {
    props: {
      post,
      postsInSameCategory,
    },
  };
};

export default function PostView({
  post,
  postsInSameCategory,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { title, category, date, name, html } = post;
  return (
    <>
      <Head>
        <title>{`Unknownpgr : ${title}`}</title>
        <meta property="og:title" content={`Unknownpgr: ${title}`} />
      </Head>
      <div>
        <h1 className={styles.title}>{title}</h1>
        <main
          className={styles.main}
          dangerouslySetInnerHTML={{ __html: html }}
        ></main>
        <h1>Posts in {category} category</h1>
        <ul>
          {postsInSameCategory.map(({ name, title }) => (
            <li
              key={name}
              className={name === post.name ? styles.listSelected : styles.list}
            >
              <Link href={`/posts/${name}`}>{title}</Link>
            </li>
          ))}
        </ul>
        <Utterances hash={name} />
      </div>
    </>
  );
}
