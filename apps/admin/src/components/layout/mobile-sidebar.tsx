"use client";

import { Menu } from "lucide-react";
import { Button, Sheet, SheetContent, SheetTrigger } from "@repo/ui";
import { AppSidebar } from "@/src/components/layout/app-sidebar";

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          aria-label="Open navigation"
          className="lg:hidden"
          size="icon"
          variant="ghost"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <AppSidebar />
      </SheetContent>
    </Sheet>
  );
}
