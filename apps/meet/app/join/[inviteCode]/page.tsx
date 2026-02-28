import { GuestJoinForm } from "@/components/guest-join-form";

export default async function JoinInvitePage({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}) {
  const { inviteCode } = await params;

  return <GuestJoinForm inviteCode={inviteCode} />;
}
