"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import type { CompleteOwnerBusinessInput } from "@repo/shared";
import { BUSINESS_ONBOARDING_DRAFT_AUTOSAVE_DELAY_MS } from "../constants/business-onboarding-draft.constants";
import type {
  BusinessOnboardingDraftSaveStatus,
  BusinessOnboardingStep,
} from "../types/business-onboarding.types";
import {
  clearBusinessOnboardingDraft,
  createBusinessOnboardingDraft,
  loadBusinessOnboardingDraft,
  saveBusinessOnboardingDraft,
} from "../utils/business-onboarding-draft.utils";

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
  step: BusinessOnboardingStep;
  setStep: (step: BusinessOnboardingStep) => void;
  isPending: boolean;
  onDraftStateChange?: (hasDraft: boolean, clearDraft: () => void) => void;
}) {
  const values = useWatch({ control: form.control });
  const [hydrated, setHydrated] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [saveStatus, setSaveStatus] =
    useState<BusinessOnboardingDraftSaveStatus>("idle");
  const restoredDraft = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const writeDraftRef = useRef<() => boolean | null>(() => null);

  const clearDraft = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    clearBusinessOnboardingDraft(window.localStorage);
    form.reset(form.getValues(), {
      keepErrors: true,
      keepTouched: true,
    });
    restoredDraft.current = false;
    setHasRestoredDraft(false);
    setHasDraft(false);
    setSaveStatus("idle");
  }, [form]);

  const writeDraft = useCallback(
    (nextStep = step) => {
      if (!hydrated || (!form.formState.isDirty && !restoredDraft.current)) {
        return null;
      }
      const draft = createBusinessOnboardingDraft({
        profileEmail,
        step: nextStep,
        values: form.getValues(),
      });
      return saveBusinessOnboardingDraft(window.localStorage, draft);
    },
    [form, hydrated, profileEmail, step],
  );
  writeDraftRef.current = writeDraft;

  const persistDraft = useCallback(
    (nextStep = step) => {
      const saved = writeDraft(nextStep);
      if (saved === null) return true;
      setHasDraft(saved);
      setSaveStatus(saved ? "saved" : "error");
      return saved;
    },
    [step, writeDraft],
  );

  useEffect(() => {
    const draft = loadBusinessOnboardingDraft(
      window.localStorage,
      profileEmail,
    );
    if (draft) {
      form.reset(draft.values);
      setStep(draft.step);
      restoredDraft.current = true;
      setHasRestoredDraft(true);
      setHasDraft(true);
      setSaveStatus("restored");
    }
    setHydrated(true);
  }, [form, profileEmail, setStep]);

  useEffect(() => {
    if (!hydrated || !form.formState.isDirty) return;
    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(
      () => persistDraft(),
      BUSINESS_ONBOARDING_DRAFT_AUTOSAVE_DELAY_MS,
    );
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [form.formState.isDirty, hydrated, persistDraft, values]);

  useEffect(() => {
    if (!hydrated) return;
    const handlePageHide = () => persistDraft();
    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [hydrated, persistDraft]);

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      writeDraftRef.current();
    },
    [],
  );

  useEffect(() => {
    onDraftStateChange?.(hasDraft, clearDraft);
  }, [clearDraft, hasDraft, onDraftStateChange]);

  useEffect(() => {
    if (isPending || (saveStatus !== "saving" && saveStatus !== "error")) {
      return;
    }
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!persistDraft()) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isPending, persistDraft, saveStatus]);

  return {
    clearDraft,
    hasDraft,
    hasRestoredDraft,
    hydrated,
    persistDraft,
    saveStatus,
  };
}
