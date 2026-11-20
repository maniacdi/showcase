/**
 * One-off: render the PWA icons into public/icons/ from the app mark
 * (same drawing as src/app/icon.svg and src/app/apple-icon.tsx).
 *
 *   node scripts/generate-pwa-icons.mjs
 *
 * Colours are read from src/lib/ogTokens.ts so a re-skin only edits tokens.
 * Uses `sharp`, which Next.js already installs (no new dependency).
 */
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "public", "icons");

const tokensSrc = await readFile(path.join(root, "src", "lib", "ogTokens.ts"), "utf8");
const token = (name) => {
  const m = new RegExp(`\\b${name}:\\s*"(#[0-9a-fA-F]{3,8})"`).exec(tokensSrc);
  if (!m) throw new Error(`Token ${name} not found in ogTokens.ts`);
  return m[1];
};
const ink = token("ink");
const paper = token("paper");
const accent = token("accent");

/** The mark on a 32-unit canvas. `pad` shrinks it towards the centre. */
function svg({ size, rounded, scale }) {
  const k = scale; // mark scale inside the 32x32 box
  const off = (32 - 32 * k) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="${rounded ? 6 : 0}" fill="${ink}"/>
  <g transform="translate(${off} ${off}) scale(${k})">
    <rect x="7" y="7" width="18" height="18" fill="none" stroke="${paper}" stroke-width="2.4"/>
    <path d="M8.2 23.8 L23.8 8.2 L23.8 23.8 Z" fill="${accent}"/>
  </g>
</svg>`;
}

const targets = [
  { file: "icon-192.png", size: 192, rounded: true, scale: 1 },
  { file: "icon-512.png", size: 512, rounded: true, scale: 1 },
  // Maskable: full-bleed background, mark inside the 80% safe zone.
  { file: "icon-maskable-192.png", size: 192, rounded: false, scale: 0.72 },
  { file: "icon-maskable-512.png", size: 512, rounded: false, scale: 0.72 },
];

await mkdir(out, { recursive: true });
for (const t of targets) {
  await sharp(Buffer.from(svg(t)), { density: 72 * (t.size / 32) })
    .resize(t.size, t.size)
    .png({ compressionLevel: 9 })
    .toFile(path.join(out, t.file));
  console.log(`public/icons/${t.file}`);
}
