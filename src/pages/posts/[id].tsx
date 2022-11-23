import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import React from "react";
import styles from "../../styles/post.module.css";

// Packages required from backend
import { IPost } from "../../types";
import { getPost, getPostsMetadata } from "../../backend";

function getPostsInSameCateogry(currentPost: IPost, posts: IPost[]) {
  const { category } = currentPost;
  const postsInSameCategory = posts.filter(
    (post) => post.category === category
  );
  const postNames = postsInSameCategory.map((post) => post.name);
  const postIndex = postNames.indexOf(currentPost.name);

  console.log(postNames, postIndex, postsInSameCategory.length);

  if (postsInSameCategory.length < 5) return postsInSameCategory;

  let center = postIndex;
  if (center < 2) center = 2;
  if (center > posts.length - 3) center = posts.length - 3;
  let subposts = [];
  for (let i = -2; i < 3; i++) {
    subposts.push(postsInSameCategory[center + i]);
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
  postsInSameCategory: IPost[];
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
  post: { title, category, date, html },
  postsInSameCategory,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div>
      <h1 className={styles.title}>{title}</h1>
      <main
        className={styles.main}
        dangerouslySetInnerHTML={{ __html: html }}
      ></main>
      <h1>Posts in #{category}</h1>
      <ul>
        {postsInSameCategory.map(({ name, title }) => (
          <li key={name}>{title}</li>
        ))}
      </ul>
    </div>
  );
}
