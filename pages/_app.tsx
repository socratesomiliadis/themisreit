import Layout from "@/components/layout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import localFont from "next/font/local";

const helveticaNow = localFont({
  src: "../fonts/HelveticaNowVar.woff2",
  variable: "--font-helvetica-now",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`font-wrapper font-helvetica-now ${helveticaNow.variable}`}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </div>
  );
}
