"use client";

import { SiteHeader } from "@/src/components/layout";
import { NAV_ITEMS } from "../constants/home.constants";

export function Header() {
  return <SiteHeader navigation={NAV_ITEMS} />;
}
