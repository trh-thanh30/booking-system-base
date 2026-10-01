import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export function resolve(specifier, context, nextResolve) {
  if (specifier === "next/server") specifier = "next/server.js";
  if (specifier.startsWith("@/")) {
    specifier = new URL(`../${specifier.slice(2)}.ts`, import.meta.url).href;
  } else if (specifier.startsWith(".") && context.parentURL?.endsWith(".ts")) {
    const url = new URL(`${specifier}.ts`, context.parentURL);
    if (existsSync(url)) specifier = url.href;
  }
  return nextResolve(specifier, context);
}

export function load(url, context, nextLoad) {
  if (url.endsWith(".ts") && url.startsWith("file:")) {
    return {
      format: "module",
      shortCircuit: true,
      source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
        },
      }).outputText,
    };
  }
  return nextLoad(url, context);
}
