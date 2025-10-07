"use client";

import { Lenis } from "lenis/react";
import Header from "./Header";
import { Scrollbar } from "./Scrollbar";
import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import Footer from "./footer";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenis = useLenis();
  useEffect(() => {
    ScrollTrigger.clearScrollMemory("manual");
  }, []);

  useEffect(() => {
    lenis?.scrollTo(0, {
      immediate: true,
      force: true,
    });
  }, [pathname]);
  return (
    <div className="layout-wrapper w-screen relative bg-black">
      <Header />
      <Lenis
        root
        options={{
          prevent: (node: Element | null) =>
            node?.getAttribute("data-lenis-prevent") === "true",
        }}
      />
      <Scrollbar />
      {children}
      <Footer />
    </div>
  );
}
