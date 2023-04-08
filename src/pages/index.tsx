import { GetStaticProps, InferGetStaticPropsType } from "next";
import { getPostsMetadata } from "../backend";
import Posts from "../components/Posts";
import styles from "../styles/index.module.css";
import { PostMetadata } from "../types";

interface IHomeProps {
  posts: PostMetadata[];
}

export const getStaticProps: GetStaticProps<IHomeProps> = async () => {
  const posts = await getPostsMetadata();
  return {
    props: { posts },
  };
};

export default function Home({
  posts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div>
      <main className={styles.main}>
        <Posts posts={posts}></Posts>
      </main>
    </div>
  );
}
