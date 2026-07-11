import type { ReactNode } from "react";
import { Label } from "@repo/ui";

type FormFieldProps = {
  children: ReactNode;
  error?: string;
  htmlFor: string;
  label: string;
};

export function FormField({ children, error, htmlFor, label }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs leading-5 text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
