import { Cross as Hamburger } from "hamburger-react";
import { useEffect, useState } from "react";
import { gsap } from "@/lib/gsap";
import NewsItem from "./news-item";
import Nav from "./Nav";
import { cn } from "@/lib/utils";
import StatusBar from "./status-bar";
import { useLenis } from "lenis/react";

export default function Header() {
  const lenis = useLenis();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isNewsOpen, setNewsOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      lenis?.stop();
    } else {
      lenis?.start();
    }
  }, [isMenuOpen, lenis]);

  useEffect(() => {
    const tl = gsap.timeline({ paused: true });
    if (isMenuOpen) {
      tl.set(".menu-body", { scale: 0.95, opacity: 0.5 }, 0);
      tl.set(".nav-overlay", { opacity: 0 }, 0);

      tl.to(
        ".nav-overlay",
        {
          opacity: 1,
          duration: 0.5,
        },
        0
      );
      tl.to(
        ".status-bar",
        {
          opacity: 0,
        },
        0
      );
      tl.to(
        ".menu-body",
        {
          scale: 1,
          opacity: 1,
          ease: "elastic.out(1.8,1)",
          duration: 1,
        },
        0
      );
      tl.set(
        ".news-btn",
        {
          x: "-1.5rem",
          opacity: 0,
          // boxShadow: "0 0 0 0px #000",
          duration: 0.4,
        },
        0
      );
      tl.to(
        ".news-btn",
        {
          x: 0,
          opacity: 1,
          // boxShadow: "0 0 0 14px #000",
          ease: "elastic.out(1.8,1)",
          duration: 1,
        },
        0
      );
      tl.set(
        ".menu-body",
        {
          maskImage:
            "radial-gradient(circle at calc(100% - 0rem) 1.75rem, transparent 0px, black 1px), radial-gradient(circle at 1.75rem 1.75rem, transparent 1px, black 2px), linear-gradient(#000 0 0)",
        },
        0
      );
      // tl.to(
      //   ".menu-body",
      //   {
      //     maskImage:
      //       "radial-gradient(circle at calc(100% - 1.75rem) 1.75rem, transparent 42px, black 43px), radial-gradient(circle at 1.75rem 1.75rem, transparent 1px, black 2px), linear-gradient(#000 0 0)",
      //     ease: "elastic.out(1.6,1)",
      //     duration: 1,
      //   },
      //   0
      // );
      tl.to(
        ".menu-body",
        {
          maskImage:
            "radial-gradient(circle at calc(100% - 1.75rem) 1.75rem, transparent 42px, black 43px), radial-gradient(circle at 1.75rem 1.75rem, transparent 42px, black 43px), linear-gradient(#000 0 0)",
          ease: "elastic.out(1.6,1)",
          duration: 1,
        },
        0
      );
      // tl.set(
      //   ".nav-bg",
      //   {
      //     maskImage:
      //       "radial-gradient(circle at 1.5rem 1.5rem, transparent 1px, black 2px)",
      //   },
      //   0
      // );
      // tl.to(
      //   ".nav-bg",
      //   {
      //     maskImage:
      //       "radial-gradient(circle at 1.5rem 1.5rem, transparent 38px, black 39px)",
      //     ease: "elastic.out(1.6,1)",
      //     duration: 1,
      //   },
      //   0.15
      // );
      tl.call(
        () => {
          setNewsOpen(true);
        },
        undefined,
        0
      );
    } else {
      tl.to(
        ".nav-overlay",
        {
          opacity: 0,
        },
        0
      );
      tl.to(
        ".status-bar",
        {
          opacity: 1,
        },
        0
      );
      tl.call(
        () => {
          setNewsOpen(false);
        },
        undefined,
        0
      );
      tl.to(
        ".news-btn",
        {
          opacity: 0,
        },
        0.06
      );

      tl.to(".menu-body", { opacity: 0, duration: 0.4 }, 0);
    }
    tl.restart();

    return () => {
      tl.kill();
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const tl = gsap.timeline({ paused: true });
    if (isNewsOpen) {
      tl.to(".news-item", {
        y: 0,
        opacity: 1,
        stagger: 0.05,
      });
    } else {
      tl.to(".news-item", {
        y: "-2rem",
        opacity: 0,
        stagger: 0.05,
      });
    }
    tl.restart();

    return () => {
      tl.kill();
    };
  }, [isNewsOpen]);

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      setMenuOpen(false);
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="fixed selection:bg-black selection:text-white z-[999] right-6 top-6">
      <div className="relative flex gap-4 h-[95vh] z-20">
        <div
          style={{
            pointerEvents: isNewsOpen ? "auto" : "none",
          }}
          data-lenis-prevent
          className="news overflow-y-hidden h-full flex flex-col gap-4 pr-0"
        >
          <NewsItem
            tag="Events"
            title="B-HYPE DXB"
            date="Oct. 5"
            description="I am pleased to inform you that I will be 
attending the B-Hype event in Dubai."
            image="/static/images/bHype.png"
          />
          <NewsItem
            tag="Events"
            title="AEVA & Battlenet"
            date="Oct. 4"
            description="I organized the AEVA x Battlenet Fortnite
            OG anniversary cup with 2,000+ participants."
            image="/static/images/aeva.png"
          />
          <NewsItem
            tag="Works"
            title="Jimbo - Go (Video)"
            date="Sep. 14"
            description="I am pleased to inform you that I will be 
            attending the BHype event in Dubai."
            image="/static/images/jimmy.png"
          />
          <NewsItem
            tag="Events"
            title="B-HYPE DXB"
            date="Oct. 5"
            description="I am pleased to inform you that I will be 
attending the B-Hype event in Dubai."
            image="/static/images/bHype.png"
          />
          <button className="w-full news-item bg-white rounded-2xl py-4 flex justify-between items-center px-4">
            <span>More News</span>
            <span className="block w-4">
              <svg
                width="100%"
                viewBox="0 0 14 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.59425 0.701172L12.7529 5.85984L7.59425 11.0185M0.224708 5.85984L12.3845 5.85985"
                  stroke="currentColor"
                  strokeWidth="1.47391"
                />
              </svg>
            </span>
          </button>
          {/* <NewsItem
            tag="Events"
            title="AEVA & Battlenet"
            date="Oct. 4"
            description="I organized the AEVA x Battlenet Fortnite
            OG anniversary cup with 2,000+ participants."
            image="/static/images/aeva.png"
          /> */}
        </div>

        <div className="relative ">
          <StatusBar />
          <div
            style={
              {
                // boxShadow: "0 0 0 14px #000",
              }
            }
            className="absolute right-0 top-0 z-10 rounded-full bg-[#1E1E1E]/80 backdrop-blur size-14 flex items-center justify-center"
          >
            <Hamburger
              color="#fff"
              size={20}
              toggled={isMenuOpen}
              toggle={setMenuOpen}
            />
          </div>
          <button
            // style={{
            //   boxShadow: "0 0 0 14px #000",
            // }}
            onClick={() => {
              setNewsOpen((prev) => !prev);
            }}
            className="cursor-pointer opacity-0 absolute news-btn left-0 top-0 z-10 rounded-full bg-[#1E1E1E]/80 backdrop-blur text-white size-14 flex items-center justify-center"
          >
            <svg
              width="35%"
              viewBox="0 0 25 20"
              fill="none"
              className={cn(
                "transition-transform ease-out duration-[150ms] nav-arrow",
                isNewsOpen
                  ? "rotate-180"
                  : isMenuOpen
                  ? "rotate-0"
                  : "rotate-180"
              )}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.4706 19L2 10L11.4706 1M25 10L2.67647 10"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </button>
          <div
            style={{
              pointerEvents: isMenuOpen ? "auto" : "none",
              maskComposite: "exclude",
            }}
            className="relative z-0 opacity-0 menu-body rounded-2xl h-[95vh] w-[28vw] backdrop-blur-xl"
          >
            <Nav isOpen={isMenuOpen} />
            <div
              // style={{
              //   maskImage:
              //     "radial-gradient(circle at 1.5rem 1.5rem, transparent 38px, black 39px)",
              // }}
              className="absolute nav-bg left-0 top-0 z-0 w-full h-full bg-[#1E1E1E]/80 "
            ></div>
          </div>
        </div>
      </div>
      <div
        onClick={() => {
          setMenuOpen(false);
        }}
        className="fixed opacity-0 left-0 top-0 z-10 w-screen h-screen nav-overlay bg-black/70"
      ></div>
    </header>
  );
}
