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
            viewBox="0 0 1794 233"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.0283203 5.82895H181.299V46.731H114.988V227.072H66.3392V46.731H0.0283203V5.82895Z"
              fill="black"
            />
            <path
              d="M195.964 5.82895H244.613V90.7317H334.163V5.82895H382.812V227.072H334.163V131.634H244.613V227.072H195.964V5.82895Z"
              fill="black"
            />
            <path
              d="M414.793 5.82895H580.261V46.731H463.442V94.1402H570.655V131.944H463.442V186.17H582.739V227.072H414.793V5.82895Z"
              fill="black"
            />
            <path
              d="M604.875 5.82895H673.355L725.103 157.972H725.722L774.681 5.82895H843.161V227.072H797.611V70.2806H796.991L742.765 227.072H705.271L651.045 71.83H650.425V227.072H604.875V5.82895Z"
              fill="black"
            />
            <path
              d="M875.147 5.82895H923.796V227.072H875.147V5.82895Z"
              fill="black"
            />
            <path
              d="M1031.91 0.561279C1079.32 0.561279 1120.53 21.632 1120.53 71.83H1073.44C1071.89 49.5198 1058.87 38.3647 1030.05 38.3647C1012.08 38.3647 996.279 46.1113 996.279 63.4637C996.279 79.5766 1005.58 82.6752 1055.15 95.0698C1088 103.436 1127.97 114.591 1127.97 161.381C1127.97 203.212 1094.82 232.339 1035.94 232.339C989.153 232.339 941.743 210.029 941.743 155.183V153.634H988.843C988.843 184.93 1014.56 194.536 1037.49 194.536C1059.8 194.536 1080.87 187.099 1080.87 166.958C1080.87 153.014 1070.03 144.338 1042.76 137.521C1026.34 133.183 1012.08 130.084 997.829 125.436C964.363 114.281 949.18 95.3796 949.18 67.182C949.18 22.5616 991.322 0.561279 1031.91 0.561279Z"
              fill="black"
            />
            <path
              d="M1146.07 5.82895H1265.37C1304.41 5.82895 1330.13 32.7871 1330.13 66.8721C1330.13 94.7599 1318.36 113.042 1295.12 122.338V122.958C1326.1 131.634 1327.03 165.719 1327.96 186.48C1328.89 207.55 1331.06 219.325 1336.64 227.072H1287.99C1284.27 217.776 1283.03 204.452 1281.79 188.649C1279.31 157.662 1274.36 140.62 1243.68 140.62H1194.72V227.072H1146.07V5.82895ZM1194.72 105.915H1248.33C1268.78 105.915 1281.48 97.5487 1281.48 74.3089C1281.48 52.3085 1269.4 43.6324 1248.02 43.6324H1194.72V105.915Z"
              fill="black"
            />
            <path
              d="M1358.85 5.82895H1524.32V46.731H1407.5V94.1402H1514.71V131.944H1407.5V186.17H1526.8V227.072H1358.85V5.82895Z"
              fill="black"
            />
            <path
              d="M1548.93 5.82895H1597.58V227.072H1548.93V5.82895Z"
              fill="black"
            />
            <path
              d="M1612.12 5.82895H1793.39V46.731H1727.08V227.072H1678.43V46.731H1612.12V5.82895Z"
              fill="black"
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
