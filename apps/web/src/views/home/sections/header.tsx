"use client";

import { useTranslations } from "next-intl";
import { SiteHeader } from "@/src/components/layout";
import { NAV_ITEMS } from "../constants/home.constants";

export function Header() {
  const t = useTranslations("landing_page_home.navigation");
  const navigation = NAV_ITEMS.map((item) => ({
    id: item.id,
    label: t(item.labelKey),
    type: item.type,
    href: item.href,
    items: item.items?.map((sub) => ({
      id: sub.id,
      label: t(sub.labelKey),
      href: sub.href,
      icon: sub.icon,
      description: "descriptionKey" in sub ? t(sub.descriptionKey) : undefined,
    })),
  }));

  return (
    <SiteHeader
      navigation={navigation}
      loginLabel={t("login")}
      trialLabel={t("trial")}
    />
  );
}
