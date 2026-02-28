const zlib = require('zlib')
const fs = require('fs')
const path = require('path')

const SIZE = 400

function createPNG(width, height, pixelGenerator) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR chunk
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 6  // color type: RGBA
  ihdr[10] = 0 // compression
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // interlace

  // Raw pixel data with filter bytes
  const rawData = Buffer.alloc(height * (1 + width * 4))
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4)
    rawData[rowOffset] = 0 // no filter
    for (let x = 0; x < width; x++) {
      const pixOffset = rowOffset + 1 + x * 4
      const [r, g, b, a] = pixelGenerator(x, y)
      rawData[pixOffset] = r
      rawData[pixOffset + 1] = g
      rawData[pixOffset + 2] = b
      rawData[pixOffset + 3] = a
    }
  }

  const compressed = zlib.deflateSync(rawData)

  function makeChunk(type, data) {
    const typeBuffer = Buffer.from(type)
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length, 0)
    const combined = Buffer.concat([typeBuffer, data])
    const crc = crc32(combined)
    const crcBuf = Buffer.alloc(4)
    crcBuf.writeUInt32BE(crc >>> 0, 0)
    return Buffer.concat([len, combined, crcBuf])
  }

  const iend = Buffer.alloc(0)

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', iend),
  ])
}

// CRC32 implementation
function crc32(buf) {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

const outDir = path.join(__dirname, '..', 'src', 'assets')

// Light noise: ~50% white pixels on transparent
const lightPng = createPNG(SIZE, SIZE, () => {
  return Math.random() < 0.5 ? [255, 255, 255, 255] : [0, 0, 0, 0]
})

// Dark noise: ~50% black pixels on transparent
const darkPng = createPNG(SIZE, SIZE, () => {
  return Math.random() < 0.5 ? [0, 0, 0, 255] : [0, 0, 0, 0]
})

const lightPath = path.join(outDir, 'noise-light.png')
const darkPath = path.join(outDir, 'noise-dark.png')

fs.writeFileSync(lightPath, lightPng)
fs.writeFileSync(darkPath, darkPng)

console.log(`Generated ${lightPath} (${fs.statSync(lightPath).size} bytes)`)
console.log(`Generated ${darkPath} (${fs.statSync(darkPath).size} bytes)`)
