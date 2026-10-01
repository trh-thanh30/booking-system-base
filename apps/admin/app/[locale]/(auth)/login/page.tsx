import { LoginView } from "@/src/views/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  return <LoginView returnTo={returnTo} />;
}
