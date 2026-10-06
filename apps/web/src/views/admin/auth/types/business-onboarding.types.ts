export type BusinessOnboardingStep = 0 | 1 | 2;

export type BusinessOnboardingDraftSaveStatus =
  | "idle"
  | "restored"
  | "saving"
  | "saved"
  | "error";

export type BusinessNameAvailabilityStatus =
  | "idle"
  | "checking"
  | "available"
  | "unavailable"
  | "invalid"
  | "error";
