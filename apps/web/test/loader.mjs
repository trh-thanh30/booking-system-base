import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export function resolve(specifier, context, nextResolve) {
  if (["next/server", "next/link", "next/navigation"].includes(specifier))
    specifier += ".js";
  if (specifier.startsWith("@/")) {
    const base = context.parentURL?.includes("/packages/ui/")
      ? new URL(
          `../../../packages/ui/src/${specifier.slice(2)}`,
          import.meta.url,
        )
      : new URL(`../${specifier.slice(2)}`, import.meta.url);
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
