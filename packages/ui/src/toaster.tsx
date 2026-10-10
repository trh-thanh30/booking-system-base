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
  "--error-text": "var(--color-danger-500)",
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
  mobileOffset = {
    top: "calc(env(safe-area-inset-top, 0px) + 16px)",
    right: 16,
    bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
    left: 16,
  },
  position = "top-right",
  richColors = false,
  style,
  toastOptions,
  ...props
}: ToasterProps) {
  return (
    <Sonner
      className={cn("toaster group", className)}
      closeButton={closeButton}
      icons={{
        error: (
          <OctagonXIcon aria-hidden="true" className="size-4 text-danger" />
        ),
        info: <InfoIcon aria-hidden="true" className="size-4 text-info" />,
        loading: (
          <LoaderCircleIcon
            aria-hidden="true"
            className="size-4 animate-spin motion-reduce:animate-none"
          />
        ),
        success: (
          <CircleCheckIcon aria-hidden="true" className="size-4 text-success" />
        ),
        warning: (
          <TriangleAlertIcon
            aria-hidden="true"
            className="size-4 text-warning"
          />
        ),
        ...icons,
      }}
      position={position}
      mobileOffset={mobileOffset}
      richColors={richColors}
      style={{ ...defaultStyle, ...style }}
      toastOptions={{
        ...toastOptions,
        classNames: {
          actionButton: "!bg-primary !text-primary-foreground",
          cancelButton: "!bg-muted !text-muted-foreground",
          closeButton:
            "!left-auto !right-1 !top-1/2 !size-11 !-translate-y-1/2 !transform-none !rounded-lg !border-0 !bg-transparent !text-muted-foreground hover:!bg-muted hover:!text-foreground focus-visible:!outline-2 focus-visible:!outline-ring sm:!right-2 sm:!size-8",
          description: "!text-muted-foreground",
          title: "!font-medium !leading-6",
          toast:
            "!min-h-14 !gap-3 !rounded-lg !border-border !bg-popover !py-3 !pl-4 !pr-14 !font-sans !text-sm !text-popover-foreground !shadow-sm sm:!pr-12 [&_[data-content]]:min-w-0 [&_[data-content]]:flex-1",
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  );
}
