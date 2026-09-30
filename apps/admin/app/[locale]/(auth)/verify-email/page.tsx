import { VerifyEmailView } from "@/src/views/auth";

type VerifyEmailPageProps = {
  searchParams: Promise<{ sessionId?: string }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { sessionId } = await searchParams;
  return <VerifyEmailView initialSessionId={sessionId} />;
}
