"use client";

import { Lenis } from "lenis/react";
import Header from "./Header";
import { Scrollbar } from "./Scrollbar";
import { useEffect, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import Loader from "./loader";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenis = useLenis();
  const isWorkPage = pathname === "/work";
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ScrollTrigger.clearScrollMemory("manual");
  }, []);

  useEffect(() => {
    if (isLoading) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.body.style.overflow = "";
    }
  }, [isLoading, lenis]);

  useEffect(() => {
    lenis?.scrollTo(0, {
      immediate: true,
      force: true,
    });
    ScrollTrigger.refresh();
  }, [pathname]);

  return (
    <div className="layout-wrapper w-screen relative bg-[#111111]">
      {/* {isLoading && <Loader onComplete={() => setIsLoading(false)} />} */}
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
