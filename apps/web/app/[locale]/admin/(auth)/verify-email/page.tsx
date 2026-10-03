import { VerifyEmailView } from "@/src/views/admin/auth";

type VerifyEmailPageProps = {
  searchParams: Promise<{ sessionId?: string; returnTo?: string }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { sessionId, returnTo } = await searchParams;
  return <VerifyEmailView initialSessionId={sessionId} returnTo={returnTo} />;
}
