/**
 * Simple binary writer helper
 */
class BinaryWriter {
  private parts: (Uint8Array | ArrayBuffer)[] = [];
  private size = 0;

  writeUint8(val: number) {
    this.parts.push(new Uint8Array([val]));
    this.size += 1;
  }

  writeUint16(val: number) {
    // Little Endian
    const buf = new Uint8Array(2);
    new DataView(buf.buffer).setUint16(0, val, true);
    this.parts.push(buf);
    this.size += 2;
  }

  writeUint32(val: number) {
    // Little Endian
    const buf = new Uint8Array(4);
    new DataView(buf.buffer).setUint32(0, val, true);
    this.parts.push(buf);
    this.size += 4;
  }

  writeUint32BE(val: number) {
    // Big Endian (for ICNS)
    const buf = new Uint8Array(4);
    new DataView(buf.buffer).setUint32(0, val, false);
    this.parts.push(buf);
    this.size += 4;
  }

  // Write a string as ASCII bytes
  writeString(str: string) {
    const buf = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      buf[i] = str.charCodeAt(i);
    }
    this.parts.push(buf);
    this.size += str.length;
  }

  writeBytes(bytes: Uint8Array | ArrayBuffer) {
    this.parts.push(bytes);
    this.size += bytes.byteLength;
  }

  getBlob(type: string) {
    return new Blob(this.parts as BlobPart[], { type });
  }

  getSize() {
    return this.size;
  }
}

/**
 * Generate an ICO file from multiple PNG sizing blobs
 * @param images Array of { width, height, data }
 */
export async function generateICO(images: { width: number; height: number; data: Blob }[]) {
  const writer = new BinaryWriter();

  // Header
  writer.writeUint16(0); // Reserved
  writer.writeUint16(1); // Type (1 = ICO)
  writer.writeUint16(images.length); // Count

  let offset = 6 + images.length * 16;

  // Directory entries
  for (const img of images) {
    const size = img.data.size;
    const w = img.width >= 256 ? 0 : img.width;
    const h = img.height >= 256 ? 0 : img.height;

    writer.writeUint8(w);
    writer.writeUint8(h);
    writer.writeUint8(0); // Pattern count (0 if no palette)
    writer.writeUint8(0); // Reserved
    writer.writeUint16(1); // Color planes
    writer.writeUint16(32); // Bit depth
    writer.writeUint32(size);
    writer.writeUint32(offset);

    offset += size;
  }

  // Image data
  for (const img of images) {
    const buffer = await img.data.arrayBuffer();
    writer.writeBytes(buffer);
  }

  return writer.getBlob('image/x-icon');
}

/**
 * Generate an ICNS file from multiple PNG sizing blobs
 * Based on Apple ICNS spec. Modern macOS supports PNGs inside ICNS.
 */
export async function generateICNS(images: { width: number; height: number; data: Blob }[]) {
  const writer = new BinaryWriter();

  // Magic
  writer.writeString('icns');

  // Total size placeholder (will update later)
  writer.writeUint32BE(0);

  // Image types mapping based on Wikipedia (Apple Icon Image format)
  // Targeting Mac OS X 10.7+ which supports PNG for all these sizes.
  const typeMap: Record<number, string> = {
    16: 'icp4', // 16x16
    32: 'icp5', // 32x32
    64: 'icp6', // 64x64
    128: 'ic07', // 128x128
    256: 'ic08', // 256x256
    512: 'ic09', // 512x512
    1024: 'ic10', // 1024x1024
  };

  for (const img of images) {
    const type = typeMap[img.width];

    if (type) {
      const buffer = await img.data.arrayBuffer();
      const size = buffer.byteLength + 8; // 4 bytes type + 4 bytes content size

      writer.writeString(type);
      writer.writeUint32BE(size);
      writer.writeBytes(buffer);
    }
  }

  // Fix total size
  const totalSize = writer.getSize();
  const buffer = await writer.getBlob('image/x-icns').arrayBuffer();
  const view = new DataView(buffer);
  view.setUint32(4, totalSize, false); // Update size at offset 4

  return new Blob([buffer], { type: 'image/x-icns' });
}
