"use client";

import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent } from "@repo/ui";
import { navItems } from "@/src/components/layout/nav-items";
import { useAdminUiStore } from "@/src/app/stores/ui.store";

export function CommandMenu() {
  const open = useAdminUiStore((state) => state.commandOpen);
  const setOpen = useAdminUiStore((state) => state.setCommandOpen);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="p-0">
        <CommandPrimitive className="overflow-hidden rounded-lg bg-white dark:bg-slate-950">
          <div className="flex items-center border-b border-slate-200 px-3 dark:border-slate-800">
            <Search className="mr-2 h-4 w-4 shrink-0 text-slate-500" />
            <CommandPrimitive.Input
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
              placeholder="Search pages..."
            />
          </div>
          <CommandPrimitive.List className="max-h-80 overflow-y-auto p-2">
            <CommandPrimitive.Empty className="py-6 text-center text-sm text-slate-500">
              No results found.
            </CommandPrimitive.Empty>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <CommandPrimitive.Item
                  asChild
                  className="cursor-pointer rounded-md px-3 py-2 text-sm outline-none aria-selected:bg-slate-100 dark:aria-selected:bg-slate-900"
                  key={item.href}
                  onSelect={() => setOpen(false)}
                  value={item.title}
                >
                  <Link className="flex items-center gap-3" href={item.href}>
                    <Icon className="h-4 w-4 text-slate-500" />
                    {item.title}
                  </Link>
                </CommandPrimitive.Item>
              );
            })}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}
