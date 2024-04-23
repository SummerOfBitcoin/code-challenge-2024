import { createHash } from 'crypto';


export function bufferEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.byteLength !== b.byteLength) return false;
    let i = a.byteLength;
    while (i--) if (a[i] !== b[i]) return false;
    return true;
}

export function bufferToHex(buffer: Uint8Array): string {
    return Buffer.from(buffer).toString('hex');
}





export function bytesToHex(bytes: Uint8Array): string {
    return Buffer.from(bytes).toString('hex');
}








export function SHA256(buffer: Uint8Array): Buffer {
    return createHash('sha256').update(buffer).digest();
}

export function doubleSHA256(buffer: Uint8Array): Buffer {
    return SHA256(SHA256(buffer));
}

export function hashBuffer(buffer: Uint8Array): bigint {
    return BigInt('0x' + doubleSHA256(buffer).toString('hex'));
}

export function bigIntTo32Buffer(n: bigint): Uint8Array {
    const sub = Buffer.from(n.toString(16), 'hex');
    const buffer = Buffer.alloc(32);
    if (sub.byteLength) sub.copy(buffer, 32 - sub.byteLength);
    return buffer;
}

export function bufferToBigInt(buffer: Uint8Array): bigint {
    return BigInt('0x' + Buffer.from(buffer).toString('hex'));
}



export function uint8ArrayToHexString(uint8Array:Uint8Array) {
    return Array.prototype.map.call(uint8Array, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}



export function getVarIntBuffer(value: number): Buffer {
    if (value < 0xfd) {
      return Buffer.from([value]);
    } else if (value <= 0xffff) {
      return Buffer.from([0xfd, value & 0xff, (value >> 8) & 0xff]);
    } else if (value <= 0xffffffff) {
      return Buffer.from([0xfe, value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff]);
    } else {
      return Buffer.from([0xff, value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff, (value >> 32) & 0xff, (value >> 40) & 0xff, (value >> 48) & 0xff, (value >> 56) & 0xff]);
    }
  }

 export function serializeVarInt(num: number): Buffer {
    if (num < 0xfd) {
      return Buffer.from([num]);
    } else if (num <= 0xffff) {
      const buf = Buffer.allocUnsafe(3);
      buf.writeUInt8(0xfd, 0);
      buf.writeUInt16LE(num, 1);
      return buf;
    } else if (num <= 0xffffffff) {
      const buf = Buffer.allocUnsafe(5);
      buf.writeUInt8(0xfe, 0);
      buf.writeUInt32LE(num, 1);
      return buf;
    } else {
      const buf = Buffer.allocUnsafe(9);
      buf.writeUInt8(0xff, 0);
      buf.writeBigInt64LE(BigInt(num), 1);
      return buf;
    }

  }


export function readInt64LE(buffer: Buffer, offset: number): number {
    const low =
      (buffer[offset] & 0xff) |
      ((buffer[offset + 1] & 0xff) << 8) |
      ((buffer[offset + 2] & 0xff) << 16) |
      ((buffer[offset + 3] & 0xff) << 24);
    const high =
      (buffer[offset + 4] & 0xff) |
      ((buffer[offset + 5] & 0xff) << 8) |
      ((buffer[offset + 6] & 0xff) << 16) |
      ((buffer[offset + 7] & 0xff) << 24);
    return (high << 32) | low;
  }
  
 export  function readUInt64LE(buffer: Buffer, offset: number): number {
    const low =
      (buffer[offset] & 0xff) |
      ((buffer[offset + 1] & 0xff) << 8) |
      ((buffer[offset + 2] & 0xff) << 16) |
      ((buffer[offset + 3] & 0xff) << 24);
    const high =
      (buffer[offset + 4] & 0xff) |
      ((buffer[offset + 5] & 0xff) << 8) |
      ((buffer[offset + 6] & 0xff) << 16) |
      ((buffer[offset + 7] & 0xff) << 24);
    return (high * 0x100000000) + low;
  }



 export function varIntSize(value: number): number {
    if (value < 0xfd) {
      return 1;
    } else if (value <= 0xffff) {
      return 3;
    } else if (value <= 0xffffffff) {
      return 5;
    } else {
      return 9;
    }
  }
  export function deserializeVarInt(buffer: Buffer, offset: number): number {
    const first = buffer[offset++];
    if (first < 0xfd) {
      return first;
    } else if (first === 0xfd) {
      return readUInt16LE(buffer, offset);
    } else if (first === 0xfe) {
      return readUInt32LE(buffer, offset);
    } else {
      return readUInt64LE(buffer, offset);
    }
  }
 export function readUInt16LE(buffer: Buffer, offset: number): number {
    return (buffer[offset] & 0xff) | ((buffer[offset + 1] & 0xff) << 8);
  }
 export function readUInt32LE(buffer: Buffer, offset: number): number {
    return (
      (buffer[offset] & 0xff) |
      ((buffer[offset + 1] & 0xff) << 8) |
      ((buffer[offset + 2] & 0xff) << 16) |
      ((buffer[offset + 3] & 0xff) << 24)
    );
  }

 export function sha256ripemd160(data: Uint8Array): Uint8Array {
    const sha256Hash = createHash("sha256").update(data).digest();
    const ripemd160Hash = createHash("ripemd160")
      .update(sha256Hash)
      .digest();
    return Uint8Array.from(ripemd160Hash);
  }


