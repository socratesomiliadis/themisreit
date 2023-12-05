import Header from "@/components/Header";
import { Inter } from "next/font/google";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Header />
      <main
        className={`${inter.className} bg-black w-screen h-screen relative flex items-center justify-center`}
      >
        <Image
          src="/static/images/gero.png"
          width={1577}
          height={2128}
          alt=""
          className="w-1/5"
        />
      </main>
    </>
  );
}
