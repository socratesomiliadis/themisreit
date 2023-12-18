import Link from "next/link";
import { useEffect, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useRouter } from "next/router";

function NavItem({
  text,
  href,
  isMenuOpen,
}: {
  text: string;
  href: string;
  isMenuOpen: boolean;
}) {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link
      href={href}
      style={{
        pointerEvents: isActive ? "none" : isMenuOpen ? "auto" : "none",
      }}
      className="text-black select-none group nav-item opacity-0 w-full flex flex-col gap-4 font-semibold text-5xl tracking-tighter"
    >
      <div
        style={{
          color: isActive ? "#B9B9B9" : "#000",
        }}
        className="flex items-center justify-between"
      >
        <span>{text}</span>
        <span
          style={{
            color: isActive ? "#B9B9B9" : "#000",
            transform: isActive ? "rotate(90deg)" : "",
          }}
          className="block group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200 ease-out w-[0.85rem]"
        >
          <svg
            width="100%"
            viewBox="0 0 14 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.06978 1.94975L12.9693 1.94973L12.9693 11.8492M0.948451 13.9705L12.6157 2.3033"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </span>
      </div>
      <div className="w-0 nav-item-line h-[1px] bg-[#EBEBEB]" />
    </Link>
  );
}

function SocialItem({ text, href }: { text: string; href: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      className="text-black group social-item overflow-hidden relative"
    >
      <span className="absolute left-0 bottom-0 group-hover:translate-y-[-100%] transition-transform duration-200 ease-out">
        {text}
      </span>
      <span
        aria-hidden
        className="flex select-none group-hover:select-auto items-center gap-3 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-200 ease-out"
      >
        {text}
        <span className="block w-2">
          <svg
            width="100%"
            viewBox="0 0 14 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.06978 1.94975L12.9693 1.94973L12.9693 11.8492M0.948451 13.9705L12.6157 2.3033"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </span>
      </span>
    </Link>
  );
}

export default function Nav({ isOpen }: { isOpen: boolean }) {
  useEffect(() => {
    let tl = gsap.timeline({ paused: true });
    if (isOpen) {
      tl.to(
        ".nav-item",
        {
          y: 0,
          opacity: 1,
          stagger: 0.05,
        },
        0
      );
      tl.to(
        ".social-item",
        {
          y: 0,
          opacity: 1,
          stagger: 0.05,
        },
        0.2
      );
      tl.to(
        ".nav-item-line",
        {
          width: "100%",
          stagger: 0.05,
          ease: "power2.out",
        },
        0.15
      );
    } else {
      tl.to(
        ".nav-item",
        {
          y: "-2rem",
          opacity: 0,
          stagger: 0.05,
        },
        0
      );
      tl.to(
        ".social-item",
        {
          y: "-2rem",
          opacity: 0,
          stagger: 0.05,
        },
        0
      );
      tl.set(
        ".nav-item-line",
        {
          width: "0%",
        },
        0
      );
    }
    tl.restart();

    return () => {
      tl.kill();
    };
  }, [isOpen]);

  return (
    <div className="w-full relative z-10 h-full flex flex-col justify-between pl-10 pr-16">
      <div className="flex flex-col w-full mt-24 gap-4">
        <NavItem isMenuOpen={isOpen} text="Home" href="/" />
        <NavItem isMenuOpen={isOpen} text="About" href="/about" />
        <NavItem isMenuOpen={isOpen} text="Work" href="/work" />
        <NavItem isMenuOpen={isOpen} text="Contact" href="/contact" />
      </div>
      <div className="flex flex-col w-fit gap-2 tracking-tighter pb-12">
        <span className="text-[#B9B9B9] social-item mb-8">Social</span>
        <SocialItem text="LinkedIn" href="https://www.linkedin.com/" />
        <SocialItem text="Behance" href="https://www.behance.net/" />
        <SocialItem text="Instagram" href="https://www.instagram.com/" />
        <SocialItem text="Discord" href="https://discord.com/" />
        <SocialItem text="Twitter" href="https://twitter.com/" />
      </div>
    </div>
  );
}
