import Link from "next/link";
import React from "react";
import styles from "../styles/header.module.css";

export default function Header() {
  return (
    <nav className={styles.nav}>
      <h1>[UNKNOWN-PGR]</h1>
      <div>
        <Link className={styles.link} href="/">
          MAIN
        </Link>
        <Link className={styles.link} href="/about">
          ABOUT
        </Link>
        <Link className={styles.link} href="/categories">
          CATEGORIES
        </Link>
      </div>
    </nav>
  );
}
