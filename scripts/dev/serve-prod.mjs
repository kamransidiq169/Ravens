// Starts the production server for Playwright, building first if there is no build yet.
// Usage: node scripts/dev/serve-prod.mjs [port]
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const port = process.argv[2] ?? "3100";

if (!existsSync(".next/BUILD_ID")) {
  console.log("No production build found — running `pnpm build` first.");
  const build = spawnSync("pnpm", ["build"], { stdio: "inherit" });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

const server = spawn("pnpm", ["start", "-p", port], { stdio: "inherit" });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.kill(signal));
server.on("exit", (code) => process.exit(code ?? 0));
