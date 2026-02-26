import Image from "next/image";

export default function HomeReel() {
  return (
    <div className="w-screen px-12 relative flex items-center justify-center z-10">
      <Image
        src="/static/images/reelThumb.png"
        alt=""
        width={1920 * 1.5}
        height={1080 * 1.5}
        className="w-full h-auto z-0"
      />
    </div>
  );
}
