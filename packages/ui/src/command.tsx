"use client";

import { Command as CommandPrimitive } from "cmdk";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Command({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      className={cn(
        "flex h-full w-full flex-col overflow-hidden bg-popover text-popover-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function CommandInput({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof CommandPrimitive.Input>) {
  return (
    <CommandPrimitive.Input
      className={cn(
        "h-10 w-full border-b border-border bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function CommandList({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      className={cn(
        "max-h-72 overflow-y-auto overflow-x-hidden p-1",
        className,
      )}
      {...props}
    />
  );
}

export function CommandEmpty({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      className={cn(
        "py-6 text-center text-sm text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function CommandItem({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={cn(
        "relative flex min-h-10 cursor-default select-none items-center rounded-sm px-3 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}
