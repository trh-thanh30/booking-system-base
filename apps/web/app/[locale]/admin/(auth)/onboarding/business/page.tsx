import {
  GoogleOnboardingView,
  OwnerOnboardingView,
} from "@/src/views/admin/auth";

export default async function BusinessOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ provider?: string }>;
}) {
  const { provider } = await searchParams;
  return provider === "email" ? (
    <OwnerOnboardingView />
  ) : (
    <GoogleOnboardingView />
  );
}
