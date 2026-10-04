import { VerifyEmailView } from "@/src/views/admin/auth";

type VerifyEmailPageProps = {
  searchParams: Promise<{
    sessionId?: string;
    returnTo?: string;
    onboarding?: string;
  }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { sessionId, returnTo, onboarding } = await searchParams;
  return (
    <VerifyEmailView
      initialSessionId={sessionId}
      returnTo={returnTo}
      ownerOnboarding={onboarding === "1"}
    />
  );
}
