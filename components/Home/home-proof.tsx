import SimpleMarquee from "../simple-marquee";
import LogosMarquee from "../SVGs/logos-marquee";
import { useRef } from "react";

export default function HomeProof() {
  return (
    <section className="w-screen flex flex-col">
      <SimpleMarquee
        useScrollVelocity={true}
        scrollAwareDirection={true}
        className="bg-[#E1FF00] py-12"
      >
        <div className="w-screen">
          <LogosMarquee width="100%" className="text-black" />
        </div>
      </SimpleMarquee>
    </section>
  );
}
