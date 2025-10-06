import Link from "next/link";
import SimpleMarquee from "./simple-marquee";
import useIsomorphicLayoutEffect from "@/hooks/useIsomorphicLayoutEffect";
import { useLenis } from "lenis/react";

export default function Footer() {
  const lenis = useLenis();
  // useIsomorphicLayoutEffect(() => {
  //   const footerBottom = document.querySelector(
  //     ".footer-bottom"
  //   ) as HTMLElement;
  //   const footerBottomWrapper = document.querySelector(
  //     ".footer-bottom-wrapper"
  //   ) as HTMLElement;
  //   footerBottomWrapper.style.height = `${footerBottom?.offsetHeight}px`;
  // }, []);
  return (
    <footer className="w-screen relative flex flex-col z-[998]">
      <div className="w-full flex flex-col h-screen justify-between p-16 bg-[#E1FF00]">
        <p className="text-black text-3xl leading-none tracking-tighter">
          Client: I want a website with Gzhel fish <br />
          swiming around.
        </p>
        <div className="flex flex-col">
          <p className="text-black text-3xl leading-none tracking-tighter">
            Got a crazy idea?
          </p>
          <Link
            href="/contact"
            className="text-black text-8xl underline tracking-tight w-fit"
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
        <div className="w-full h-[50vh] footer-bottom bg-[#101010] fixed bottom-0 px-18 py-24 flex flex-row items-center justify-center whitespace-nowrap">
          <div className="w-full flex">
            <div className="flex flex-col">
              <span className="text-lg text-[#E1FF00] tracking-tighter">
                Menu
              </span>
              <Link
                href="/"
                className="text-white text-3xl tracking-tight mt-14"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-white text-3xl tracking-tight"
              >
                About Us
              </Link>
              <Link
                href="/projects"
                className="text-white text-3xl tracking-tight"
              >
                Projects
              </Link>
              <Link
                href="/universe"
                className="text-white text-3xl tracking-tight"
              >
                Universe
              </Link>
              <Link
                href="/contact"
                className="text-white text-3xl tracking-tight"
              >
                Contact Us
              </Link>
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
                  <span className="text-[#5E5E5E] tracking-tighter">
                    Palm Jumeirah, Villa 0810,
                  </span>
                  <span className="text-[#5E5E5E] tracking-tighter">
                    +971 69 69 88 69
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-base tracking-tight">
                    Jobs
                  </span>
                  <span className="text-[#5E5E5E] tracking-tighter">
                    hello@themisreit.com
                  </span>
                  <span className="text-[#5E5E5E] tracking-tighter">
                    jobs@themisreit.com
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full flex justify-end">
              <div className="h-full flex flex-col items-end justify-between">
                <button
                  onClick={() => {
                    lenis?.scrollTo(0);
                  }}
                  className="text-lg text-[#E1FF00] tracking-tighter flex flex-row items-center gap-3 group"
                >
                  <span>Back to top</span>
                  <span className="block w-0 group-hover:w-3 transition-width duration-200 ease-out">
                    <svg
                      width="100%"
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
                  <span className="text-[#5E5E5E] tracking-tighter">
                    Cookie Settings
                  </span>
                  <span className="text-[#5E5E5E] tracking-tighter">
                    Cookie Policy
                  </span>
                  <span className="text-[#5E5E5E] tracking-tighter">
                    Privacy Policy
                  </span>
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
