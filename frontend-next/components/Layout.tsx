import React, { PropsWithChildren } from "react";
import Header from "./Header";
import styles from "../styles/layout.module.css";
import Footer from "./Footer";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
    </>
  );
}
