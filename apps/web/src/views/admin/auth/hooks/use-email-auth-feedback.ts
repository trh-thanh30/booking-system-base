"use client";

import { useEffect, useState } from "react";
import { getEmailAuthError } from "../utils/email-auth.utils";

export function useEmailAuthFeedback() {
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [retryAt, setRetryAt] = useState(0);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!retryAt) return;
    const tick = () =>
      setRemaining(Math.max(0, Math.ceil((retryAt - Date.now()) / 1000)));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [retryAt]);

  function cooldown(seconds = 60) {
    setRemaining(seconds);
    setRetryAt(Date.now() + seconds * 1000);
  }

  function fail(error: unknown, phase: "request" | "otp") {
    const result = getEmailAuthError(error, phase);
    setErrorKey(result.key);
    if (result.expired) setExpired(true);
    if (result.retryAfter) cooldown(result.retryAfter);
    return result;
  }

  function clear() {
    setErrorKey(null);
  }

  function resetSession() {
    clear();
    setExpired(false);
  }

  return { errorKey, expired, remaining, cooldown, fail, clear, resetSession };
}
