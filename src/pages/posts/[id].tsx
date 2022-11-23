import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import React, { Suspense } from "react";
import styles from "../../styles/post.module.css";

// Packages required from backend
import { IPost, IPostMetadata } from "../../types";
import { getPost, getPostsMetadata } from "../../backend";
import Link from "next/link";

function getPostsInSameCateogry(currentPost: IPost, metadata: IPostMetadata[]) {
  const { category } = currentPost;
  const posts = metadata.filter((post) => post.category === category);
  const postNames = posts.map((post) => post.name);
  const postIndex = postNames.indexOf(currentPost.name);

  if (posts.length < 5) return posts;

  let center = postIndex;
  if (center < 2) center = 2;
  if (center > posts.length - 3) center = posts.length - 3;
  const subposts = [];
  for (let i = -2; i < 3; i++) {
    subposts.push(posts[center + i]);
  }
  return subposts;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { postNames, posts } = await getPostsMetadata();
  return {
    paths: postNames.map((id) => ({ params: { id } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<{
  post: IPost;
  postsInSameCategory: IPostMetadata[];
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
  const { posts } = await getPostsMetadata();

  if (!post)
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };

  const postsInSameCategory = getPostsInSameCateogry(post, posts);

  return {
    props: {
      post,
      postsInSameCategory,
    },
  };
};

export default function Post({
  post,
  postsInSameCategory,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { title, category, date, html } = post;
  return (
    <div>
      <h1 className={styles.title}>{title}</h1>
      <main
        className={styles.main}
        dangerouslySetInnerHTML={{ __html: html }}
      ></main>
      <h1>Posts in {category} cateogry</h1>
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
    </div>
  );
}
