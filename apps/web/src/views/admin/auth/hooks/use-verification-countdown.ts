"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const VERIFICATION_CODE_TTL_SECONDS = 15 * 60;
const STORAGE_PREFIX = "booking:verification-code-expiry:";

export function useVerificationCountdown(sessionId: string) {
  const active = Boolean(sessionId);
  const deadline = useRef(
    active ? Date.now() + VERIFICATION_CODE_TTL_SECONDS * 1000 : 0,
  );
  const [remaining, setRemaining] = useState(
    active ? VERIFICATION_CODE_TTL_SECONDS : 0,
  );

  const restart = useCallback(() => {
    const nextDeadline = Date.now() + VERIFICATION_CODE_TTL_SECONDS * 1000;
    deadline.current = nextDeadline;
    if (sessionId)
      window.sessionStorage.setItem(
        `${STORAGE_PREFIX}${sessionId}`,
        String(nextDeadline),
      );
    setRemaining(VERIFICATION_CODE_TTL_SECONDS);
  }, [sessionId]);

  const clear = useCallback(() => {
    if (sessionId)
      window.sessionStorage.removeItem(`${STORAGE_PREFIX}${sessionId}`);
    deadline.current = 0;
    setRemaining(0);
  }, [sessionId]);

  useEffect(() => {
    if (!active) {
      deadline.current = 0;
      setRemaining(0);
      return;
    }
    const stored = Number(
      window.sessionStorage.getItem(`${STORAGE_PREFIX}${sessionId}`),
    );
    if (Number.isFinite(stored) && stored > 0) {
      deadline.current = stored;
      setRemaining(Math.max(0, Math.ceil((stored - Date.now()) / 1000)));
      return;
    }
    restart();
  }, [active, restart, sessionId]);

  useEffect(() => {
    if (!active) return;
    const tick = () =>
      setRemaining(
        Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)),
      );
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [active]);

  return { clear, expired: active && remaining === 0, remaining, restart };
}
