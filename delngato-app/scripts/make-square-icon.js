#!/usr/bin/env node
/* eslint-disable */
// One-shot generator for a square placeholder app icon (olive, 1024x1024).
// The canonical icon master is a Phase 2+ design deliverable per brand README;
// this exists only so expo-doctor and the Android adaptive-icon pipeline
// receive a valid square asset. Run: `node scripts/make-square-icon.js`.

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const SIZE = 1024;
// Brand canvas olive — keep in sync with shared/theme/tokens.ts → colors.olive
const R = 0x1f;
const G = 0x4a;
const B = 0x3d;

function crc32(buf) {
  let c;
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (crc ^ buf[i]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8;   // bit depth
ihdr[9] = 2;   // color type RGB
ihdr[10] = 0;  // compression
ihdr[11] = 0;  // filter
ihdr[12] = 0;  // interlace

const rowBytes = 1 + SIZE * 3;
const raw = Buffer.alloc(SIZE * rowBytes);
for (let y = 0; y < SIZE; y++) {
  const o = y * rowBytes;
  raw[o] = 0; // filter: None
  for (let x = 0; x < SIZE; x++) {
    const p = o + 1 + x * 3;
    raw[p] = R;
    raw[p + 1] = G;
    raw[p + 2] = B;
  }
}
const idat = zlib.deflateSync(raw);

const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const png = Buffer.concat([
  signature,
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0)),
]);

const outDir = path.join(__dirname, '..', 'assets', 'images');
const iconPath = path.join(outDir, 'icon.png');
const adaptivePath = path.join(outDir, 'adaptive-icon.png');
fs.writeFileSync(iconPath, png);
fs.writeFileSync(adaptivePath, png);
console.log(`Wrote ${SIZE}x${SIZE} olive PNG to:`);
console.log(`  ${iconPath}`);
console.log(`  ${adaptivePath}`);
