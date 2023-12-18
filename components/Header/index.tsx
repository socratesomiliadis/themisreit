import { Cross as Hamburger } from "hamburger-react";
import { useEffect, useState } from "react";
import { gsap } from "@/lib/gsap";
import NewsItem from "./NewsItem";
import Nav from "./Nav";

export default function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isNewsOpen, setNewsOpen] = useState(false);

  useEffect(() => {
    let tl = gsap.timeline({ paused: true });
    if (isMenuOpen) {
      tl.set(".menu-body", { opacity: 0.5 }, 0);
      tl.to(
        "main",
        {
          filter: "blur(24px)",
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
          x: "2rem",
          opacity: 0.5,
          boxShadow: "0 0 0 0px #000",
          duration: 0.4,
        },
        0.2
      );
      tl.to(
        ".news-btn",
        {
          x: 0,
          opacity: 1,
          boxShadow: "0 0 0 14px #000",
          ease: "elastic.out(1.8,1)",
          duration: 1,
        },
        0.2
      );
      tl.call(
        () => {
          setNewsOpen(true);
        },
        undefined,
        0.2
      );
    } else {
      //   tl.set(
      //     ".news-btn > svg",
      //     {
      //       transition: "transform 100s ease-out",
      //     },
      //     0
      //   );
      tl.to(
        "main",
        {
          filter: "blur(0px)",
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
          //   x: "2rem",
          opacity: 0,
          //   boxShadow: "0 0 0 0px #000",
          duration: 0.4,
        },
        0
      );

      tl.to(".menu-body", { scale: 0.95, opacity: 0, duration: 0.4 }, 0);
    }
    tl.restart();

    return () => {
      tl.kill();
    };
  }, [isMenuOpen]);

  useEffect(() => {
    let tl = gsap.timeline({ paused: true });
    if (isNewsOpen) {
      tl.set(".news", {
        overflowY: "auto",
      });
      tl.to(".news-item", {
        y: 0,
        opacity: 1,
        stagger: 0.05,
      });
    } else {
      tl.set(".news", {
        overflowY: "hidden",
      });
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

  return (
    <header className="fixed z-[999] left-8 top-8">
      <div className="relative flex gap-6 h-[90vh] z-20">
        <div className="relative">
          <div
            style={{
              boxShadow: "0 0 0 14px #000",
            }}
            className="absolute left-0 top-0 z-10 rounded-full bg-white w-12 h-12 flex items-center justify-center"
          >
            <Hamburger
              color="#000"
              size={22}
              toggled={isMenuOpen}
              toggle={setMenuOpen}
            />
          </div>
          <div
            style={{
              boxShadow: "0 0 0 14px #000",
            }}
            onClick={() => {
              setNewsOpen((prev) => !prev);
            }}
            className="cursor-pointer opacity-0 absolute news-btn right-0 top-0 z-10 rounded-full bg-white text-black w-12 h-12 flex items-center justify-center"
          >
            <svg
              width="50%"
              viewBox="0 0 25 20"
              fill="none"
              className="transition-transform ease-out duration-200"
              style={{
                transform: isNewsOpen ? "rotate(0deg)" : "rotate(180deg)",
              }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.4706 19L2 10L11.4706 1M25 10L2.67647 10"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div className="bg-white z-0 opacity-0 menu-body rounded-2xl h-[90vh] w-[28vw]">
            <Nav isOpen={isMenuOpen} />
          </div>
        </div>
        <div className="news overflow-y-hidden h-full flex flex-col gap-4 pr-6">
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
        </div>
      </div>
      <div
        onClick={() => {
          setMenuOpen(false);
        }}
        className="fixed left-0 top-0 z-10 w-screen h-screen"
      ></div>
    </header>
  );
}
