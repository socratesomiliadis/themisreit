import Link from "next/link";
import SimpleMarquee from "./simple-marquee";
import useIsomorphicLayoutEffect from "@/hooks/useIsomorphicLayoutEffect";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/utils";
import { gsap, SplitText } from "@/lib/gsap";

function FooterSmallLink({ href, text }: { href: string; text: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      className="text-[#5E5E5E] hover:text-[#E1FF00] tracking-tighter flex flex-row items-center group transition-[color] duration-200 ease-out"
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
    <footer className="w-screen relative flex flex-col z-[998]">
      <div className="w-full flex flex-col h-screen justify-between p-16 bg-[#E1FF00] select-none">
        <p className="text-black text-3xl leading-none tracking-tighter footer-split-text">
          Client: I want a website with Gzhel fish <br />
          swiming around.
        </p>
        <div className="flex flex-col">
          <p className="text-black text-3xl leading-none tracking-tighter footer-split-text">
            Got a crazy idea?
          </p>
          <Link
            href="/contact"
            className="text-black text-8xl underline tracking-tight w-fit footer-anim opacity-0 translate-x-4 blur"
          >
            Let&apos;s Work
          </Link>
        </div>
        <span className="w-full">
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
        </span>
      </div>
      {/* <SimpleMarquee className="py-6" repeat={10}>
        <div className="flex flex-row items-center gap-5 pl-5">
          <span className="text-white uppercase text-2xl tracking-tight">
            CONTINUE SCROLLING
          </span>
          <span className="block w-5">
            <svg
              width="100%"
              viewBox="0 0 17 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.5872 11.0315L8.44038 18.1783L1.29356 11.0315M8.44038 0.821832L8.44036 17.6679"
                stroke="white"
                strokeWidth="2.04194"
              />
            </svg>
          </span>
        </div>
      </SimpleMarquee> */}
      <div
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
        className="w-full h-[50vh] relative footer-bottom-wrapper"
      >
        <div className="w-full h-[50vh] footer-bottom fixed bottom-0 px-18 py-24 flex flex-row items-center justify-center whitespace-nowrap">
          <div className="w-full flex">
            <div className="flex flex-col">
              <span className="text-lg text-[#E1FF00] tracking-tighter">
                Menu
              </span>
              <FooterNavLink href="/" text="Home" className="mt-14" />
              <FooterNavLink href="/about" text="About Us" />
              <FooterNavLink href="/projects" text="Projects" />
              <FooterNavLink href="/universe" text="Universe" />

              <FooterNavLink href="/contact" text="Contact Us" />
            </div>
            <div className="flex flex-col ml-64">
              <span className="text-lg text-[#E1FF00] tracking-tighter">
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
                    lenis?.scrollTo(0);
                  }}
                  className="text-lg text-[#E1FF00] tracking-tighter flex flex-row items-center gap-2 group"
                >
                  <span>Back to top</span>
                  <span className="size-0 group-hover:size-6 transition-size duration-200 ease-out rounded-full bg-[#E1FF00] flex items-center justify-center text-black">
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
      </div>
    </footer>
  );
}
