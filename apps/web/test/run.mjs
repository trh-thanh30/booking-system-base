import { readdir } from "node:fs/promises";
for (const file of (await readdir(new URL(".", import.meta.url))).sort()) {
  if (file.endsWith(".spec.mjs")) await import(new URL(file, import.meta.url));
}
