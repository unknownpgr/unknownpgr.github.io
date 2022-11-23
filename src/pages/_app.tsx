import "../styles/globals.css";

import type { AppProps } from "next/app";
import Layout from "../components/Layout";
import Script from "next/script";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-VMWCS5PZY0"
      ></Script>
      <Script
        id="gtan-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-VMWCS5PZY0');
        `,
        }}
      ></Script>
      <Component {...pageProps} />
    </Layout>
  );
}
