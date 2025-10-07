import Layout from "@/components/layout";
import "@/styles/globals.css";
import { Viewport } from "next";
import { ViewTransitions } from "next-view-transitions";
import localFont from "next/font/local";

const helveticaNow = localFont({
  src: "../fonts/HelveticaNowVar.woff2",
  variable: "--font-helvetica-now",
});

export const metadata = {
  title: "Themis Reit — Home",
  description:
    "We help visionary brands flourish by crafting digital experiences that let audiences feel the depth, elegance, and essence of their products.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Themis Reit",
    type: "website",
    description:
      "We help visionary brands flourish by crafting digital experiences that let audiences feel the depth, elegance, and essence of their products.",
    images: [
      {
        url: "https://themisreit.vercel.app/ogImage.png",
        width: 1600,
        height: 900,
        alt: "Themis Reit",
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
  themeColor: "#E1FF00",
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
          className={`font-wrapper font-helvetica-now ${helveticaNow.variable}`}
        >
          <Layout>{children}</Layout>
        </body>
      </html>
    </ViewTransitions>
  );
}
