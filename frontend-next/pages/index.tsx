import Head from "next/head";
import Image from "next/image";
import Header from "../components/header/header";
import metadata from "../meta.json";

export default function Home() {
  return (
    <div>
      <Head>
        <title>UNKNOWN-PGR</title>
        <meta name="description" content="Unknownpgrs' blog" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <Header />
      <hr />
      {Object.values(metadata).map(
        ({ name, title, date, category, thumbnail }) => (
          <div key={name}>
            <Image
              src={thumbnail || "/code.png"}
              alt={title}
              width={320}
              height={240}
            ></Image>
            {title}
            {}
          </div>
        )
      )}
    </div>
  );
}
