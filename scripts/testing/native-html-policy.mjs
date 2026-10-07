import { URL } from "node:url";
import ts from "typescript";
import { readdir, readFile } from "node:fs/promises";

function literalValue(initializer) {
  if (!initializer) return undefined;
  const value = ts.isJsxExpression(initializer)
    ? initializer.expression
    : initializer;
  return value &&
    (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value))
    ? value.text
    : undefined;
}

/** Inspect JSX, never comments/strings. Exceptions belong to one element only. */
export function findNativeHtmlViolations(source, filename = "fixture.tsx") {
  const file = ts.createSourceFile(
    filename,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const violations = [];
  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(file);
      if (tag === "img" || tag === "a") {
        const attributes = node.attributes.properties;
        const attribute = (name) =>
          attributes.find(
            (item) =>
              ts.isJsxAttribute(item) && item.name.getText(file) === name,
          );
        const reason = attribute("data-native-reason");
        const reasonText = reason && literalValue(reason.initializer);
        let problem;
        if (reason && (!reasonText || reasonText.trim().length < 12)) {
          problem =
            "data-native-reason must contain a static, descriptive reason (at least 12 characters)";
        } else if (!reasonText) {
          if (tag === "img") {
            problem =
              "Use Image from next/image, or document an element-level native image exception";
          } else {
            const href = literalValue(attribute("href")?.initializer);
            const download = attribute("download");
            const isDownload =
              download &&
              (!download.initializer ||
                literalValue(download.initializer) !== undefined ||
                (ts.isJsxExpression(download.initializer) &&
                  download.initializer.expression?.kind ===
                    ts.SyntaxKind.TrueKeyword));
            const hasSpread = attributes.some(ts.isJsxSpreadAttribute);
            const nativeHref =
              href &&
              /^(?:#.+|https?:\/\/\S+|\/\/\S+|mailto:\S+|tel:\S+)$/.test(href);
            if (hasSpread || (!isDownload && !nativeHref)) {
              problem =
                "Use localized Link for internal navigation; dynamic href/spread requires data-native-reason";
            }
          }
        }
        if (problem) {
          const position = file.getLineAndCharacterOfPosition(
            node.getStart(file),
          );
          violations.push(
            `${filename}:${position.line + 1}:${position.character + 1} <${tag}> ${problem}`,
          );
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return violations;
}

export function isLandingExempt(path) {
  return (
    path.startsWith("apps/web/src/views/home/") ||
    path.startsWith("apps/web/src/views/signup-business/") ||
    path.startsWith("apps/web/app/[locale]/(marketing)/") ||
    [
      "apps/web/src/components/layout/site-header.tsx",
      "apps/web/src/components/common/landing-compositions.tsx",
    ].includes(path)
  );
}

export async function scanClientNativeHtml(app) {
  if (!["web", "platform-admin"].includes(app))
    throw new Error("Unknown frontend app");
  const root = new URL("../../", import.meta.url);
  const errors = [];
  async function scan(path) {
    for (const entry of await readdir(new URL(path, root), {
      withFileTypes: true,
    })) {
      const child = `${path}/${entry.name}`;
      if (entry.isDirectory()) await scan(child);
      else if (/\.[jt]sx?$/.test(entry.name) && !isLandingExempt(child)) {
        errors.push(
          ...findNativeHtmlViolations(
            await readFile(new URL(child, root), "utf8"),
            child,
          ),
        );
      }
    }
  }
  for (const folder of ["src", "app"]) await scan(`apps/${app}/${folder}`);
  return errors;
}
