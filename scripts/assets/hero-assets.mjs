// Converts assets-src/hero/* into responsive AVIF/WebP + an LQIP, plus public/hero/manifest.json.
// Run: pnpm assets:hero
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const SRC = fileURLToPath(new URL("../../assets-src/hero/", import.meta.url));
const OUT = fileURLToPath(new URL("../../public/hero/", import.meta.url));
const WIDTHS = [1280, 1920, 2560, 3840];
const FORMATS = /** @type {const} */ (["avif", "webp"]);
const INPUT = new Set([".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff", ".avif"]);

const files = (await readdir(SRC)).filter((file) => INPUT.has(extname(file).toLowerCase())).sort();
await mkdir(OUT, { recursive: true });

// Only generated files live in public/hero; clear stale ones so renames don't leave orphans.
for (const entry of await readdir(OUT)) {
  if (entry !== ".gitkeep") await rm(join(OUT, entry), { recursive: true, force: true });
}

const manifest = {};
for (const file of files) {
  const name = basename(file, extname(file));
  const image = sharp(join(SRC, file)).rotate();
  const { width: sourceWidth = 0, height: sourceHeight = 0 } = await image.metadata();

  // Never upscale: emit the widths the source can supply, or its native width if smaller than all.
  const widths = WIDTHS.filter((w) => w <= sourceWidth);
  if (widths.length === 0) widths.push(sourceWidth);

  const sources = [];
  for (const width of widths) {
    for (const format of FORMATS) {
      const outName = `${name}-${width}.${format}`;
      const pipeline = image.clone().resize({ width, withoutEnlargement: true });
      await (format === "avif" ? pipeline.avif({ quality: 60, effort: 4 }) : pipeline.webp({ quality: 80 })).toFile(
        join(OUT, outName),
      );
      sources.push({ width, format, src: `/hero/${outName}` });
    }
  }

  const lqip = await image.clone().resize({ width: 24 }).blur(1).webp({ quality: 40 }).toBuffer();
  manifest[name] = {
    width: sourceWidth,
    height: sourceHeight,
    lqip: `data:image/webp;base64,${lqip.toString("base64")}`,
    sources,
  };
  console.log(`✓ ${file} → ${sources.length} files`);
}

await writeFile(join(OUT, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  files.length === 0
    ? "No source art in assets-src/hero — wrote an empty manifest."
    : `Wrote manifest for ${files.length} asset(s).`,
);
