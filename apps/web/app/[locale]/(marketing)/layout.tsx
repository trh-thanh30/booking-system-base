import { createLandingMetadata } from "@/src/utils/metadata.utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createLandingMetadata(locale);
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
