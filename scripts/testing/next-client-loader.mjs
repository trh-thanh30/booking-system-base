import { URL } from "node:url";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

let appRoot;
// Each app must supply its own alias root; never silently resolve against another app.
export function initialize(data) {
  if (data?.appRoot) appRoot = new URL(data.appRoot);
}

export function resolve(specifier, context, nextResolve) {
  if (
    ["next/server", "next/link", "next/navigation", "next/image"].includes(
      specifier,
    )
  )
    specifier += ".js";
  if (specifier.startsWith("@/")) {
    const base = context.parentURL?.includes("/packages/ui/")
      ? new URL(`../../packages/ui/src/${specifier.slice(2)}`, import.meta.url)
      : new URL(specifier.slice(2), appRoot);
    specifier =
      [".ts", ".tsx", "/index.ts"]
        .map((extension) => new URL(base.href + extension))
        .find((url) => existsSync(url))?.href ?? specifier;
  } else if (
    specifier.startsWith(".") &&
    /\.tsx?$/.test(context.parentURL ?? "")
  ) {
    const url = [".ts", ".tsx", "/index.ts"]
      .map((extension) => new URL(specifier + extension, context.parentURL))
      .find((url) => existsSync(url));
    if (url) specifier = url.href;
  }
  return nextResolve(specifier, context);
}

export function load(url, context, nextLoad) {
  // Next's bundler unwraps the CJS default; mirror it in the native ESM test runner.
  if (url.endsWith("/next/image.js")) {
    return {
      format: "module",
      shortCircuit: true,
      source: `import { createRequire } from "node:module";
        const image = createRequire(import.meta.url)(${JSON.stringify(fileURLToPath(url))});
        export default image.default ?? image;`,
    };
  }
  if (/\.tsx?$/.test(url) && url.startsWith("file:")) {
    return {
      format: "module",
      shortCircuit: true,
      source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
          jsx: ts.JsxEmit.ReactJSX,
        },
      }).outputText,
    };
  }
  return nextLoad(url, context);
}
