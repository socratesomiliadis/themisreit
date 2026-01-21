import SimpleMarquee from "@/components/simple-marquee";
import { getServices } from "@/lib/sanity/sanity.queries";
import { getClient } from "@/lib/sanity/sanityClient";
import ServiceItem from "./service-item";
import TitleMarquee from "@/components/title-marquee";

export default async function HomeServices() {
  const client = getClient();
  const services = await getServices(client);

  return (
    <>
      <div className="mt-44 w-screen relative z-10">
        <TitleMarquee title="Disciplines" number={2} />
      </div>
      <div className="w-screen pt-32 pb-40 flex flex-col home-services relative z-10">
        {services.map((service, index) => (
          <ServiceItem key={service._id} service={service} index={index} />
        ))}
      </div>
    </>
  );
}
