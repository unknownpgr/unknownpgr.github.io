import { GetStaticProps, InferGetStaticPropsType } from "next";
import { getPostsMetadata } from "../backend";
import Posts from "../components/Posts";
import styles from "../styles/index.module.css";
import { IPostMetadata } from "../types";

interface IHomeProps {
  postNames: string[];
  posts: IPostMetadata[];
}

export const getStaticProps: GetStaticProps<IHomeProps> = async () => {
  const posts = await getPostsMetadata();
  const props = { ...posts };
  return {
    props,
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
