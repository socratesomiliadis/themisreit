import SimpleMarquee from "../simple-marquee";
import LogosMarquee1 from "../SVGs/logos-marquee-1";
import LogosMarquee2 from "../SVGs/logos-marquee-2";
import LogosMarquee3 from "../SVGs/logos-marquee-3";
import MapSvg from "../SVGs/map-svg";

export default function HomeProof() {
  return (
    <section className="w-screen flex flex-col">
      <div className="bg-white py-8">
        <SimpleMarquee
          baseVelocity={2}
          direction="left"
          className="bg-[#fff] py-6"
        >
          <div className="w-[100vw] pr-12">
            <LogosMarquee1 width="100%" className="text-black" />
          </div>
        </SimpleMarquee>
        <SimpleMarquee
          baseVelocity={1.5}
          direction="left"
          className="bg-[#fff] py-6"
        >
          <div className="w-[100vw] pr-12">
            <LogosMarquee2 width="100%" className="text-black" />
          </div>
        </SimpleMarquee>
        <SimpleMarquee
          baseVelocity={2}
          direction="left"
          className="bg-[#fff] py-6"
        >
          <div className="w-[100vw] pr-12">
            <LogosMarquee3 width="100%" className="text-black" />
          </div>
        </SimpleMarquee>
      </div>
      <div className="w-full">
        <MapSvg width="100%" />
      </div>
    </section>
  );
}
