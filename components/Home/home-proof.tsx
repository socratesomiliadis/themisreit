import SimpleMarquee from "../simple-marquee";
import LogosMarquee from "../SVGs/logos-marquee";

export default function HomeProof() {
  return (
    <section className="w-screen flex flex-col">
      <SimpleMarquee className="bg-[#E1FF00] py-12">
        <div className="w-screen">
          <LogosMarquee width="100%" className="text-black" />
        </div>
      </SimpleMarquee>
    </section>
  );
}
