import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { Activity } from "lucide-react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import {
  AdminPage,
  AdminPageHeader,
  AdminStatsGrid,
} from "../src/components/common/admin/admin-page.tsx";
import { AdminStatsCard } from "../src/components/common/admin/admin-stats-card.tsx";
import { AdminTableContainer } from "../src/components/common/admin/admin-table-container.tsx";
import { AdminDataTable } from "../src/components/common/admin/admin-data-table.tsx";
import { AdminTableActions } from "../src/components/common/admin/admin-table-actions.tsx";
import {
  AdminFormActions,
  AdminFormPage,
  AdminFormSection,
} from "../src/components/common/admin/admin-form-page.tsx";
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

test("Business Admin data tables share TanStack rendering and accessible action menus", () => {
  const table = render(AdminDataTable, {
    ariaLabel: "Services",
    columns: [{ accessorKey: "name", header: "Name" }],
    data: [{ id: "service-1", name: "Haircut" }],
    getRowId: (row) => row.id,
  });
  const actions = render(AdminTableActions, {
    children: createElement("span", null, "Edit"),
    label: "Open actions for Haircut",
  });
  const actionSource = readFileSync(
    new URL(
      "../src/components/common/admin/admin-table-actions.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(table, /aria-label="Services"/);
  assert.match(table, /aria-sort="none"/);
  assert.match(table, /Haircut/);
  assert.match(table, /overflow-x-auto/);
  assert.match(actions, /aria-label="Open actions for Haircut"/);
  assert.match(actions, /size-11/);
  assert.match(actionSource, /min-h-11/);
});

test("Business Admin route forms provide reusable navigation, sections and actions", () => {
  const page = renderToStaticMarkup(
    createElement(
      NextIntlClientProvider,
      { locale: "en", messages: {} },
      createElement(
        AdminFormPage,
        {
          backHref: "/admin/categories",
          backLabel: "Back",
          description: "Create a category",
          title: "New category",
        },
        "Form",
      ),
    ),
  );
  const section = render(AdminFormSection, {
    description: "Core information",
    title: "Details",
    children: "Fields",
  });
  const actions = render(AdminFormActions, { children: "Actions" });

  assert.match(page, /href="\/en\/admin\/categories"/);
  assert.match(page, /<h1/);
  assert.match(section, /bg-card/);
  assert.match(section, /<h2/);
  assert.match(actions, /border-border/);
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
  const userMenu = readFileSync(
    new URL("../src/components/common/admin/user-menu.tsx", import.meta.url),
    "utf8",
  );

  assert.match(shell, /href="#admin-main-content"/);
  assert.match(shell, /id="admin-main-content"/);
  assert.match(sidebar, /bg-surface/);
  assert.match(header, /bg-surface\/90/);
  assert.doesNotMatch(header, /<nav/);
  assert.ok(
    header.indexOf('className="hidden min-w-0 max-w-lg flex-1') <
      header.indexOf("<BusinessSwitcher"),
    "desktop search should occupy the former top-navigation area",
  );
  assert.doesNotMatch(header, /<LanguageSwitcher|<ThemeToggle/);
  assert.match(userMenu, /DropdownMenuSub/);
  assert.match(userMenu, /tCommon\("darkMode"\)/);
});
