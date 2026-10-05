"use client";

import { toast } from "sonner";

export type { ExternalToast as ToastOptions } from "sonner";

export type ToastApi = Readonly<{
  toast: typeof toast;
}>;

const toastApi: ToastApi = { toast };

/**
 * Returns the shared Sonner toast API.
 *
 * Mount `Toaster` from `@repo/ui/sonner` once in the application layout before
 * using this hook.
 */
export function useToast(): ToastApi {
  return toastApi;
}

export { toast };
