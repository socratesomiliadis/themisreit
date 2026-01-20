import SimpleMarquee from "@/components/simple-marquee";
import { getServices } from "@/lib/sanity/sanity.queries";
import { getClient } from "@/lib/sanity/sanityClient";
import ServiceItem from "./service-item";

export default async function HomeServices() {
  const client = getClient();
  const services = await getServices(client);

  return (
    <>
      <div className="mt-44 w-screen relative z-10">
        <SimpleMarquee
          direction="left"
          repeat={6}
          className="py-0 text-white markos border-y border-[#303030]/30 h-[4.6rem] items-center"
        >
          <div className="relative font-ballet text-9xl mt-5 pr-2">
            Disciplines{" "}
            <span className="text-[#5E5E5E] font-helvetica-now text-lg absolute top-4 -right-8">
              (02)
            </span>
          </div>
          <div className="text-8xl px-10 flex items-center gap-6 tracking-tight">
            <span className="w-12 h-[6px] bg-white"></span>
            By Pensatori Irrazionali
            <span className="w-12 h-[6px] bg-white"></span>
          </div>
        </SimpleMarquee>
      </div>
      <div className="w-screen pt-32 pb-40 flex flex-col home-services relative z-10">
        {services.map((service, index) => (
          <ServiceItem key={service._id} service={service} index={index} />
        ))}
      </div>
    </>
  );
}
