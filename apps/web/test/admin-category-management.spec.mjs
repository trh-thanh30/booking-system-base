import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("category service uses the tenant-scoped management contracts", () => {
  const service = readFileSync(
    new URL("../src/services/admin/categories.service.ts", import.meta.url),
    "utf8",
  );

  assert.match(service, /url: "\/categories"/);
  assert.match(service, /get<CategorySummary>\(`\/categories\/\$\{id\}`/);
  assert.match(service, /post<CategorySummary>\("\/categories", input\)/);
  assert.match(service, /patch<CategorySummary>\(`\/categories\/\$\{id\}`/);
  assert.match(service, /delete<CategorySummary>\(`\/categories\/\$\{id\}`/);
  assert.match(service, /"\/categories\/reorder"/);
  assert.match(service, /category_ids: categoryIds/);
  assert.match(service, /"\/assets\/upload"/);
  assert.match(service, /FormData/);
});

test("category management route stays thin and the view uses shared Admin compositions", () => {
  const route = readFileSync(
    new URL(
      "../app/[locale]/admin/(dashboard)/categories/page.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const view = readFileSync(
    new URL(
      "../src/views/admin/categories/categories.view.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.doesNotMatch(route, /use client/);
  assert.match(route, /CategoriesView/);
  assert.match(view, /AdminPage/);
  assert.match(view, /AdminFilterToolbar/);
  assert.match(view, /AdminDataTable/);
  assert.match(view, /ConfirmDialog/);
  assert.match(view, /useToast/);
  assert.match(view, /href="\/admin\/categories\/new"/);
  assert.doesNotMatch(view, /CategoryFormDialog/);
});

test("category row actions use the shared overflow action menu", () => {
  const columns = readFileSync(
    new URL(
      "../src/views/admin/categories/columns/categories.columns.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(columns, /AdminTableActions/);
  assert.match(columns, /MoreHorizontal|AdminTableActions/);
  assert.match(columns, /AdminTableActionItem/);
  assert.match(columns, /editNamed/);
  assert.match(columns, /archiveNamed/);
  assert.match(columns, /`\/admin\/categories\/\$\{category\.id\}\/edit`/);
});

test("category create and edit forms are deep-linkable route views", () => {
  const createRoute = readFileSync(
    new URL(
      "../app/[locale]/admin/(dashboard)/categories/new/page.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const editRoute = readFileSync(
    new URL(
      "../app/[locale]/admin/(dashboard)/categories/[categoryId]/edit/page.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const formView = readFileSync(
    new URL(
      "../src/views/admin/categories/category-form.view.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const form = readFileSync(
    new URL(
      "../src/views/admin/categories/components/category-form.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.doesNotMatch(createRoute, /use client/);
  assert.doesNotMatch(editRoute, /use client/);
  assert.match(createRoute, /CategoryFormView/);
  assert.match(editRoute, /CategoryFormView/);
  assert.match(formView, /AdminFormPage/);
  assert.match(form, /parent_id/);
  assert.match(form, /CategoryAssetsField/);
  assert.doesNotMatch(form, /Dialog/);
});
