// Verifies no route ships three.js in its initial JS, and that three.js is still code-split into *some* chunk.
// Run after `pnpm build`:  node scripts/qa/check-initial-js.mjs
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const NEXT_DIR = ".next";
const MARKER = "THREE.WebGLRenderer"; // appears in three's runtime warnings, survives minification

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

const read = (path) => readFile(path, "utf8");

const staticChunks = [];
for await (const file of walk(join(NEXT_DIR, "static"))) if (file.endsWith(".js")) staticChunks.push(file);

const chunksWithThree = new Set();
for (const chunk of staticChunks) if ((await read(chunk)).includes(MARKER)) chunksWithThree.add(chunk);

const failures = [];
let routes = 0;
for await (const file of walk(join(NEXT_DIR, "server", "app"))) {
  if (!file.endsWith(".html")) continue;
  routes += 1;
  const html = await read(file);
  const scripts = [...html.matchAll(/\/_next\/(static\/[^"'\s?]+\.js)/g)].map((m) => join(NEXT_DIR, m[1]));
  for (const script of new Set(scripts)) {
    if (chunksWithThree.has(script)) failures.push(`${relative(join(NEXT_DIR, "server", "app"), file)} → ${script}`);
  }
}

if (chunksWithThree.size === 0) {
  console.error("✗ three.js was not found in any chunk — the marker or the code-splitting changed.");
  process.exit(1);
}
if (failures.length > 0) {
  console.error("✗ three.js found in initial JS of:\n  " + failures.join("\n  "));
  process.exit(1);
}
console.log(`✓ ${routes} prerendered routes checked; three.js lives only in ${chunksWithThree.size} lazy chunk(s).`);
