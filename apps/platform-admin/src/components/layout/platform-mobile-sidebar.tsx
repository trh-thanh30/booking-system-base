"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import {
  Button,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui";
import { PlatformSidebar } from "./platform-sidebar";
import { useTranslations } from "next-intl";

export function PlatformMobileSidebar() {
  const t = useTranslations("Common");
  const [open, setOpen] = useState(false);

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button
          aria-label={t("openNavigation")}
          className="lg:hidden"
          size="icon"
          variant="ghost"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[min(20rem,calc(100vw-2rem))] p-0">
        <SheetTitle className="sr-only">{t("openNavigation")}</SheetTitle>
        <PlatformSidebar
          collapsed={false}
          onNavigate={() => setOpen(false)}
          showCollapseButton={false}
        />
      </SheetContent>
    </Sheet>
  );
}
