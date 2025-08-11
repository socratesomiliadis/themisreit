import Image from "next/image";

export default function Home() {
  return (
    <>
      <main>
        <section className="relative z-10 w-screen h-screen">
          <Image
            src="/static/images/flags.png"
            alt="BGImage"
            width={1238}
            height={1201}
            className="absolute top-0 right-0 w-auto h-full object-contain"
          />
        </section>
        <section className="w-screen h-screen">
          <Image
            src="/static/images/testProjects.png"
            alt="BGImage"
            width={1920}
            height={1080}
            className="w-full"
          />
        </section>
      </main>
    </>
  );
}
