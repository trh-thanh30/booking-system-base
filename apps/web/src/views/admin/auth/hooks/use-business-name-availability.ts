"use client";

import { authService } from "@/src/services/admin/auth.service";
import { completeOwnerBusinessSchema } from "@repo/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import type { BusinessNameAvailabilityStatus } from "../types/business-onboarding.types";
import { createBusinessSlug } from "../utils/business-onboarding.utils";

export function useBusinessNameAvailability(name: string) {
  const slug = createBusinessSlug(name);
  const [status, setStatus] = useState<BusinessNameAvailabilityStatus>("idle");
  const lastCheckedSlug = useRef("");
  const availabilityRequest = useRef(0);

  useEffect(() => {
    if (lastCheckedSlug.current === slug) return;
    availabilityRequest.current += 1;
    setStatus("idle");
  }, [slug]);

  const check = useCallback(async () => {
    if (slug === lastCheckedSlug.current && status !== "error") return;
    lastCheckedSlug.current = slug;
    const validName =
      completeOwnerBusinessSchema.shape.name.safeParse(name).success;
    if (!validName || slug.length < 2) {
      setStatus("invalid");
      return;
    }
    const request = ++availabilityRequest.current;
    setStatus("checking");
    try {
      const result = await authService.checkOwnerBusinessSlug(slug);
      if (request !== availabilityRequest.current) return;
      setStatus(result.available ? "available" : "unavailable");
    } catch {
      if (request === availabilityRequest.current) {
        lastCheckedSlug.current = "";
        setStatus("error");
      }
    }
  }, [name, slug, status]);

  return { check, slug, status };
}
