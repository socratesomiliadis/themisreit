import Layout from "@/components/layout";
import "@/styles/globals.css";
import { Viewport } from "next";
import { ViewTransitions } from "next-view-transitions";
import localFont from "next/font/local";

const helveticaNow = localFont({
  src: "../fonts/HelveticaNowVar.woff2",
  variable: "--font-helvetica-now",
});

const ballet = localFont({
  src: "../fonts/Ballet.woff2",
  variable: "--font-ballet",
});

const ppEditorial = localFont({
  src: "../fonts/ppeditorialold.woff2",
  variable: "--font-pp-editorial",
});

const someTypeMono = localFont({
  src: "../fonts/SometypeMono.woff2",
  variable: "--font-some-type-mono",
});

export const metadata = {
  title: "Pensatori Irrazionali",
  description:
    "We help visionary brands flourish by crafting digital experiences that let audiences feel the depth, elegance, and essence of their products.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Pensatori Irrazionali",
    type: "website",
    description:
      "We help visionary brands flourish by crafting digital experiences that let audiences feel the depth, elegance, and essence of their products.",
    images: [
      {
        url: "https://themisreit.vercel.app/ogImage.png",
        width: 1600,
        height: 900,
        alt: "Pensatori Irrazionali",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransitions>
      <html suppressHydrationWarning lang="en">
        <body
          className={`font-wrapper font-helvetica-now ${ppEditorial.variable} ${helveticaNow.variable} ${ballet.variable} ${someTypeMono.variable}`}
        >
          <Layout>{children}</Layout>
        </body>
      </html>
    </ViewTransitions>
  );
}
