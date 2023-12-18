import Link from "next/link";
import { useEffect, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useRouter } from "next/router";

function NavItem({ text, href }: { text: string; href: string }) {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link
      href={href}
      style={{
        pointerEvents: isActive ? "none" : "auto",
      }}
      className="text-black group nav-item opacity-0 w-full flex flex-col gap-4 font-semibold text-5xl tracking-tighter"
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
    <div className="w-full h-full flex flex-col justify-between pl-10 pr-16">
      <div className="flex flex-col w-full mt-24 gap-4">
        <NavItem text="Home" href="/" />
        <NavItem text="About" href="/about" />
        <NavItem text="Work" href="/work" />
        <NavItem text="Contact" href="/contact" />
      </div>
      <div className="flex flex-col w-fit gap-2 tracking-tighter pb-12">
        <span className="text-[#B9B9B9] social-item">Social</span>
        <Link
          href="https://www.linkedin.com/"
          target="_blank"
          className="text-black hover:text-[#9c9c9c] transition-colors duration-200 ease-out mt-8 social-item"
        >
          LinkedIn
        </Link>
        <Link
          href="https://www.behance.net/"
          target="_blank"
          className="text-black hover:text-[#9c9c9c] transition-colors duration-200 ease-out social-item"
        >
          Behance
        </Link>
        <Link
          href="https://www.instagram.com/"
          target="_blank"
          className="text-black hover:text-[#9c9c9c] transition-colors duration-200 ease-out social-item"
        >
          Instagram
        </Link>
        <Link
          href="https://discord.com/"
          target="_blank"
          className="text-black hover:text-[#9c9c9c] transition-colors duration-200 ease-out social-item"
        >
          Discord
        </Link>
        <Link
          href="https://twitter.com/"
          target="_blank"
          className="text-black hover:text-[#9c9c9c] transition-colors duration-200 ease-out social-item"
        >
          Twitter
        </Link>
      </div>
    </div>
  );
}
