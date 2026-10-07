import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const webMode = process.argv.includes("--web");
const reportRoot = webMode ? join(packageRoot, "../../apps/web") : packageRoot;
const sourceRoots = webMode
  ? [join(reportRoot, "src"), join(reportRoot, "app")]
  : [join(packageRoot, "src")];
const sourceExtensions = new Set([".ts", ".tsx", ".css"]);
const forbiddenPatterns = [
  {
    label: "raw hexadecimal color",
    pattern: /#[\da-fA-F]{3,8}\b/g,
  },
  {
    label: "Tailwind palette color; use shared semantic or numbered tokens",
    pattern:
      /\b(?:bg|border|text|ring|outline|fill|stroke|from|via|to|shadow|divide|decoration)-(?:blue|sky|cyan|slate|gray|zinc|stone|red|rose|green|emerald|yellow|amber|orange|violet|purple|indigo|pink|teal|lime)-\d{2,3}\b/g,
  },
  { label: "raw RGB/HSL color", pattern: /\b(?:rgba?|hsla?)\(\s*[\d.]/g },
  {
    label: "legacy Landing token",
    pattern:
      /\b(?:bg|text|border|ring|from|to|via|stroke|shadow|caret|accent)-(?:brand-blue(?:-hover|-active)?|bg-primary|bg-secondary|text-primary|text-secondary|text-tertiary|text-muted|border-light|border-gray)\b/g,
  },
];

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);

      if (entry.isDirectory()) {
        return collectSourceFiles(path);
      }

      return sourceExtensions.has(extname(entry.name)) ? [path] : [];
    }),
  );

  return files.flat();
}

const violations = [];

for (const file of (
  await Promise.all(sourceRoots.map(collectSourceFiles))
).flat()) {
  if (!webMode && file.includes(`${join("src", "styles")}`)) continue;
  const content = await readFile(file, "utf8");
  const lines = content.split("\n");

  for (const [index, line] of lines.entries()) {
    for (const { label, pattern } of forbiddenPatterns) {
      pattern.lastIndex = 0;
      const matches = [...line.matchAll(pattern)];

      for (const match of matches) {
        const relPath = relative(reportRoot, file).replaceAll("\\", "/");
        if (
          webMode &&
          relPath === "src/views/home/constants/color-input.constants.ts" &&
          line === 'export const COLOR_INPUT_DEFAULT = "#006aff";' &&
          match[0] === "#006aff"
        )
          continue;
        violations.push(
          `${relative(reportRoot, file)}:${index + 1} ${label}: ${match[0]}`,
        );
      }
    }
  }
}

if (violations.length > 0) {
  console.error("Design token validation failed:\n");
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Design token validation passed.");
}
