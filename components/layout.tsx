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

// Dynamic import to avoid SSR issues with Three.js
const BakedRelief = dynamic(() => import("@/components/WebGL/baked-relief"), {
  ssr: false,
  loading: () => <LoadingPlaceholder />,
});

function LoadingPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-neutral-950">
      <div className="text-neutral-500 text-sm font-mono">Loading WebGL...</div>
    </div>
  );
}

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
      {isLoading && !pathname.includes("/sanity") && (
        <Loader onComplete={() => setIsLoading(false)} />
      )}
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[250vw] min-[2000px]:w-[200vw] z-5 flex flex-col items-center">
        <div className="w-full relative aspect-square h-auto">
          <BakedRelief
            textures={{
              bake1: "/textures/0006.png",
              bake2: "/textures/0005.png",
              bake3: "/textures/0004.png",
              bake4: "/textures/0003.png",
              bake5: "/textures/0002.png",
              bake6: "/textures/0001.png",
              // Use grungeWall as the plaster texture for the dark davincii effect
              plaster: "/textures/plaster.png",
            }}
            multiplyColor="#161616"
            aspectRatio={1}
          />
        </div>
        <div className="w-full relative aspect-square h-auto">
          <BakedRelief
            textures={{
              bake1: "/textures/0006.png",
              bake2: "/textures/0005.png",
              bake3: "/textures/0004.png",
              bake4: "/textures/0003.png",
              bake5: "/textures/0002.png",
              bake6: "/textures/0001.png",
              // Use grungeWall as the plaster texture for the dark davincii effect
              plaster: "/textures/plaster.png",
            }}
            multiplyColor="#161616"
            aspectRatio={1}
          />
        </div>
        <div className="w-full relative aspect-square h-auto">
          <BakedRelief
            textures={{
              bake1: "/textures/0006.png",
              bake2: "/textures/0005.png",
              bake3: "/textures/0004.png",
              bake4: "/textures/0003.png",
              bake5: "/textures/0002.png",
              bake6: "/textures/0001.png",
              // Use grungeWall as the plaster texture for the dark davincii effect
              plaster: "/textures/plaster.png",
            }}
            multiplyColor="#161616"
            aspectRatio={1}
          />
        </div>
      </div>
    </div>
  );
}
