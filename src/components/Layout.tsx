import React, { PropsWithChildren } from "react";
import Nav from "./Nav";
import styles from "../styles/layout.module.css";
import Footer from "./Footer";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <Nav />
      <main className={styles.main}>{children}</main>
      <Footer />
    </>
  );
}
