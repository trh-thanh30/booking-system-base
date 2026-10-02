"use client";

import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { Label, cn } from "@repo/ui";

export function RegistrationField({
  error,
  id,
  label,
  children,
}: {
  error?: string;
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {Children.map(children, (child) =>
        isValidElement<Record<string, unknown>>(child)
          ? cloneElement(child, {
              className: cn(
                "min-h-11 text-body",
                typeof child.props.className === "string"
                  ? child.props.className
                  : undefined,
              ),
              "aria-invalid": Boolean(error),
              "aria-describedby": error ? `${id}-error` : undefined,
            })
          : child,
      )}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs leading-5 text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
