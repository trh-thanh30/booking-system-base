import assert from "node:assert/strict";
import test from "node:test";
import {
  findNativeHtmlViolations,
  isLandingExempt,
  scanClientNativeHtml,
} from "../../../scripts/testing/native-html-policy.mjs";

test("native HTML guard rejects img, internal/dynamic links and spread attributes", () => {
  for (const source of [
    '<img src="/logo.svg" />',
    '<a href="/admin/login">Login</a>',
    "<a href={url}>Login</a>",
    '<a href="javascript:alert(1)">Unsafe</a>',
    '<a href="">Empty</a>',
    '<a href="relative-route">Internal</a>',
    '<a href="?page=2">Internal</a>',
    '<a href="https://example.com" {...props}>Unknown</a>',
    '<a href="/report" download={false}>Internal</a>',
    '<img data-native-reason="" />',
    "<img data-native-reason={reason} />",
  ])
    assert.equal(findNativeHtmlViolations(source).length, 1, source);
});

test("native HTML guard permits Next components and documented browser behavior", () => {
  for (const source of [
    '<Image src="/logo.svg" alt="" width={20} height={20} />',
    '<Link href="/admin/login">Login</Link>',
    '<a href="#content">Skip to content</a>',
    '<a href="https://example.com">External</a>',
    '<a href={"mailto:help@example.com"}>Email</a>',
    '<a href="tel:+84901234567">Call</a>',
    '<a href="/report.csv" download>Download</a>',
    "<a href={url} download={true}>Download</a>",
    '<img data-native-reason="Third-party widget requires a native image node" />',
    '<a href={url} data-native-reason="Full-page redirect to a separately hosted service">Open</a>',
    'const example = "<img />"; /* <a href="/admin">Example</a> */',
  ])
    assert.deepEqual(findNativeHtmlViolations(source), [], source);
});

test("exceptions apply to a single element, and errors include source location", () => {
  const errors = findNativeHtmlViolations(
    '<><img data-native-reason="Library requires a native node" />\n<img src="/bad.svg" /></>',
    "example.tsx",
  );
  assert.equal(errors.length, 1);
  assert.match(errors[0], /^example\.tsx:2:1 <img>/);
});

test("Landing exclusions do not exclude Admin or general shared components", () => {
  assert.ok(isLandingExempt("apps/web/src/views/home/sections/header.tsx"));
  assert.ok(isLandingExempt("apps/web/src/components/layout/site-header.tsx"));
  assert.equal(
    isLandingExempt("apps/web/src/components/common/google-icon.tsx"),
    false,
  );
  assert.equal(
    isLandingExempt("apps/web/src/views/admin/auth/login.view.tsx"),
    false,
  );
  assert.equal(
    isLandingExempt("apps/platform-admin/src/views/home/home.view.tsx"),
    false,
  );
});

test("Web source uses Next Image/Link outside explicit exceptions", async () => {
  const errors = await scanClientNativeHtml("web");
  assert.deepEqual(
    errors,
    [],
    `Native HTML policy violations:\n${errors.join("\n")}`,
  );
});
