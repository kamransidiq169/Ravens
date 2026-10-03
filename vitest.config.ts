import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const layers = ["app", "features", "components", "webgl", "hooks", "content", "styles", "lib", "config", "types"];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: Object.fromEntries(
      layers.map((layer) => [`@/${layer}`, fileURLToPath(new URL(`./src/${layer}`, import.meta.url))]),
    ),
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./tests/unit/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    css: false,
  },
});
