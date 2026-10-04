import { URL } from "node:url";
import { readdir } from "node:fs/promises";

/** Deterministic recursive discovery, including future nested client specs. */
export async function runSpecFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const file = new URL(
      entry.name + (entry.isDirectory() ? "/" : ""),
      directory,
    );
    if (entry.isDirectory()) await runSpecFiles(file);
    else if (entry.isFile() && entry.name.endsWith(".spec.mjs"))
      await import(file.href);
  }
}
