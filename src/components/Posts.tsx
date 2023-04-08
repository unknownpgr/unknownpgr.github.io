import { PostMetadata } from "../types";
import styles from "../styles/posts.module.css";
import Link from "next/link";

function formatDateString(dateString: string) {
  const date = new Date(dateString);
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  return `${y}.${m}.${d}`;
}

export default function Posts({ posts }: { posts: PostMetadata[] }) {
  return (
    <div>
      {posts.map(({ name, title, date, category }) => (
        <div key={title} className={styles.post}>
          <div>
            <h1>
              <Link href={`/posts/${name}`}>{title} </Link>
            </h1>
          </div>
          <div className={styles.metadata}>
            {formatDateString(date)}{" "}
            <Link href={`/categories/${category}`}>#{category}</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
