export type BusinessOnboardingStep = 0 | 1 | 2;

export type BusinessNameAvailabilityStatus =
  | "idle"
  | "checking"
  | "available"
  | "unavailable"
  | "invalid"
  | "error";
