import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";
import ConvexClientProvider from "@/providers/convex-client-provider";
import { TooltipProvider } from "@workspace/ui/components/tooltip";

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

export const metadata: Metadata = {
  title: "Pensatori Meet",
  description: "Staff and client meetings powered by Stream and Convex.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`font-helvetica-now ${ppEditorial.variable} ${helveticaNow.variable} ${ballet.variable} ${someTypeMono.variable} antialiased`}
      >
        <ClerkProvider>
          <ConvexClientProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
