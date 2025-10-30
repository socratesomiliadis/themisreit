"use client";

import { Cross as Hamburger } from "hamburger-react";
import { useEffect, useState } from "react";
import { gsap } from "@/lib/gsap";
import NewsItem from "./news-item";
import Nav from "./Nav";
import { cn } from "@/lib/utils";
import StatusBar from "./status-bar";
import { useLenis } from "lenis/react";
import Link from "@/components/transition-link";
import useNavigateTransition from "@/hooks/useNavigateTransition";

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
      tl.set(
        ".status-bar",
        {
          opacity: 0,
        },
        0.1
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
          duration: 0.4,
        },
        0
      );
      tl.to(
        ".news-btn",
        {
          x: 0,
          opacity: 1,
          ease: "elastic.out(1.8,1)",
          duration: 1,
        },
        0
      );
      tl.set(
        ".menu-body",
        {
          maskImage:
            "radial-gradient(circle at 1.75rem 1.75rem, transparent 1px, black 2px), radial-gradient(circle at calc(100% - 0rem) 1.75rem, transparent 0px, black 1px)",
        },
        0
      );

      tl.to(
        ".menu-body",
        {
          maskImage:
            "radial-gradient(circle at 1.75rem 1.75rem, transparent 42px, black 43px), radial-gradient(circle at calc(100% - 1.75rem) 1.75rem, transparent 42px, black 43px)",
          ease: "elastic.out(1.6,1)",
          duration: 1,
        },
        0
      );

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
    const tl = gsap.timeline({ paused: true, defaults: { duration: 0.6 } });
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

  const { navigateTo } = useNavigateTransition();

  return (
    <>
      <Link
        href="/"
        className="fixed left-16 top-12 w-28 z-[997] text-white opacity-0 home-hero-anim blur mix-blend-difference"
        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          navigateTo("/");
        }}
      >
        <svg
          width="100%"
          viewBox="0 0 1533 196"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M153.583 4.36133V38.8139H97.5605V191.016H56.5791V39.032H0.556641V4.36133H153.583Z"
            fill="currentColor"
          />
          <path
            d="M210.913 4.36133V76.1013H286.554V4.36133H327.536V191.016H286.554V110.554H210.913V191.016H169.932V4.36133H210.913Z"
            fill="currentColor"
          />
          <path
            d="M483.614 4.36133V38.8139H385.084V78.7179H475.549V110.554H385.084V156.345H485.794V190.798H344.103V4.36133H483.614Z"
            fill="currentColor"
          />
          <path
            d="M557.729 4.36133L601.326 132.795H601.762L643.18 4.36133H700.946V191.016H662.58V58.875H662.144L616.367 191.234H584.759L538.982 60.1833H538.546V191.234H500.181V4.36133H557.947H557.729Z"
            fill="currentColor"
          />
          <path
            d="M758.495 4.36133V191.016H717.513V4.36133H758.495Z"
            fill="currentColor"
          />
          <path
            d="M925.69 60.183H886.017C884.709 41.4304 873.809 32.054 849.395 32.054C834.136 32.054 820.839 38.5956 820.839 53.2053C820.839 66.7247 828.686 69.3413 870.54 79.808C898.224 86.7857 932.012 96.3801 932.012 135.848C932.012 171.173 904.11 195.813 854.409 195.813C814.953 195.813 774.844 177.06 774.844 130.615V129.306H814.517C814.517 155.691 836.316 163.759 855.499 163.759C874.681 163.759 892.12 157.435 892.12 140.427C892.12 128.652 882.965 121.238 860.076 115.569C846.125 111.862 834.136 109.245 822.147 105.32C794.027 95.944 781.165 80.026 781.165 56.2581C781.165 18.5346 816.697 0 850.921 0C890.812 0 925.69 17.8805 925.69 60.183Z"
            fill="currentColor"
          />
          <path
            d="M1098.34 4.36133C1131.25 4.36133 1153.05 27.039 1153.05 55.8222C1153.05 79.3721 1143.02 94.8539 1123.4 102.704V103.14C1149.56 110.554 1150.43 139.337 1151.09 156.781C1151.96 174.662 1153.7 184.474 1158.5 191.016H1117.52C1114.47 183.166 1113.38 171.827 1112.29 158.526C1110.11 132.359 1105.96 117.968 1080.02 117.968H1038.83V191.016H997.844V4.36133H1098.55H1098.34ZM1083.95 88.9665C1101.17 88.9665 1111.85 81.9887 1111.85 62.3638C1111.85 43.8292 1101.61 36.4153 1083.51 36.4153H1038.61V88.9665H1083.73H1083.95Z"
            fill="currentColor"
          />
          <path
            d="M1308.04 4.36133V38.8139H1209.51V78.7179H1299.97V110.554H1209.51V156.345H1310.22V190.798H1168.53V4.36133H1308.04Z"
            fill="currentColor"
          />
          <path
            d="M1365.59 4.36133V191.016H1324.6V4.36133H1365.59Z"
            fill="currentColor"
          />
          <path
            d="M1533 4.36133V38.8139H1476.98V191.016H1436V39.032H1379.97V4.36133H1533Z"
            fill="currentColor"
          />
        </svg>
      </Link>
      <header
        style={{
          pointerEvents: !isMenuOpen ? "none" : "auto",
        }}
        className="fixed selection:bg-black selection:text-white z-[999] right-16 top-8 opacity-0 home-hero-anim-noblur"
      >
        <div className="relative flex gap-4 h-[95vh] z-20">
          <div
            style={{
              pointerEvents: isNewsOpen ? "auto" : "none",
            }}
            className="news h-full flex flex-col gap-4 pr-0"
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
            <button className="w-full news-item opacity-0 -translate-y-8 bg-white rounded-2xl py-4 text-base leading-none flex justify-between items-center px-4">
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
              className="absolute right-0 top-0 z-10 rounded-full bg-[#1E1E1E]/80 backdrop-blur size-14 flex items-center justify-center pointer-events-auto"
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
                maskComposite: "intersect",
              }}
              className="relative z-0 opacity-0 menu-body rounded-2xl h-[95vh] w-[28vw] backdrop-blur-xl will-change-auto"
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
          style={{
            pointerEvents: isMenuOpen ? "auto" : "none",
          }}
          className="fixed opacity-0 left-0 top-0 z-10 w-screen h-screen nav-overlay bg-black/70"
        ></div>
      </header>
    </>
  );
}
