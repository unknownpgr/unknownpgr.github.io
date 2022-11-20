import Link from "next/link";
import React from "react";
import style from "../styles/header.module.css";

export default function Header() {
  return (
    <div className={style.header}>
      <h1>[UNKNOWN-PGR]</h1>
      <div>
        <Link className={style.nav} href="/">
          MAIN
        </Link>
        <Link className={style.nav} href="/about">
          ABOUT
        </Link>
        {/* <Link className={style.nav} href="/categories">
          CATEGORIES
        </Link> */}
      </div>
    </div>
  );
}
