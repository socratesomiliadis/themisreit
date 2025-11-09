"use client";

import { Lenis } from "lenis/react";
import Header from "./Header";
import { Scrollbar } from "./Scrollbar";
import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import Footer from "./footer";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import FaultyTerminal from "./faulty-terminal";

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
    ScrollTrigger.refresh();
  }, [pathname]);

  return (
    <div className="layout-wrapper w-screen relative bg-[#111111]">
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
      {/* <div className="fixed bottom-0 left-0 w-full h-full z-[0]">
        <FaultyTerminal />
      </div> */}
      <Footer />
    </div>
  );
}
