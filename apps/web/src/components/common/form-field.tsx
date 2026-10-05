"use client";

import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { Label, cn } from "@repo/ui";

type FormFieldProps = {
  children: ReactNode;
  description?: string;
  error?: string;
  htmlFor: string;
  label: string;
  required?: boolean;
};

export function FormField({
  children,
  description,
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
              "aria-required": required || undefined,
              "aria-describedby":
                [
                  child.props["aria-describedby"],
                  description ? `${htmlFor}-description` : undefined,
                  error ? `${htmlFor}-error` : undefined,
                ]
                  .filter(Boolean)
                  .join(" ") || undefined,
            })
          : child,
      )}
      {description ? (
        <p
          id={`${htmlFor}-description`}
          className="text-xs leading-5 text-muted-foreground"
        >
          {description}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="text-xs leading-5 text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
