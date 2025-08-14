import { Cross as Hamburger } from "hamburger-react";
import { useEffect, useState } from "react";
import { gsap } from "@/lib/gsap";
import NewsItem from "./news-item";
import Nav from "./Nav";
import { cn } from "@/lib/utils";
import StatusBar from "./status-bar";
import { useLenis } from "lenis/react";
import Link from "next/link";

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
    <>
      <Link href="/" className="fixed left-16 top-12 z-10 w-52">
        <svg
          width="100%"
          viewBox="0 0 247 33"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.334961 5.99143V1.47043H24.5307V5.99143H15.0282V31.3593H9.79557V5.99143H0.334961Z"
            fill="white"
          />
          <path
            d="M26.405 31.3593V1.47043H31.6376V13.359H45.2425V1.47043H50.4751V31.3593H45.2425V17.88H31.6376V31.3593H26.405Z"
            fill="white"
          />
          <path
            d="M55.2757 31.3593V1.47043H76.7923V5.99143H60.5084V13.8195H75.5784V18.0893H60.5084V26.8383H77.0854V31.3593H55.2757Z"
            fill="white"
          />
          <path
            d="M80.0945 31.3593V1.47043H87.462L95.7086 24.8708H95.7924L103.83 1.47043H111.114V31.3593H106.132V8.29379H106.048L97.7598 31.3593H93.4482L85.1596 8.29379H85.0759V31.3593H80.0945Z"
            fill="white"
          />
          <path
            d="M115.914 31.3593V1.47043H121.146V31.3593H115.914Z"
            fill="white"
          />
          <path
            d="M124.299 21.3963H129.532C129.532 23.5731 130.272 25.2196 131.751 26.3359C133.062 27.3127 134.848 27.8011 137.109 27.8011C139.258 27.8011 140.89 27.3266 142.007 26.3778C142.956 25.5685 143.43 24.5359 143.43 23.2801C143.43 21.4382 142.607 20.2103 140.96 19.5963C140.737 19.5126 137.765 18.6893 132.044 17.1265C127.634 15.9265 125.43 13.4008 125.43 9.54962C125.43 6.73097 126.574 4.51234 128.862 2.89371C130.9 1.47043 133.397 0.758789 136.355 0.758789C139.621 0.758789 142.314 1.5681 144.435 3.18673C146.695 4.9449 147.825 7.31703 147.825 10.3031H142.593C142.37 6.78679 140.221 5.02862 136.146 5.02862C134.695 5.02862 133.481 5.29374 132.504 5.82398C131.276 6.52167 130.662 7.55424 130.662 8.92171C130.662 10.8473 131.848 12.1311 134.221 12.7729C136.593 13.3869 139.467 14.1543 142.844 15.0753C144.714 15.6334 146.179 16.666 147.239 18.173C148.188 19.5405 148.663 21.0475 148.663 22.694C148.663 25.8196 147.421 28.2197 144.937 29.8941C142.788 31.3453 140.067 32.0709 136.774 32.0709C133.146 32.0709 130.23 31.2197 128.025 29.5174C125.597 27.6476 124.355 24.9406 124.299 21.3963Z"
            fill="white"
          />
          <path
            d="M167.197 5.74026V15.0753H175.779C179.183 15.0753 180.886 13.4846 180.886 10.3031C180.886 7.26121 179.155 5.74026 175.695 5.74026H167.197ZM161.964 31.3593V1.47043H176.239C179.476 1.47043 181.932 2.18207 183.607 3.60534C185.281 5.00071 186.118 6.98214 186.118 9.54962C186.118 13.4288 184.472 15.9404 181.179 17.0846V17.1683C184.137 17.587 185.616 19.694 185.616 23.4894C185.616 27.5639 186.16 30.1872 187.248 31.3593H181.639C181.109 30.4941 180.844 29.029 180.844 26.9639C180.844 24.0894 180.453 22.0801 179.672 20.9358C178.806 19.68 177.216 19.0521 174.899 19.0521H167.197V31.3593H161.964Z"
            fill="white"
          />
          <path
            d="M189.974 31.3593V1.47043H211.49V5.99143H195.206V13.8195H210.276V18.0893H195.206V26.8383H211.783V31.3593H189.974Z"
            fill="white"
          />
          <path
            d="M214.876 31.3593V1.47043H220.109V31.3593H214.876Z"
            fill="white"
          />
          <path
            d="M222.215 5.99143V1.47043H246.411V5.99143H236.908V31.3593H231.676V5.99143H222.215Z"
            fill="white"
          />
        </svg>
      </Link>
      <header
        style={{
          pointerEvents: !isMenuOpen ? "none" : "auto",
        }}
        className="fixed selection:bg-black selection:text-white z-[999] right-16 top-8"
      >
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
            <button className="w-full news-item opacity-0 -translate-y-8 bg-white rounded-2xl py-4 flex justify-between items-center px-4">
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
          style={{
            pointerEvents: isMenuOpen ? "auto" : "none",
          }}
          className="fixed opacity-0 left-0 top-0 z-10 w-screen h-screen nav-overlay bg-black/70"
        ></div>
      </header>
    </>
  );
}
