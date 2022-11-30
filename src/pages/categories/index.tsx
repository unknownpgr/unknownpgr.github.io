import { GetStaticProps, InferGetStaticPropsType } from "next";
import Link from "next/link";
import { getPostsMetadata } from "../../backend";
import { ICategory } from "../../types";
import styles from "../../styles/categories.module.css";

export const getStaticProps: GetStaticProps<{
  categories: ICategory[];
}> = async () => {
  const { categories } = await getPostsMetadata();
  return { props: { categories } };
};

export default function index({
  categories,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div>
      <h1>Categories</h1>
      <ul>
        {categories.map(({ name, postsNumber }) => (
          <li key={name} className={styles.item}>
            <Link href={`/categories/${name}`}>
              <span className={styles.name}>{name}</span> [{postsNumber}]
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
