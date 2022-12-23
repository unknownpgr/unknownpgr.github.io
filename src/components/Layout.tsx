import React, { PropsWithChildren } from "react";
import Nav from "./Nav";
import styles from "../styles/layout.module.css";
import Footer from "./Footer";
import Script from "next/script";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <Nav />
      <main className={styles.main}>{children}</main>

      {/* Google AdSense */}
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-5695206410217978"
        data-ad-slot="9579212903"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
      <Script id="google-ads">
        (adsbygoogle = window.adsbygoogle || []).push({});
      </Script>
      <Footer />
    </>
  );
}
