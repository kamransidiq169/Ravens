// Pixel-diff two images (e.g. a build screenshot vs a mockup in docs/design/reference).
// Usage: node scripts/qa/compare-images.mjs <actual.png> <expected.png> [diff-out.png] [max-ratio=0.02]
import { writeFile } from "node:fs/promises";

import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import sharp from "sharp";

const [actualPath, expectedPath, diffPath = "tmp-diff.png", maxRatio = "0.02"] = process.argv.slice(2);
if (!actualPath || !expectedPath) {
  console.error("Usage: compare-images.mjs <actual.png> <expected.png> [diff-out.png] [max-ratio]");
  process.exit(2);
}

const expected = await sharp(expectedPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = expected.info;
// Normalise the actual image to the expected dimensions so mockups of any scale can be compared.
const actual = await sharp(actualPath).resize(width, height, { fit: "fill" }).ensureAlpha().raw().toBuffer();

const diff = new PNG({ width, height });
const mismatched = pixelmatch(actual, expected.data, diff.data, width, height, { threshold: 0.1 });
await writeFile(diffPath, PNG.sync.write(diff));

const ratio = mismatched / (width * height);
console.log(`${mismatched} px differ (${(ratio * 100).toFixed(2)}%) → ${diffPath}`);
process.exit(ratio > Number(maxRatio) ? 1 : 0);
