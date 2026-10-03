// Generates favicon.svg, PNG icons and favicon.ico into public/ from the Λ mark. Run: pnpm assets:icons
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const out = (name) => fileURLToPath(new URL(`../../public/${name}`, import.meta.url));
const BG = "#C8D1EC";
const INK = "#0B0D14";

const mark = (
  size,
  inset,
) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="${BG}"/>
  <path d="M${inset} ${64 - inset} L32 ${inset} L${64 - inset} ${64 - inset}" fill="none" stroke="${INK}" stroke-width="3.2"/>
</svg>`;

await writeFile(out("favicon.svg"), mark(64, 14));
for (const [name, size, inset] of [
  ["icon-192.png", 192, 14],
  ["icon-512.png", 512, 14],
  ["apple-touch-icon.png", 180, 14],
]) {
  await sharp(Buffer.from(mark(size, inset)))
    .png()
    .toFile(out(name));
}

// ICO container holding a single 32×32 PNG image.
const png = await sharp(Buffer.from(mark(32, 6)))
  .png()
  .toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // image count
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt16LE(1, 10); // colour planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(22, 18); // data offset
await writeFile(out("favicon.ico"), Buffer.concat([header, png]));
