"use client";

import Link from "@/components/transition-link";
import useIsomorphicLayoutEffect from "@/hooks/useIsomorphicLayoutEffect";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/utils";
import { gsap, SplitText } from "@/lib/gsap";
import FooterCaligraphy from "./SVGs/footer-caligraphy";
import SimpleMarquee from "./simple-marquee";
import Image from "next/image";

function FooterSmallLink({ href, text }: { href: string; text: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      className="text-[#5E5E5E] hover:text-[#F259EF] tracking-tighter flex flex-row items-center group transition-[color] duration-200 ease-out"
    >
      <span className="flex items-center justify-center w-3 h-lh scale-0 group-hover:scale-100 transition-scale duration-200 ease-out origin-left">
        <svg
          width="100%"
          viewBox="0 0 20 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.6783 1.53149L17.8251 8.67827L10.6783 15.8251M0.468561 8.67827L17.3146 8.67829"
            stroke="currentColor"
            strokeWidth="2.04194"
          />
        </svg>
      </span>
      <span className="-translate-x-3 group-hover:translate-x-1.5 transition-translate duration-200 ease-out">
        {text}
      </span>
    </Link>
  );
}

function FooterNavLink({
  href,
  text,
  className,
}: {
  href: string;
  text: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "text-[#434343] text-3xl tracking-tight flex flex-row items-center gap-0 group",
        className
      )}
    >
      <span className="block w-3 scale-0 group-hover:scale-100 transition-scale duration-200 ease-out text-[#5E5E5E] origin-left">
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
      <span className="-translate-x-3 group-hover:translate-x-2 transition-translate duration-200 ease-out">
        {text}
      </span>
    </Link>
  );
}

export default function Footer() {
  const lenis = useLenis();

  useIsomorphicLayoutEffect(() => {
    let tl: GSAPTimeline;
    const split = SplitText.create(".footer-split-text", {
      type: "words, lines",
      linesClass: "footer-split-line",
      wordsClass: "footer-split-word",
      autoSplit: true,
      onSplit: (self) => {
        self.lines.forEach((line) => {
          gsap.set(line, {
            x: "1rem",
          });
        });
        self.words.forEach((word) => {
          gsap.set(word, {
            opacity: 0,
            filter: "blur(10px)",
          });
        });
        tl = gsap.timeline({
          defaults: {
            duration: 1.2,
            ease: "power2.out",
          },
          scrollTrigger: {
            trigger: "footer",
            start: "top 75%",
            end: "top 20%",
            scrub: true,
          },
        });
        tl.set(".footer-split-text", {
          opacity: 1,
        });
        tl.to(
          self.lines,
          {
            x: 0,
            stagger: 0.1,
          },
          0
        );
        tl.to(
          [self.words, ".footer-anim"],
          {
            x: 0,
            opacity: 1,
            filter: "blur(0px)",
            stagger: 0.05,
          },
          0.1
        );
      },
    });

    return () => {
      split.revert();
      tl?.kill();
    };
  }, []);

  return (
    <>
      <footer className="w-screen relative flex flex-col justify-center">
        <div className="w-full relative flex items-center justify-center z-1">
          <div className="absolute w-full cursor-pointer hover:scale-105 transition-transform duration-500 ease-out translate-y-12">
            <SimpleMarquee
              baseVelocity={10}
              direction="left"
              repeat={20}
              className="bg-[#FF5EFC] py-3 text-sm"
            >
              <span className="pl-1">
                IS YOUR VISION READY TO HIT THE WORLD? — LET&apos;S WORK —
              </span>
            </SimpleMarquee>
          </div>
          <FooterCaligraphy />
        </div>

        <div className="w-full relative z-1 footer-bottom-wrapper px-18 pt-8 pb-14 flex flex-row items-center justify-center whitespace-nowrap">
          <div className="w-full flex">
            <div className="flex flex-col">
              <span className="text-xl text-[#FF5EFC] tracking-tighter">
                Menu
              </span>
              <FooterNavLink href="/" text="Home" className="mt-14" />
              <FooterNavLink href="/clients" text="Clients" />
              <FooterNavLink href="/work" text="Projects" />
              <FooterNavLink href="/universe" text="Universe" />

              <FooterNavLink href="/contact" text="Contact Us" />
            </div>
            <div className="flex flex-col ml-64">
              <span className="text-xl text-[#FF5EFC] tracking-tighter">
                Contact
              </span>
              <div className="mt-14 h-full flex flex-col justify-between">
                <div className="flex flex-col">
                  <span className="text-[#434343] text-base tracking-tight ">
                    Dubai, UAE
                  </span>

                  <FooterSmallLink
                    href="https://maps.app.goo.gl/ZiFDhvea1pHsptuQ6"
                    text="Building A1, Dubai Digital Park"
                  />
                  <FooterSmallLink
                    href="tel:+971 69 69 88 69"
                    text="+971 69 69 88 69"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[#434343] text-base tracking-tight">
                    Jobs
                  </span>
                  <FooterSmallLink
                    href="mailto:hello@pensatori-irrazionali.com"
                    text="hello@pensatori-irrazionali.com"
                  />
                  <FooterSmallLink
                    href="mailto:jobs@pensatori-irrazionali.com"
                    text="jobs@pensatori-irrazionali.com"
                  />
                </div>
              </div>
            </div>
            <div className="w-full flex justify-end">
              <div className="h-full flex flex-col items-end justify-between">
                <button
                  onClick={() => {
                    lenis?.scrollTo(0);
                  }}
                  className="text-xl text-[#FF5EFC] tracking-tighter flex flex-row items-center gap-2 group"
                >
                  <span>Back to top</span>
                  <span className="size-0 group-hover:size-6 transition-size duration-200 ease-out rounded-full bg-[#FF5EFC] flex items-center justify-center text-white">
                    <svg
                      width="45%"
                      viewBox="0 0 17 20"
                      fill="none"
                      className="rotate-180"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15.5872 11.0315L8.44038 18.1783L1.29356 11.0315M8.44038 0.821832L8.44036 17.6679"
                        stroke="currentColor"
                        strokeWidth="2.04194"
                      />
                    </svg>
                  </span>
                </button>
                <div className="flex flex-row gap-8">
                  <Link
                    href="/cookie-settings"
                    className="text-[#5E5E5E] tracking-tighter hover:text-[#FF5EFC] transition-colors duration-200 ease-out"
                  >
                    Cookie Settings
                  </Link>
                  <Link
                    href="/cookie-policy"
                    className="text-[#5E5E5E] tracking-tighter hover:text-[#FF5EFC] transition-colors duration-200 ease-out"
                  >
                    Cookie Policy
                  </Link>
                  <Link
                    href="/privacy-policy"
                    className="text-[#5E5E5E] tracking-tighter hover:text-[#FF5EFC] transition-colors duration-200 ease-out"
                  >
                    Privacy Policy
                  </Link>
                  <span className="text-[#5E5E5E] tracking-tighter">
                    ©{new Date().getFullYear()} All Copyrights Reserved by{" "}
                    <Link
                      href="https://aeva.ae"
                      target="_blank"
                      className="text-[#5E5E5E] tracking-tighter underline"
                    >
                      Aeva
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Image
          style={{
            maskImage: "linear-gradient(to bottom, transparent, black)",
            maskSize: "100% 100%",
          }}
          src="/static/images/tempFooter.png"
          width={2560}
          height={1440}
          className="w-full -mt-[40%] z-0 opacity-50"
          alt="Footer"
        />
      </footer>
    </>
  );
}
