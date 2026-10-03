import { SignupBusinessView } from "@/src/views/signup-business";
import { createLandingMetadata } from "@/src/utils/metadata.utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createLandingMetadata(locale, "/signup-business");
}

export default function SignupBusinessPage() {
  return <SignupBusinessView />;
}
