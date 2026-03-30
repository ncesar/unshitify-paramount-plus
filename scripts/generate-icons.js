/**
 * Generates minimal PNG icon files for the extension.
 * Produces solid blue squares at 16x16, 48x48, and 128x128.
 * Run with: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Minimal PNG writer — no dependencies required
function createPNG(size, r, g, b) {
  const { deflateSync } = require('zlib');

  const width = size;
  const height = size;

  // Raw image data: each row prefixed with filter byte 0 (None)
  const rowSize = width * 3; // RGB, no alpha
  const raw = Buffer.alloc((rowSize + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (rowSize + 1)] = 0; // filter type None
    for (let x = 0; x < width; x++) {
      const offset = y * (rowSize + 1) + 1 + x * 3;
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
    }
  }

  const compressed = deflateSync(raw);

  function crc32(buf) {
    const table = crc32.table || (crc32.table = (() => {
      const t = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        t[i] = c;
      }
      return t;
    })());
    let crc = 0xffffffff;
    for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const typeBytes = Buffer.from(type, 'ascii');
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const crcInput = Buffer.concat([typeBytes, data]);
    const crcVal = Buffer.alloc(4);
    crcVal.writeUInt32BE(crc32(crcInput));
    return Buffer.concat([len, typeBytes, data, crcVal]);
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type: RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdrData),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const iconsDir = path.join(__dirname, '..', 'icons');

// Blue color matching Paramount+ brand palette
const COLOR = { r: 0x00, g: 0x40, b: 0xc8 };

for (const size of [16, 48, 128]) {
  const png = createPNG(size, COLOR.r, COLOR.g, COLOR.b);
  const outPath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`Created ${outPath} (${size}x${size})`);
}
