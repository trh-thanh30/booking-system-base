import { URL } from "node:url";
import { runSpecFiles } from "../../../scripts/testing/run-spec-files.mjs";
await runSpecFiles(new URL(".", import.meta.url));
