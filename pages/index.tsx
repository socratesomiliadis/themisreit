import Header from "@/components/Header";
import { Inter } from "next/font/google";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Header />
      <main
        className={`${inter.className} bg-black w-screen h-screen relative flex items-center justify-center p-24`}
      >
        <Image
          src="/static/images/BGImage.png"
          width={1577}
          height={2128}
          alt=""
          className="w-full h-full object-cover rounded-2xl"
        />
      </main>
    </>
  );
}
