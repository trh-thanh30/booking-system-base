"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  LoaderCircleIcon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import { Toaster as Sonner } from "sonner";
import type { ToasterProps } from "sonner";

import { cn } from "./lib/utils";

type SonnerStyle = CSSProperties & {
  "--error-bg": string;
  "--error-border": string;
  "--error-text": string;
  "--info-bg": string;
  "--info-border": string;
  "--info-text": string;
  "--normal-bg": string;
  "--normal-border": string;
  "--normal-text": string;
  "--success-bg": string;
  "--success-border": string;
  "--success-text": string;
  "--warning-bg": string;
  "--warning-border": string;
  "--warning-text": string;
};

const defaultStyle: SonnerStyle = {
  "--error-bg": "var(--color-danger-surface)",
  "--error-border": "var(--color-danger-border)",
  "--error-text": "var(--color-danger-surface-foreground)",
  "--info-bg": "var(--color-info-surface)",
  "--info-border": "var(--color-info-border)",
  "--info-text": "var(--color-info-surface-foreground)",
  "--normal-bg": "var(--color-popover)",
  "--normal-border": "var(--color-border)",
  "--normal-text": "var(--color-popover-foreground)",
  "--success-bg": "var(--color-success-surface)",
  "--success-border": "var(--color-success-border)",
  "--success-text": "var(--color-success-surface-foreground)",
  "--warning-bg": "var(--color-warning-surface)",
  "--warning-border": "var(--color-warning-border)",
  "--warning-text": "var(--color-warning-surface-foreground)",
};

export function Toaster({
  className,
  closeButton = true,
  icons,
  position = "top-right",
  richColors = true,
  style,
  toastOptions,
  ...props
}: ToasterProps) {
  return (
    <Sonner
      className={cn("toaster group", className)}
      closeButton={closeButton}
      icons={{
        error: <OctagonXIcon aria-hidden="true" className="size-4" />,
        info: <InfoIcon aria-hidden="true" className="size-4" />,
        loading: (
          <LoaderCircleIcon
            aria-hidden="true"
            className="size-4 animate-spin motion-reduce:animate-none"
          />
        ),
        success: <CircleCheckIcon aria-hidden="true" className="size-4" />,
        warning: <TriangleAlertIcon aria-hidden="true" className="size-4" />,
        ...icons,
      }}
      position={position}
      richColors={richColors}
      style={{ ...defaultStyle, ...style }}
      toastOptions={{
        ...toastOptions,
        classNames: {
          actionButton: "!bg-primary !text-primary-foreground",
          cancelButton: "!bg-muted !text-muted-foreground",
          closeButton:
            "!border-border !bg-background !text-foreground hover:!bg-muted",
          description: "!text-current/75",
          toast: "!font-sans !shadow-lg",
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  );
}
