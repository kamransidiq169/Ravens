import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

/**
 * Layer map — see docs/architecture/ARCHITECTURE.md.
 *   app → features → components / webgl / hooks / lib / styles / content / config / types
 * Shared layers never import from features; features reach each other only via index.ts.
 */
const SHARED_LAYERS = ["components", "webgl", "hooks", "lib", "styles", "content", "config", "types"];

const elements = [
  { type: "app", pattern: "src/app" },
  { type: "feature", pattern: "src/features/*", capture: ["feature"] },
  ...SHARED_LAYERS.map((type) => ({ type, pattern: `src/${type}` })),
];

const allowTo = (types) => ({ element: { type: types } });

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "boundaries/elements": elements,
      "import/resolver": {
        typescript: { alwaysTryTypes: true, project: "./tsconfig.json" },
        node: true,
      },
    },
    rules: {
      "boundaries/dependencies": [
        2,
        {
          default: "disallow",
          message:
            "{{from.element.types.[0]}} must not import {{to.element.types.[0]}} (see docs/architecture/ARCHITECTURE.md)",
          policies: [
            // Anything may import files inside its own element.
            { allow: { dependency: { relationship: { to: "internal" } } } },
            // app: features (index only) + components, config, styles, lib.
            {
              from: { element: { type: "app" } },
              allow: [
                { to: allowTo(["components", "config", "styles", "lib"]) },
                { to: { element: { type: "feature", fileInternalPath: "index.ts" } } },
              ],
            },
            // features: other features (index only) + every shared layer.
            {
              from: { element: { type: "feature" } },
              allow: [
                { to: allowTo(["components", "webgl", "hooks", "lib", "styles", "content", "config", "types"]) },
                { to: { element: { type: "feature", fileInternalPath: "index.ts" } } },
              ],
            },
            // Shared layers: strictly downward, never features/app.
            {
              from: { element: { type: "components" } },
              allow: { to: allowTo(["hooks", "lib", "styles", "config", "types"]) },
            },
            { from: { element: { type: "webgl" } }, allow: { to: allowTo(["hooks", "lib", "config", "types"]) } },
            { from: { element: { type: "hooks" } }, allow: { to: allowTo(["lib", "config", "types"]) } },
            { from: { element: { type: "lib" } }, allow: { to: allowTo(["config", "types"]) } },
            { from: { element: { type: "content" } }, allow: { to: allowTo(["types"]) } },
            { from: { element: { type: "config" } }, allow: { to: allowTo(["types"]) } },
          ],
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/*", "**/features/*/*"],
              message: "Import features through their public API only: '@/features/<name>'.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx,mjs}"],
    rules: {
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          pathGroups: [
            { pattern: "react", group: "builtin", position: "before" },
            { pattern: "next/**", group: "builtin", position: "before" },
            ...["app", "features", "components", "webgl", "hooks", "content", "lib", "config", "styles", "types"].map(
              (layer) => ({ pattern: `@/${layer}/**`, group: "internal", position: "before" }),
            ),
          ],
          pathGroupsExcludedImportTypes: ["builtin", "external", "object"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "public/**",
  ]),
]);

export default eslintConfig;
