import "@/src/views/nail-landing-v2/nail-landing-v2.css";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "BusinessSetup.template",
  });
  return {
    title: `Glossora — ${t("demoBadge")}`,
    description: t("demoNotice"),
    robots: { index: false, follow: false },
  };
}

export default function NailSalonV2Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="nail-salon-v2 antialiased">{children}</div>;
}
