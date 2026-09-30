import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const sourceRoot = join(packageRoot, "src");
const sourceExtensions = new Set([".ts", ".tsx"]);
const forbiddenPatterns = [
  {
    label: "raw hexadecimal color",
    pattern: /#[\da-fA-F]{3,8}\b/g,
  },
  {
    label: "Tailwind palette color; use shared semantic or numbered tokens",
    pattern:
      /\b(?:bg|border|text|ring|outline|fill|stroke)-(?:blue|sky|slate|gray|zinc|red|rose|green|emerald|yellow|amber)-\d{2,3}\b/g,
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

for (const file of await collectSourceFiles(sourceRoot)) {
  const content = await readFile(file, "utf8");
  const lines = content.split("\n");

  for (const [index, line] of lines.entries()) {
    for (const { label, pattern } of forbiddenPatterns) {
      pattern.lastIndex = 0;
      const matches = [...line.matchAll(pattern)];

      for (const match of matches) {
        violations.push(
          `${relative(packageRoot, file)}:${index + 1} ${label}: ${match[0]}`,
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
