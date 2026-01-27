"use client";

import { Lenis } from "lenis/react";
import Header from "./Header";
import { Scrollbar } from "./Scrollbar";
import { useEffect, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import Loader from "./loader";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// Dynamic import to avoid SSR issues with Three.js
const BakedRelief = dynamic(
  () => import("@/components/WebGL/baked-relief-webgpu"),
  {
    ssr: false,
    loading: () => null,
  }
);

// Shared texture config
const WEBGL_TEXTURES = {
  bake1: "/textures/new/0006.png",
  bake2: "/textures/new/0005.png",
  bake3: "/textures/new/0004.png",
  bake4: "/textures/new/0003.png",
  bake5: "/textures/new/0002.png",
  bake6: "/textures/new/0001.png",
  plaster: "/textures/plaster.png",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenis = useLenis();
  const isWorkPage = pathname === "/work";
  const isNightPage = pathname === "/night";
  const [isLoading, setIsLoading] = useState(true);
  // Wait for loader to finish before mounting WebGL
  const [showWebGL, setShowWebGL] = useState(false);

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
      // Show WebGL after loader finishes - components handle their own deferred init
      const timer = setTimeout(() => setShowWebGL(true), 1450);
      return () => clearTimeout(timer);
    }
  }, [isLoading, lenis]);

  useEffect(() => {
    lenis?.scrollTo(0, {
      immediate: true,
      force: true,
    });
    ScrollTrigger.refresh();
  }, [pathname]);

  const isSanityPage = pathname.includes("/sanity");

  return (
    <div className="layout-wrapper w-screen relative bg-[#f5f5f5]">
      {isLoading && !isSanityPage && (
        <Loader onComplete={() => setIsLoading(false)} />
      )}
      {isSanityPage ? null : <Header />}
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
      {/* WebGL background - components handle staggered initialization automatically */}
      {showWebGL && !isSanityPage && !isNightPage && (
        <div
          className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 w-[190vw] z-5 flex flex-col items-center pointer-events-none max-h-full overflow-hidden",
            isWorkPage && "fixed"
          )}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <BakedRelief
              className="w-full relative aspect-square h-auto"
              key={`baked-relief-${i}`}
              textures={WEBGL_TEXTURES}
            />
          ))}
        </div>
      )}
    </div>
  );
}
