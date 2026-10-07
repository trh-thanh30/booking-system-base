"use client";

import { Label, cn } from "@repo/ui";
import {
  Children,
  cloneElement,
  isValidElement,
  type AriaRole,
  type ReactNode,
} from "react";

type FormFieldProps = {
  children: ReactNode;
  description?: ReactNode;
  descriptionClassName?: string;
  descriptionRole?: AriaRole;
  error?: string;
  htmlFor: string;
  label: string;
  required?: boolean;
  className?: string;
};

export function FormField({
  children,
  description,
  descriptionClassName,
  descriptionRole,
  error,
  htmlFor,
  label,
  className,
  required = false,
}: FormFieldProps) {
  const childNodes = Children.toArray(children);
  const controlIndex = childNodes.findIndex((child) => isValidElement(child));

  return (
    <div className="grid gap-2">
      <Label className={className} htmlFor={htmlFor}>
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-destructive">
            *
          </span>
        ) : null}
      </Label>
      {childNodes.map((child, index) =>
        index === controlIndex && isValidElement<Record<string, unknown>>(child)
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
          role={descriptionRole}
          className={cn(
            "text-xs leading-5 text-muted-foreground",
            descriptionClassName,
          )}
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
