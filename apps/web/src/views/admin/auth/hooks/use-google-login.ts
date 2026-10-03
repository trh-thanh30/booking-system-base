"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useToast } from "@repo/hooks";
import { authService } from "@/src/services/admin/auth.service";
import { createGoogleRedirect } from "../utils/google-auth.utils";

export function useGoogleLogin(returnTo?: string) {
  const locale = useLocale();
  const t = useTranslations("Auth");
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const redirect = useMemo(
    () => createGoogleRedirect((url) => window.location.assign(url)),
    [],
  );
  useEffect(() => {
    const reset = () => {
      redirect.reset();
      setIsRedirecting(false);
    };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, [redirect]);

  function startGoogleLogin() {
    try {
      if (redirect.start(authService.getGoogleLoginUrl(locale, returnTo)))
        setIsRedirecting(true);
    } catch {
      setIsRedirecting(false);
      toast.error(t("google.unavailable"));
    }
  }
  return { isRedirecting, startGoogleLogin };
}
