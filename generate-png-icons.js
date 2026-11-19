/**
 * GENERATE VALID PNG ICONS (Zero external dependencies, pure Node.js stdlib zlib + crc32)
 */

import fs from 'node:fs';
import zlib from 'node:zlib';

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCrcTable();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function generatePng(size) {
  // Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw Scanlines: size rows, each row has 1 filter byte (0) + size * 4 bytes RGBA
  const rowSize = 1 + size * 4;
  const rawData = Buffer.alloc(size * rowSize);

  const radius = size * 0.22;
  const center = size / 2;

  for (let y = 0; y < size; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // filter type None

    for (let x = 0; x < size; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Rounded rect background check
      const cornerR = size * 0.2;
      let inCorner = false;
      let dist = 0;
      if (x < cornerR && y < cornerR) dist = Math.hypot(x - cornerR, y - cornerR);
      else if (x > size - cornerR && y < cornerR) dist = Math.hypot(x - (size - cornerR), y - cornerR);
      else if (x < cornerR && y > size - cornerR) dist = Math.hypot(x - cornerR, y - (size - cornerR));
      else if (x > size - cornerR && y > size - cornerR) dist = Math.hypot(x - (size - cornerR), y - (size - cornerR));

      if (dist > cornerR) {
        // Transparent outside rounded corner
        rawData[pixelOffset] = 0;
        rawData[pixelOffset + 1] = 0;
        rawData[pixelOffset + 2] = 0;
        rawData[pixelOffset + 3] = 0;
        continue;
      }

      // Emerald Gradient Background (#10B981 to #064E3B)
      const gradRatio = (x + y) / (size * 2);
      let r = Math.round(16 + (6 - 16) * gradRatio);
      let g = Math.round(185 + (78 - 185) * gradRatio);
      let b = Math.round(129 + (59 - 129) * gradRatio);
      let a = 255;

      // Draw white geometric emblem in center
      const dx = Math.abs(x - center);
      const dy = Math.abs(y - center);
      const distCenter = Math.hypot(dx, dy);

      // Simple elegant diamond/portal emblem
      const dRatio = (dx + dy) / (size * 0.35);
      if (dRatio > 0.85 && dRatio < 1.05) {
        r = 255; g = 255; b = 255;
      } else if (distCenter < size * 0.1) {
        r = 255; g = 255; b = 255;
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate 192x192 & 512x512
const png192 = generatePng(192);
fs.writeFileSync('assets/icons/icon-192.png', png192);
console.log('✅ assets/icons/icon-192.png generated (' + png192.length + ' bytes)');

const png512 = generatePng(512);
fs.writeFileSync('assets/icons/icon-512.png', png512);
console.log('✅ assets/icons/icon-512.png generated (' + png512.length + ' bytes)');
