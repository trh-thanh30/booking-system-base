import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { Activity } from "lucide-react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  PageHeader,
  PlatformPage,
  PlatformStatsGrid,
} from "../src/components/common/platform-page.tsx";
import { DataTableContainer } from "../src/components/common/data-table-container.tsx";
import { StatePanel } from "../src/components/common/state-panel.tsx";
import { StatCard } from "../src/components/common/stat-card.tsx";

const render = (component, props) =>
  renderToStaticMarkup(createElement(component, props));

test("Platform Admin compositions provide a consistent responsive hierarchy", () => {
  const page = render(PlatformPage, { children: "Content" });
  const header = render(PageHeader, {
    actions: createElement("button", null, "Action"),
    description: "Description",
    eyebrow: "Platform",
    title: "Tenants",
  });
  const stats = render(PlatformStatsGrid, { children: "Stats" });

  assert.match(page, /space-y-6/);
  assert.match(header, /<h1/);
  assert.match(header, /text-primary/);
  assert.match(stats, /sm:grid-cols-2/);
  assert.match(stats, /xl:grid-cols-3/);
});

test("Platform Admin data and state compositions use semantic surfaces", () => {
  const stat = render(StatCard, {
    description: "Operational workspaces",
    icon: Activity,
    title: "Tenants",
    value: "12",
  });
  const table = render(DataTableContainer, {
    children: createElement("table", null),
  });
  const state = render(StatePanel, {
    description: "No records are available.",
    icon: Activity,
    title: "No data",
  });

  assert.match(stat, /bg-accent/);
  assert.match(table, /bg-card/);
  assert.match(table, /overflow-x-auto/);
  assert.match(state, /bg-surface/);
});

test("Platform shell supports responsive and keyboard navigation", () => {
  const shell = readFileSync(
    new URL("../src/components/layout/platform-shell.tsx", import.meta.url),
    "utf8",
  );
  const sidebar = readFileSync(
    new URL("../src/components/layout/platform-sidebar.tsx", import.meta.url),
    "utf8",
  );

  assert.match(shell, /href="#platform-main-content"/);
  assert.match(shell, /id="platform-main-content"/);
  assert.match(shell, /PlatformMobileSidebar/);
  assert.match(sidebar, /bg-surface/);
  assert.match(sidebar, /aria-current=/);
});

test("Platform notifications go through the shared toast hook", () => {
  const login = readFileSync(
    new URL("../src/views/auth/login.view.tsx", import.meta.url),
    "utf8",
  );
  const tenants = readFileSync(
    new URL("../src/views/tenants/tenants.view.tsx", import.meta.url),
    "utf8",
  );

  assert.match(login, /useToast/);
  assert.match(tenants, /useToast/);
  assert.doesNotMatch(login, /from ["']sonner["']/);
  assert.doesNotMatch(tenants, /from ["']sonner["']/);
});
