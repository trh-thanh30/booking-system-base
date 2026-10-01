import { readdir } from "node:fs/promises";

// Import specs in one process; node:test emits TAP and returns a failure exit code.
for (const file of (await readdir(new URL(".", import.meta.url))).sort()) {
  if (file.endsWith(".spec.mjs")) await import(new URL(file, import.meta.url));
}
