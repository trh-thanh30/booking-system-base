import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { Activity } from "lucide-react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AdminPage,
  AdminPageHeader,
  AdminStatsGrid,
} from "../src/components/common/admin/admin-page.tsx";
import { AdminStatsCard } from "../src/components/common/admin/admin-stats-card.tsx";
import { AdminTableContainer } from "../src/components/common/admin/admin-table-container.tsx";
import { StatePanel } from "../src/components/common/state-panel.tsx";
import { getDashboardConfig } from "../src/config/dashboard.config.ts";

const render = (component, props) =>
  renderToStaticMarkup(createElement(component, props));

test("Business Admin page compositions provide consistent hierarchy and responsive grids", () => {
  const page = render(AdminPage, { children: "Content" });
  const header = render(AdminPageHeader, {
    actions: createElement("button", null, "Action"),
    description: "Description",
    eyebrow: "Operations",
    title: "Bookings",
  });
  const stats = render(AdminStatsGrid, { children: "Stats" });

  assert.match(page, /space-y-6/);
  assert.match(header, /<h1/);
  assert.match(header, /text-primary/);
  assert.match(header, /md:w-auto/);
  assert.match(stats, /sm:grid-cols-2/);
  assert.match(stats, /xl:grid-cols-4/);
});

test("Business Admin data compositions use semantic surfaces and mobile-safe overflow", () => {
  const stat = render(AdminStatsCard, {
    description: "Compared with yesterday",
    icon: Activity,
    title: "Bookings",
    trend: "+12%",
    value: "124",
  });
  const table = render(AdminTableContainer, {
    children: createElement("table", null),
  });
  const state = render(StatePanel, {
    description: "Nothing is available yet.",
    icon: Activity,
    title: "No data",
  });

  assert.match(stat, /bg-accent/);
  assert.match(stat, /text-accent-foreground/);
  assert.match(table, /bg-card/);
  assert.match(table, /overflow-x-auto/);
  assert.doesNotMatch(state, /Create item/);
});

test("unfinished sidebar destinations are visibly disabled instead of fake buttons", () => {
  const config = getDashboardConfig((key) => key);
  const items = config.sidebarSections.flatMap((section) => section.items);

  for (const item of items.filter((candidate) => !candidate.href)) {
    assert.equal(item.disabled, true, `${item.title} must be disabled`);
    assert.ok(item.badge, `${item.title} must explain its unavailable state`);
  }
});

test("Business Admin shell exposes skip navigation and uses semantic surfaces", () => {
  const shell = readFileSync(
    new URL(
      "../src/components/layout/admin/dashboard-shell.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const sidebar = readFileSync(
    new URL("../src/components/layout/admin/app-sidebar.tsx", import.meta.url),
    "utf8",
  );
  const header = readFileSync(
    new URL("../src/components/layout/admin/header.tsx", import.meta.url),
    "utf8",
  );

  assert.match(shell, /href="#admin-main-content"/);
  assert.match(shell, /id="admin-main-content"/);
  assert.match(sidebar, /bg-surface/);
  assert.match(header, /bg-surface\/90/);
  assert.match(header, /aria-current=/);
});
