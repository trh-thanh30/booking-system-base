"use client";

import { MoreHorizontal } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";

type AdminTableActionsProps = {
  children: ReactNode;
  disabled?: boolean;
  label: string;
};

export function AdminTableActions({
  children,
  disabled = false,
  label,
}: AdminTableActionsProps) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={label}
            className="size-11"
            disabled={disabled}
            size="icon"
            type="button"
            variant="ghost"
          >
            <MoreHorizontal aria-hidden="true" className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">{children}</DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function AdminTableActionItem({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuItem>) {
  return (
    <DropdownMenuItem className={cn("min-h-11 gap-2", className)} {...props} />
  );
}
