import Image from "next/image";

export default function Home() {
  return (
    <>
      <main
        className={` w-screen h-screen relative flex items-center justify-center p-24`}
      >
        <Image
          src="/static/images/flags.png"
          alt="BGImage"
          width={1238}
          height={1201}
          className="absolute top-0 right-0 w-auto h-full object-contain"
        />
      </main>
    </>
  );
}
