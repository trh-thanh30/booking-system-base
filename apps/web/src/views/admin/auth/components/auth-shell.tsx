import type { ReactNode } from "react";
import { AuthenticationLayout } from "@/src/components/layout";

export function AuthShell(props: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return <AuthenticationLayout {...props} />;
}
