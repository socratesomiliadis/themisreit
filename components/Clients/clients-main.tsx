import { getClients } from "@/lib/sanity/sanity.queries";
import { getClient } from "@/lib/sanity/sanityClient";
import ClientsItem from "./clients-item";

export default async function ClientsMain() {
  const client = getClient();
  const clients = await getClients(client);

  return (
    <section className="w-screen relative pt-40 flex flex-col gap-16 z-10">
      {clients.map((client, index) => (
        <ClientsItem key={client._id} client={client} index={index} />
      ))}
    </section>
  );
}
