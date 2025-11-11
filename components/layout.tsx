"use client";

import { Lenis } from "lenis/react";
import Header from "./Header";
import { Scrollbar } from "./Scrollbar";
import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenis = useLenis();
  const isWorkPage = pathname === "/work";

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
      {pathname.includes("/sanity") ? null : <Header />}
      <Lenis
        root
        options={{
          orientation: isWorkPage ? "horizontal" : "vertical",
          infinite: isWorkPage,
          prevent: (node: Element | null) =>
            node?.getAttribute("data-lenis-prevent") === "true",
        }}
      />
      <Scrollbar />
      {children}
    </div>
  );
}
