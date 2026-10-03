"use client";

import { QueryProvider } from "@/src/app/providers/query-provider";
import { AuthProvider } from "./auth-provider";
import NextTopLoader from "nextjs-toploader";

// One private cache and session boundary across Admin auth and dashboard routes.
// Public registration uses a separate client and never inherits these credentials.
export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <NextTopLoader color="var(--color-primary)" showSpinner={false} />
        {children}
      </AuthProvider>
    </QueryProvider>
  );
}
