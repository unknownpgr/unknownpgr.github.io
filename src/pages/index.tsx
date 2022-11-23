import { GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { getPostsMetadata } from "../backend";
import styles from "../styles/index.module.css";
import { IPost, IPostMetadata } from "../types";

function formatDateString(dateString: string) {
  const date = new Date(dateString);
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  return `${y}.${m}.${d}`;
}

interface IHomeProps {
  postNames: string[];
  posts: IPostMetadata[];
}

export const getStaticProps: GetStaticProps<IHomeProps> = async (context) => {
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
      <Head>
        <title>UNKNOWN-PGR</title>
        <meta name="description" content="Unknownpgrs' blog" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <main className={styles.main}>
        {posts.map(({ name, title, date, category }) => (
          <div key={title} className={styles.post}>
            <div>
              <h1>
                <Link href={`/posts/${name}`}>{title} </Link>
              </h1>
            </div>
            <div>
              {formatDateString(date)} #{category}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
