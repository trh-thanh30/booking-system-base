import type { ReactNode } from "react";
import { Label } from "@repo/ui";

type FormFieldProps = {
  children: ReactNode;
  error?: string;
  htmlFor: string;
  label: string;
  required?: boolean;
};

export function FormField({
  children,
  error,
  htmlFor,
  label,
  required = false,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-destructive">
            *
          </span>
        ) : null}
      </Label>
      {children}
      {error ? (
        <p className="text-xs leading-5 text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
