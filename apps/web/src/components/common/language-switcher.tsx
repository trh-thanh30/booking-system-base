"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import {
  LANDING_LANGUAGES,
  getLocaleSwitchTarget,
  isLandingLocale,
} from "@/src/utils/locale-switch.utils";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Navigation");
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <label className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-label text-foreground">
      <Globe className="size-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">{t("language")}</span>
      <select
        className="min-h-11 max-w-full cursor-pointer bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait"
        value={locale}
        disabled={pending}
        aria-busy={pending}
        onChange={(event) => {
          const nextLocale = event.target.value;
          if (!isLandingLocale(nextLocale) || nextLocale === locale) return;
          const target = getLocaleSwitchTarget(
            pathname,
            window.location.search,
            window.location.hash,
          );
          startTransition(() =>
            router.replace(target, { locale: nextLocale, scroll: false }),
          );
        }}
      >
        {LANDING_LANGUAGES.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
