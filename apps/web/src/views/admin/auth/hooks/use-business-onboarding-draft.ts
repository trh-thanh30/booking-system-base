"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import {
  completeOwnerBusinessSchema,
  type CompleteOwnerBusinessInput,
} from "@repo/shared";

const STORAGE_KEY = "booking:owner-business-onboarding-draft:v1";

type Draft = {
  profileEmail: string;
  step: number;
  values: CompleteOwnerBusinessInput;
  updatedAt: number;
};

export function useBusinessOnboardingDraft({
  form,
  profileEmail,
  step,
  setStep,
  isPending,
  onDraftStateChange,
}: {
  form: UseFormReturn<CompleteOwnerBusinessInput>;
  profileEmail: string;
  step: number;
  setStep: (step: number) => void;
  isPending: boolean;
  onDraftStateChange?: (hasDraft: boolean, clearDraft: () => void) => void;
}) {
  const values = useWatch({ control: form.control });
  const [hydrated, setHydrated] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const restoredDraft = useRef(false);

  const clearDraft = useCallback(() => {
    window.sessionStorage.removeItem(STORAGE_KEY);
    restoredDraft.current = false;
    setHasDraft(false);
  }, []);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as Partial<Draft>;
      if (draft.profileEmail !== profileEmail || !draft.values) {
        clearDraft();
        return;
      }
      const parsed = completeOwnerBusinessSchema
        .partial()
        .safeParse(draft.values);
      if (
        !parsed.success ||
        typeof draft.step !== "number" ||
        draft.step < 0 ||
        draft.step > 2
      ) {
        clearDraft();
        return;
      }
      form.reset(parsed.data as CompleteOwnerBusinessInput);
      setStep(draft.step);
      restoredDraft.current = true;
      setHasRestoredDraft(true);
      setHasDraft(true);
    } catch {
      clearDraft();
    } finally {
      setHydrated(true);
    }
  }, [clearDraft, form, profileEmail, setStep]);

  useEffect(() => {
    if (!hydrated || (!form.formState.isDirty && !restoredDraft.current))
      return;
    const draft: Draft = {
      profileEmail,
      step,
      values: values as CompleteOwnerBusinessInput,
      updatedAt: Date.now(),
    };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setHasDraft(true);
  }, [form.formState.isDirty, hydrated, profileEmail, step, values]);

  useEffect(() => {
    onDraftStateChange?.(hasDraft, clearDraft);
  }, [clearDraft, hasDraft, onDraftStateChange]);

  useEffect(() => {
    if (!hasDraft || isPending) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasDraft, isPending]);

  return { clearDraft, hasDraft, hasRestoredDraft, hydrated };
}
