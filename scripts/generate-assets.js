import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32Checksum(buf) {
  let c = 0 ^ -1;
  for (let n = 0; n < buf.length; n++) {
    c = (c >>> 8) ^ crcTable[(c ^ buf[n]) & 0xff];
  }
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type);
  const crcVal = crc32Checksum(Buffer.concat([typeBuf, data]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPNG(width, height, getPixel) {
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }
  const compressed = zlib.deflateSync(rawData);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ─── Generate App Icons (192, 512, 180, 32) ──────────────────────────────────
function drawIconPixel(x, y, size) {
  const cx = size / 2;
  const cy = size / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Rounded rect container
  const radius = size * 0.22;
  const rx = Math.max(0, Math.abs(x - cx) - (cx - radius));
  const ry = Math.max(0, Math.abs(y - cy) - (cy - radius));
  const cornerDist = Math.sqrt(rx * rx + ry * ry);
  if (cornerDist > radius) {
    return [0, 0, 0, 0]; // Transparent outside rounded corner
  }

  // Dark background #0A0A0A
  let r = 10, g = 10, b = 10, a = 255;

  // Radial neon ambient glow in center
  const glow = Math.max(0, 1 - dist / (size * 0.55));
  r = Math.round(r + 0 * glow);
  g = Math.round(g + 60 * glow);
  b = Math.round(b + 30 * glow);

  // Subtle border #00FF88 at 30%
  if (cornerDist > radius - 2) {
    return [0, 255, 136, 180];
  }

  // Draw code glyphs: < / >
  const nx = (x - cx) / (size * 0.5); // -1 to +1
  const ny = (y - cy) / (size * 0.5); // -1 to +1

  // Left bracket '<' around nx = -0.45
  const dLeft = Math.abs(Math.abs(ny) - ((-nx - 0.25) * 1.5));
  if (nx > -0.65 && nx < -0.2 && dLeft < 0.1) {
    return [0, 255, 136, 255];
  }

  // Slash '/' around center nx = 0
  const dSlash = Math.abs(nx - (-ny * 0.35));
  if (Math.abs(ny) < 0.55 && dSlash < 0.08) {
    return [0, 255, 136, 255];
  }

  // Right bracket '>' around nx = +0.45
  const dRight = Math.abs(Math.abs(ny) - ((nx - 0.25) * 1.5));
  if (nx > 0.2 && nx < 0.65 && dRight < 0.1) {
    return [0, 255, 136, 255];
  }

  return [r, g, b, a];
}

// ─── Generate OG Image (1200 x 630) ──────────────────────────────────────────
function drawOGPixel(x, y) {
  const w = 1200;
  const h = 630;
  const cx = w / 2;
  const cy = h / 2 - 20;

  // Dark gradient background #0A0A0A
  let r = 10, g = 10, b = 10, a = 255;

  // Soft neon green glow in the upper-center
  const dx = x - cx;
  const dy = y - (cy - 40);
  const dist = Math.sqrt(dx * dx + dy * dy);
  const glow = Math.max(0, 1 - dist / 500);
  r = Math.min(255, Math.round(r + 0 * glow));
  g = Math.min(255, Math.round(g + 80 * Math.pow(glow, 2)));
  b = Math.min(255, Math.round(b + 40 * Math.pow(glow, 2)));

  // Grid lines pattern (every 40px, subtle 4% opacity)
  if (x % 40 === 0 || y % 40 === 0) {
    r += 12; g += 16; b += 14;
  }

  // Outer border with neon green glow
  if (x < 3 || x >= w - 3 || y < 3 || y >= h - 3) {
    return [0, 255, 136, 120];
  }

  // Draw logo badge container: center, 560x140
  const bw = 280;
  const bh = 65;
  if (Math.abs(x - cx) < bw && Math.abs(y - cy) < bh) {
    const rx = Math.abs(x - cx) - (bw - 24);
    const ry = Math.abs(y - cy) - (bh - 24);
    const corner = Math.sqrt(Math.max(0, rx) ** 2 + Math.max(0, ry) ** 2);
    if (corner < 24) {
      // Inner badge background
      r = Math.max(r, 18);
      g = Math.max(g, 22);
      b = Math.max(b, 20);

      // Badge border
      if (corner > 22 || (rx > -1 && ry < 0 && Math.abs(y - cy) > bh - 2) || (ry > -1 && rx < 0 && Math.abs(x - cx) > bw - 2)) {
        return [0, 255, 136, 180];
      }
    }
  }

  // Draw logo brackets: < ... />
  // Left Bracket < centered at (cx - 180, cy)
  const lbX = x - (cx - 180);
  const lbY = y - cy;
  if (Math.abs(lbX - Math.abs(lbY) * 0.7) < 5 && lbX > -40 && lbX < 20 && Math.abs(lbY) < 36) {
    return [0, 255, 136, 255];
  }

  // Slash / centered at (cx + 175, cy)
  const slX = x - (cx + 160);
  const slY = y - cy;
  if (Math.abs(slX + slY * 0.35) < 4 && Math.abs(slY) < 36) {
    return [0, 255, 136, 255];
  }

  // Right Bracket > centered at (cx + 200, cy)
  const rbX = x - (cx + 200);
  const rbY = y - cy;
  if (Math.abs(-rbX - Math.abs(rbY) * 0.7) < 5 && rbX > -20 && rbX < 40 && Math.abs(rbY) < 36) {
    return [0, 255, 136, 255];
  }

  // Tagline Bar beneath badge (around cy + 120)
  const tagY = cy + 120;
  if (Math.abs(y - tagY) < 18 && Math.abs(x - cx) < 380) {
    // Subtle pill container
    r = Math.max(r, 17);
    g = Math.max(g, 20);
    b = Math.max(b, 19);
    if (Math.abs(Math.abs(y - tagY) - 17) < 1.5 || Math.abs(Math.abs(x - cx) - 379) < 1.5) {
      return [0, 255, 136, 90];
    }
  }

  // Neon accent dots
  if (Math.abs(y - tagY) < 4 && (Math.abs(x - (cx - 350)) < 4 || Math.abs(x - (cx + 350)) < 4)) {
    return [0, 255, 136, 255];
  }

  return [Math.min(255, r), Math.min(255, g), Math.min(255, b), a];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

console.log('Generating Web App Icons...');
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createPNG(192, 192, (x, y) => drawIconPixel(x, y, 192)));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), createPNG(512, 512, (x, y) => drawIconPixel(x, y, 512)));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, (x, y) => drawIconPixel(x, y, 180)));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(32, 32, (x, y) => drawIconPixel(x, y, 32)));

console.log('Generating 1200x630 Open Graph & Twitter Social Image...');
fs.writeFileSync(path.join(publicDir, 'og-image.png'), createPNG(1200, 630, drawOGPixel));

console.log('All public assets successfully generated!');

