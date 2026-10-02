import { LoginView } from "@/src/views/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string; oauthError?: string }>;
}) {
  const { returnTo, oauthError } = await searchParams;
  return <LoginView returnTo={returnTo} oauthError={oauthError} />;
}
