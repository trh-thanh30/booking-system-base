import type { BusinessNameAvailabilityStatus } from "../types/business-onboarding.types";

export function createContactAvailabilityCheck({
  getValue,
  request,
  onStatus,
}: {
  getValue: () => string;
  request: (value: string) => Promise<{ available: boolean }>;
  onStatus: (status: BusinessNameAvailabilityStatus) => void;
}) {
  let pending: { value: string; promise: Promise<boolean> } | undefined;
  let generation = 0;
  return () => {
    const value = getValue().trim();
    if (pending?.value === value) return pending.promise;
    const current = ++generation;
    if (!value) {
      onStatus("idle");
      return Promise.resolve(true);
    }
    onStatus("checking");
    const promise = request(value)
      .then((result) => {
        if (generation !== current || getValue().trim() !== value) return false;
        onStatus(result.available ? "available" : "unavailable");
        return result.available;
      })
      .catch(() => {
        if (generation === current && getValue().trim() === value)
          onStatus("error");
        return false;
      })
      .finally(() => {
        if (pending?.promise === promise) pending = undefined;
      });
    pending = { value, promise };
    return promise;
  };
}
