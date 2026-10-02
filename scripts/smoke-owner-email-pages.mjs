import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

// Build Web/Admin first. Temporary servers are stopped even when an assertion fails.
const servers = [
  ["admin", 3102],
  ["web", 3101],
].map(([app, port]) => {
  const server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", String(port)],
    {
      cwd: fileURLToPath(new URL(`../apps/${app}/`, import.meta.url)),
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  server.stdout.on("data", () => {});
  server.stderr.on("data", (data) => process.stderr.write(data));
  return server;
});

async function get(url) {
  for (let attempt = 0; attempt < 40; attempt++) {
    if (servers.some((server) => server.exitCode !== null))
      throw new Error("Smoke server exited before checks completed");
    try {
      return await fetch(url, { redirect: "manual" });
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error("Smoke server not ready");
}

try {
  for (const [url, marker] of [
    ["http://localhost:3101/vi/signup-business", 'name="owner.email"'],
    [
      "http://localhost:3102/en/verify-email?sessionId=smoke-session",
      'name="code"',
    ],
    ["http://localhost:3102/vi/forgot-password", 'type="email"'],
    [
      "http://localhost:3102/en/reset-password?sessionId=smoke-session",
      'name="confirmPassword"',
    ],
    ["http://localhost:3102/en/reset-password", "invalid or expired"],
  ]) {
    const response = await get(url);
    assert.equal(response.status, 200, url);
    const html = await response.text();
    assert.ok(html.includes(marker), `${url}: expected form missing`);
    assert.ok(
      !html.includes('name="sessionId"'),
      `${url}: session must not be editable`,
    );
    console.log("PASS", new URL(url).pathname, response.status);
  }
} finally {
  for (const server of servers) server.kill("SIGTERM");
  await Promise.all(
    servers.map(
      (server) =>
        new Promise((resolve) =>
          server.exitCode !== null ? resolve() : server.once("exit", resolve),
        ),
    ),
  );
}
