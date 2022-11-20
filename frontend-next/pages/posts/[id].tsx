import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import React from "react";
import styles from "../../styles/post.module.css";

// Packages required from backend
import { IPost } from "../../types";
import { getPost, getPostMetadata } from "../../backend";

export const getStaticPaths: GetStaticPaths = async () => {
  const { postNames } = await getPostMetadata();
  return {
    paths: postNames.map((id) => ({ params: { id } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<{ post: IPost }> = async (
  context
) => {
  const postName = context.params?.id;
  if (typeof postName !== "string")
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  const post = await getPost(postName);

  if (!post)
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };

  return {
    props: {
      post,
    },
  };
};

export default function Post({
  post: { title, category, date, html },
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div>
      <h1 className={styles.title}>{title}</h1>
      <main
        className={styles.main}
        dangerouslySetInnerHTML={{ __html: html }}
      ></main>
    </div>
  );
}
