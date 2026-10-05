import { AcceptInvitationView } from "@/src/views/admin/auth";

export default async function AcceptInvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <AcceptInvitationView token={token} />;
}
