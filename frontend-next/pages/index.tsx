import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import metadata from "../meta.json";
import styles from "../styles/index.module.css";

function formatDateString(dateString: string) {
  const date = new Date(dateString);
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  return `${y}.${m}.${d}`;
}

export default function Home() {
  return (
    <div>
      <Head>
        <title>UNKNOWN-PGR</title>
        <meta name="description" content="Unknownpgrs' blog" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <main className={styles.main}>
        {Object.values(metadata).map(({ name, title, date, category }) => (
          <div key={name} className={styles.post}>
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
