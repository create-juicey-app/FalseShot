import { Html, Head, Main, NextScript } from "next/document";
import { Analytics } from "@vercel/analytics/react";
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          rel="preload"
          href="/fonts/pixel.TTF"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <title>Falseshot</title>
        <meta
          property="description"
          content="Nyko isn't worth saving anymore..."
        />
        <meta property="og:image" content="/banner.png"></meta>
        <meta property="og:site_name" content="Falseshot"></meta>
        <meta
          property="og:description"
          content="Nyko isn't worth saving anymore..."
        />
        <meta property="og:url" content="https://falseshot.vercel.app"></meta>
      </Head>
      <body>
        <Main />
        <NextScript />
        <Analytics />
      </body>
    </Html>
  );
}
