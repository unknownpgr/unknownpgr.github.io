import { GetStaticProps, InferGetStaticPropsType } from "next";
import Link from "next/link";
import { getPostsMetadata } from "../../backend";
import { Category } from "../../types";
import styles from "../../styles/categories.module.css";

export const getStaticProps: GetStaticProps<{
  categories: Category[];
}> = async () => {
  const posts = await getPostsMetadata();
  const categories = posts.reduce((acc, post) => {
    const { category } = post;
    const categoryObject = acc.find((c) => c.name === category);
    if (categoryObject) {
      categoryObject.postsNumber++;
      return acc;
    }
    return [...acc, { name: category, postsNumber: 1 }];
  }, [] as Category[]);
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
