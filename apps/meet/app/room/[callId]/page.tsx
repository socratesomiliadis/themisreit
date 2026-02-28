import { MeetingRoom } from "@/components/meeting-room";

export default async function MeetingRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ callId: string }>;
  searchParams: Promise<{ gs?: string }>;
}) {
  const { callId } = await params;
  const { gs } = await searchParams;

  return <MeetingRoom callId={callId} guestSessionToken={gs} />;
}
