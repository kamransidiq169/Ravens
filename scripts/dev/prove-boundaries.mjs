// Proves the architecture lint rules bite: writes violating imports, expects ESLint to fail, then cleans up.
// Run: node scripts/dev/prove-boundaries.mjs
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const cases = [
  {
    name: "app deep-imports a feature's internals",
    file: "src/app/tmp-violation-app.ts",
    code: 'import { Hero } from "@/features/hero/components/Hero";\nexport const x = Hero;\n',
    expect: ["no-restricted-imports", "boundaries/dependencies"],
  },
  {
    name: "shared layer (components) imports from features",
    file: "src/components/ui/tmp-violation-shared.ts",
    code: 'import { Hero } from "@/features/hero";\nexport const x = Hero;\n',
    expect: ["boundaries/dependencies"],
  },
  {
    name: "feature deep-imports another feature",
    file: "src/features/about/tmp-violation-feature.ts",
    // Relative path: only the boundaries rule can see through it (no-restricted-imports matches alias paths).
    code: 'import { ProjectCard } from "../work/components/ProjectCard";\nexport const x = ProjectCard;\n',
    expect: ["boundaries/dependencies"],
  },
  {
    name: "app imports content directly",
    file: "src/app/tmp-violation-content.ts",
    code: 'import { projects } from "@/content/projects";\nexport const x = projects;\n',
    expect: ["boundaries/dependencies"],
  },
];

let failed = false;
for (const { name, file, code, expect } of cases) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, code);
  try {
    const result = spawnSync("pnpm", ["exec", "eslint", "--no-warn-ignored", "--format", "json", file], {
      encoding: "utf8",
    });
    const messages = JSON.parse(result.stdout || "[]").flatMap((report) => report.messages);
    const rules = new Set(messages.map((message) => message.ruleId));
    const caught = result.status !== 0 && expect.every((rule) => rules.has(rule));
    console.log(`${caught ? "✓" : "✗"} ${name} → ${[...rules].join(", ") || "no lint errors"}`);
    if (!caught) failed = true;
  } finally {
    rmSync(file, { force: true });
  }
}
process.exit(failed ? 1 : 0);
