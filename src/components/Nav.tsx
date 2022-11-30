import Link from "next/link";
import React from "react";
import styles from "../styles/nav.module.css";

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>
        [UNKNOWN-PGR]
      </Link>
      <Link className={styles.link} href="/">
        Home
      </Link>
      <Link className={styles.link} href="/categories">
        Categories
      </Link>
      <Link className={styles.link} href="/about">
        About
      </Link>
    </nav>
  );
}
