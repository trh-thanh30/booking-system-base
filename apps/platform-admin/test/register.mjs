import { URL } from "node:url";
import { register } from "node:module";

register("../../../scripts/testing/next-client-loader.mjs", import.meta.url, {
  data: { appRoot: new URL("../", import.meta.url).href },
});
