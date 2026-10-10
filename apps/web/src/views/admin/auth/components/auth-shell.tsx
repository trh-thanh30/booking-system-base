import type { ComponentProps } from "react";
import { AuthenticationLayout } from "@/src/components/layout";

export function AuthShell(props: ComponentProps<typeof AuthenticationLayout>) {
  return <AuthenticationLayout {...props} />;
}
