import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.SANITY_REVALIDATE_SECRET) {
      return new Response(
        "Missing environment variable SANITY_REVALIDATE_SECRET",
        { status: 500 }
      );
    }

    const { isValidSignature, body } = await parseBody<any>(
      req,
      process.env.SANITY_REVALIDATE_SECRET
    );

    if (!isValidSignature) {
      const message = "Invalid signature";
      return new Response(JSON.stringify({ message, isValidSignature, body }), {
        status: 401,
      });
    } else if (body?.type === "client") {
      revalidatePath("/clients");
      const message = "Updated routes: /clients";
      return NextResponse.json({ body, message });
    } else if (body?.type === "service") {
      revalidatePath("/");
      const message = `Updated routes: /`;
      return NextResponse.json({ body, message });
    } else if (body?.type === "project" && !body?.slug) {
      const message = "Bad Request";
      return new Response(JSON.stringify({ message, body }), { status: 400 });
    } else if (body?.type === "project" && body?.slug) {
      revalidatePath("/");
      revalidatePath("/work");
      revalidatePath("/universe");
      revalidatePath(`/work/${body.slug.current}`);
      const message = `Updated routes: /, /work, /universe, /work/${body.slug.current}`;

      return NextResponse.json({ body, message });
    }

    const message = "Bad Request";
    return new Response(JSON.stringify({ message, body }), { status: 400 });
  } catch (err) {
    console.error(err);
    return new Response((err as Error).message, { status: 500 });
  }
}
