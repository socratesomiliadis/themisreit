import { Lenis } from "lenis/react";
import Header from "./Header";
import { Scrollbar } from "./Scrollbar";
import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { AnimatePresence } from "motion/react";
import Footer from "./footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ScrollTrigger.clearScrollMemory("manual");
  }, []);

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
