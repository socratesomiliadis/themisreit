import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
    }

    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const body = await req.text();
    const wh = new Webhook(webhookSecret);

    let event: WebhookEvent;
    try {
      event = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as WebhookEvent;
    } catch {
      return new Response("Invalid webhook signature", { status: 400 });
    }

    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const { id, email_addresses, first_name, last_name, username, image_url } = event.data;
        const primaryEmail = email_addresses?.find(
          (e: any) => e.id === event.data.primary_email_address_id,
        );

        await ctx.runMutation(internal.users.upsert, {
          clerkId: id,
          email: primaryEmail?.email_address ?? "",
          firstName: first_name ?? undefined,
          lastName: last_name ?? undefined,
          username: username ?? undefined,
          imageUrl: image_url ?? undefined,
        });
        break;
      }

      case "user.deleted": {
        if (event.data.id) {
          await ctx.runMutation(internal.users.remove, {
            clerkId: event.data.id,
          });
        }
        break;
      }

      case "organization.created":
      case "organization.updated": {
        const { id, name, slug, image_url } = event.data;
        await ctx.runMutation(internal.organizations.upsert, {
          clerkId: id,
          name,
          slug: slug ?? undefined,
          imageUrl: image_url ?? undefined,
        });
        break;
      }

      case "organization.deleted": {
        if (event.data.id) {
          await ctx.runMutation(internal.organizations.remove, {
            clerkId: event.data.id,
          });
        }
        break;
      }

      case "organizationMembership.created":
      case "organizationMembership.updated": {
        const { organization, public_user_data, role } = event.data;
        await ctx.runMutation(internal.organizations.upsertMember, {
          clerkOrgId: organization.id,
          clerkUserId: public_user_data.user_id,
          role,
        });
        break;
      }

      case "organizationMembership.deleted": {
        const { organization, public_user_data } = event.data;
        await ctx.runMutation(internal.organizations.removeMember, {
          clerkOrgId: organization.id,
          clerkUserId: public_user_data.user_id,
        });
        break;
      }

      default:
        // Unhandled event type — ignore silently
        break;
    }

    return new Response(null, { status: 200 });
  }),
});

type WebhookEvent = {
  type: string;
  data: any;
};

export default http;
