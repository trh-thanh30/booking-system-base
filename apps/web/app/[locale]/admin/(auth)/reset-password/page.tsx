import { ResetPasswordView } from "@/src/views/admin/auth";

type ResetPasswordPageProps = {
  searchParams: Promise<{ sessionId?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { sessionId } = await searchParams;
  return <ResetPasswordView initialSessionId={sessionId} />;
}
