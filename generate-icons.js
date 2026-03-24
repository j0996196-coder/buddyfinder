// generate-icons.js — Run with Node.js to generate all PWA icons
// Usage: node generate-icons.js
// Requires: npm install canvas

const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outDir = path.join(__dirname, "icons");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

sizes.forEach((size) => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#0d0d0d";
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  // Accent circle
  ctx.fillStyle = "#c8f55a";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Running emoji (text)
  ctx.font = `${size * 0.38}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🏃", size / 2, size / 2 + size * 0.02);

  const buf = canvas.toBuffer("image/png");
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), buf);
  console.log(`✅ Generated icon-${size}.png`);
});

console.log("🎉 All icons generated!");
