#!/usr/bin/env node
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "../public");
const logoPath = resolve(publicDir, "logo.png");

const BRAND_BG = "#ffffff";
const BRAND_PINK = "#e91e63";

async function makeFavicon(size, outName, pad = 0.12) {
  const inner = Math.round(size * (1 - pad * 2));
  const logo = await sharp(logoPath)
    .resize({ width: inner, height: inner, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BRAND_BG,
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(resolve(publicDir, outName));
  console.log(`✓ ${outName} (${size}x${size})`);
}

async function makeMaskableIcon(size, outName) {
  // Maskable icons need extra safe-area padding (20%)
  const inner = Math.round(size * 0.6);
  const logo = await sharp(logoPath)
    .resize({ width: inner, height: inner, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BRAND_PINK,
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(resolve(publicDir, outName));
  console.log(`✓ ${outName} (${size}x${size}, maskable)`);
}

async function makeOgImage() {
  const W = 1200;
  const H = 630;

  const logoBuf = await sharp(logoPath)
    .resize({ width: 360, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#fff0f5"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#e91e63"/>
      <stop offset="100%" stop-color="#ff6090"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="1050" cy="140" r="200" fill="#e91e63" fill-opacity="0.12"/>
  <circle cx="150" cy="520" r="160" fill="#e91e63" fill-opacity="0.10"/>
  <circle cx="1050" cy="140" r="90" fill="none" stroke="#e91e63" stroke-opacity="0.25" stroke-width="2" stroke-dasharray="6,8"/>
  <text x="80" y="360" font-family="Helvetica, Arial, sans-serif" font-size="56" font-weight="800" fill="#1a1a1a">
    Buat &amp; Kelola Undangan
  </text>
  <text x="80" y="430" font-family="Helvetica, Arial, sans-serif" font-size="56" font-weight="800" fill="url(#accent)">
    RSVP Online dengan Cepat
  </text>
  <text x="80" y="490" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="#555">
    Kustomisasi · QR Code · Pantauan Realtime
  </text>
  <rect x="80" y="540" width="260" height="56" rx="28" fill="url(#accent)"/>
  <text x="210" y="576" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="700" fill="#ffffff" text-anchor="middle">
    Mulai Sekarang →
  </text>
</svg>`.trim();

  await sharp(Buffer.from(svg))
    .composite([{ input: logoBuf, top: 70, left: 80 }])
    .png({ quality: 92 })
    .toFile(resolve(publicDir, "og-image.png"));
  console.log("✓ og-image.png (1200x630)");
}

async function main() {
  await makeFavicon(16, "favicon-16x16.png");
  await makeFavicon(32, "favicon-32x32.png");
  await makeFavicon(180, "apple-touch-icon.png", 0.08);
  await makeFavicon(192, "android-chrome-192x192.png", 0.1);
  await makeFavicon(512, "android-chrome-512x512.png", 0.1);
  await makeMaskableIcon(512, "maskable-512x512.png");
  await makeOgImage();
  console.log("\nAll assets regenerated in public/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
