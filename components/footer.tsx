"use client";

import Link from "@/components/transition-link";
import useIsomorphicLayoutEffect from "@/hooks/useIsomorphicLayoutEffect";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/utils";
import { gsap, SplitText } from "@/lib/gsap";
import { useState } from "react";
import FooterCaligraphy from "./SVGs/footer-caligraphy";
import SimpleMarquee from "./simple-marquee";

function FooterSmallLink({ href, text }: { href: string; text: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      className="text-[#5E5E5E] hover:text-[#28F300] tracking-tighter flex flex-row items-center group transition-[color] duration-200 ease-out"
    >
      <span className="flex items-center justify-center w-3 h-[1lh] scale-0 group-hover:scale-100 transition-scale duration-200 ease-out origin-left">
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
        "text-white text-3xl tracking-tight flex flex-row items-center gap-0 group",
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
  const [isScrolling, setIsScrolling] = useState(false);
  const lenis = useLenis();

  useIsomorphicLayoutEffect(() => {
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
        const tl = gsap.timeline({
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
  }, []);

  return (
    <>
      <footer className="w-screen relative flex flex-col z-[998]">
        <div className="w-full relative flex items-center justify-center">
          <div className="w-full absolute flex flex-col items-center -translate-y-[45%]">
            <svg
              width="94%"
              className="-mb-px"
              viewBox="0 0 1802 148"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_3873_1191)">
                <rect x="1126" y="105" width="282" height="43" fill="#111111" />
                <rect
                  x="1691"
                  y="-52"
                  width="127"
                  height="67"
                  rx="21.5"
                  fill="#111111"
                />
                <path
                  d="M179.944 5.12891V45.6417H114.067V224.616H65.8768V45.8981H0V5.12891H179.944Z"
                  fill="white"
                />
                <path
                  d="M247.358 5.12891V89.4879H336.305V5.12891H384.495V224.616H336.305V130.001H247.358V224.616H199.168V5.12891H247.358Z"
                  fill="white"
                />
                <path
                  d="M568.028 5.12891V45.6417H452.167V92.5648H558.544V130.001H452.167V183.847H570.591V224.36H403.977V5.12891H568.028Z"
                  fill="white"
                />
                <path
                  d="M655.179 5.12891L706.445 156.155H706.958L755.66 5.12891H823.588V224.616H778.474V69.2315H777.961L724.132 224.873H686.964L633.135 70.7699H632.622V224.873H587.508V5.12891H655.435H655.179Z"
                  fill="white"
                />
                <path
                  d="M891.26 5.12891V224.616H843.07V5.12891H891.26Z"
                  fill="white"
                />
                <path
                  d="M1087.86 70.7692H1041.21C1039.67 48.718 1026.86 37.6923 998.149 37.6923C980.206 37.6923 964.57 45.3846 964.57 62.5641C964.57 78.4615 973.798 81.5385 1023.01 93.8462C1055.57 102.051 1095.3 113.333 1095.3 159.744C1095.3 201.282 1062.49 230.256 1004.04 230.256C957.649 230.256 910.484 208.205 910.484 153.59V152.051H957.136C957.136 183.077 982.769 192.564 1005.33 192.564C1027.88 192.564 1048.39 185.128 1048.39 165.128C1048.39 151.282 1037.62 142.564 1010.71 135.897C994.304 131.538 980.206 128.462 966.108 123.846C933.041 112.821 917.918 94.1026 917.918 66.1538C917.918 21.7949 959.7 0 999.943 0C1046.85 0 1087.86 21.0256 1087.86 70.7692Z"
                  fill="white"
                />
                <path
                  d="M1290.88 5.12891C1329.58 5.12891 1355.22 31.7956 1355.22 65.6417C1355.22 93.334 1343.43 111.539 1320.36 120.77V121.283C1351.12 130.001 1352.14 163.847 1352.91 184.36C1353.94 205.385 1355.99 216.924 1361.63 224.616H1313.44C1309.85 215.385 1308.57 202.052 1307.28 186.411C1304.72 155.642 1299.85 138.719 1269.35 138.719H1220.9V224.616H1172.71V5.12891H1291.14H1290.88ZM1273.96 104.616C1294.21 104.616 1306.77 96.4109 1306.77 73.334C1306.77 51.5392 1294.72 42.8212 1273.45 42.8212H1220.64V104.616H1273.7H1273.96Z"
                  fill="white"
                />
                <path
                  d="M1537.47 5.12891V45.6417H1421.61V92.5648H1527.98V130.001H1421.61V183.847H1540.03V224.36H1373.42V5.12891H1537.47Z"
                  fill="white"
                />
                <path
                  d="M1605.14 5.12891V224.616H1556.95V5.12891H1605.14Z"
                  fill="white"
                />
                <path
                  d="M1802 5.12891V45.6417H1736.12V224.616H1687.93V45.8981H1622.05V5.12891H1802Z"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_3873_1191">
                  <rect width="1802" height="148" fill="white" />
                </clipPath>
              </defs>
            </svg>

            <div className="cursor-pointer hover:scale-105 transition-transform duration-500 ease-out">
              <SimpleMarquee
                baseVelocity={1.5}
                direction="left"
                repeat={20}
                className="bg-[#2BFF00] py-4"
              >
                <span className="pl-1">
                  IS YOUR VISION READY TO HIT THE WORLD? — LET&apos;S WORK —
                </span>
              </SimpleMarquee>
            </div>
          </div>
          <FooterCaligraphy />
        </div>
        <div className="w-full h-[50vh] relative footer-bottom-wrapper px-18 py-24 flex flex-row items-center justify-center whitespace-nowrap">
          <div className="w-full flex">
            <div className="flex flex-col">
              <span className="text-lg text-[#28F300] tracking-tighter">
                Menu
              </span>
              <FooterNavLink href="/" text="Home" className="mt-14" />
              <FooterNavLink href="/about" text="About Us" />
              <FooterNavLink href="/projects" text="Projects" />
              <FooterNavLink href="/universe" text="Universe" />

              <FooterNavLink href="/contact" text="Contact Us" />
            </div>
            <div className="flex flex-col ml-64">
              <span className="text-lg text-[#28F300] tracking-tighter">
                Contact
              </span>
              <div className="mt-14 h-full flex flex-col justify-between">
                <div className="flex flex-col">
                  <span className="text-white text-base tracking-tight ">
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
                  <span className="text-white text-base tracking-tight">
                    Jobs
                  </span>
                  <FooterSmallLink
                    href="mailto:hello@themisreit.com"
                    text="hello@themisreit.com"
                  />
                  <FooterSmallLink
                    href="mailto:jobs@themisreit.com"
                    text="jobs@themisreit.com"
                  />
                </div>
              </div>
            </div>
            <div className="w-full flex justify-end">
              <div className="h-full flex flex-col items-end justify-between">
                <button
                  onClick={() => {
                    setIsScrolling(true);
                    lenis?.scrollTo(0, {
                      duration: 9,
                      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -7 * t)),
                      onComplete: () => {
                        setIsScrolling(false);
                      },
                    });
                  }}
                  className="text-lg text-[#28F300] tracking-tighter flex flex-row items-center gap-2 group"
                >
                  <span>Back to top</span>
                  <span className="size-0 group-hover:size-6 transition-size duration-200 ease-out rounded-full bg-[#28F300] flex items-center justify-center text-black">
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
                    className="text-[#5E5E5E] tracking-tighter hover:text-white transition-colors duration-200 ease-out"
                  >
                    Cookie Settings
                  </Link>
                  <Link
                    href="/cookie-policy"
                    className="text-[#5E5E5E] tracking-tighter hover:text-white transition-colors duration-200 ease-out"
                  >
                    Cookie Policy
                  </Link>
                  <Link
                    href="/privacy-policy"
                    className="text-[#5E5E5E] tracking-tighter hover:text-white transition-colors duration-200 ease-out"
                  >
                    Privacy Policy
                  </Link>
                  <span className="text-[#5E5E5E] tracking-tighter">
                    ©2025 All Copyrights Reserved by{" "}
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
      </footer>
    </>
  );
}
