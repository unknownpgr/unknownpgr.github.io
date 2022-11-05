import Link from "next/link";
import React from "react";
import style from "./header.module.scss";

export default function Header() {
  return (
    <div>
      <h1>[UNKNOWN-PGR]</h1>
      <div>
        <Link href="/">MAIN</Link>
        <Link href="/about">ABOUT</Link>
        <Link href="/categories">CATEGORIES</Link>
      </div>
    </div>
  );
}
