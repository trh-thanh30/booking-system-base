"use client";

import { useEffect, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useToast } from "@repo/hooks";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import { LANGUAGE_SWITCH_TOAST_KEY } from "@/src/constants/locale-switch.constants";
import {
  LANDING_LANGUAGES,
  getLocaleSwitchTarget,
  isLandingLocale,
} from "@/src/utils/locale-switch.utils";

export function useLocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Navigation");
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (sessionStorage.getItem(LANGUAGE_SWITCH_TOAST_KEY) !== locale) return;
    const timeout = window.setTimeout(() => {
      if (sessionStorage.getItem(LANGUAGE_SWITCH_TOAST_KEY) !== locale) return;
      sessionStorage.removeItem(LANGUAGE_SWITCH_TOAST_KEY);
      toast.success(t("languageChanged"), {
        classNames: {
          title: "!text-sm !font-semibold !leading-relaxed",
        },
      });
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [locale, t, toast]);

  const currentLanguage =
    LANDING_LANGUAGES.find((language) => language.code === locale) ??
    LANDING_LANGUAGES[0];

  function selectLanguage(nextLocale: string) {
    if (!isLandingLocale(nextLocale) || nextLocale === locale) return;
    const target = getLocaleSwitchTarget(
      pathname,
      window.location.search,
      window.location.hash,
    );
    sessionStorage.setItem(LANGUAGE_SWITCH_TOAST_KEY, nextLocale);
    startTransition(() =>
      router.replace(target, { locale: nextLocale, scroll: false }),
    );
  }

  return {
    currentLanguage,
    locale,
    pending,
    selectLanguage,
  };
}
