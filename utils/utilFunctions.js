const crypto = require('crypto');

// utils functions:
function reversedBytes(bytes) {
    const reversed = Buffer.alloc(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
        reversed[i] = bytes[bytes.length - 1 - i];
    }
    return [...reversed];
}

function uint16ToBytes(n) {
    const bytes = Buffer.alloc(2);
    bytes.writeUInt16LE(Number(n) & 0xffff, 0); // Convert n to a number explicitly
    return [...bytes];
}

function uint32ToBytes(n) {
    const bytes = Buffer.alloc(4);
    bytes.writeUInt32LE(Number(n) & 0xffffffff, 0); // Mask with 0xffffffff to ensure it fits within 32 bits
    return [...bytes];
}

function uint64ToBytes(n) {
    const lower = n & 0xffffffff; // Mask the lower 32 bits
    const upper = (n - lower) / 2 ** 32; // Get the upper 32 bits
    const bytes = Buffer.alloc(8);
    bytes.writeUInt32LE(lower, 0); // Write lower 32 bits
    bytes.writeUInt32LE(upper, 4); // Write upper 32 bits
    return [...bytes];
}

function singleSHA256(data) {
    const buffer = Buffer.from(data, 'hex');
    const hash = crypto.createHash('sha256').update(buffer).digest();
    return hash.toString('hex');
}

function doubleSHA256(data) {
    const buffer = Buffer.from(data, 'hex');
    const hash1 = crypto.createHash('sha256').update(buffer).digest();
    const hash2 = crypto.createHash('sha256').update(hash1).digest();
    return hash2.toString('hex');
}

function reverseHex(hexString) {
    let result = '';
    for (let i = hexString.length - 2; i >= 0; i -= 2) {
        result += hexString.substr(i, 2);
    }
    return result;
}

function serializeVarInt(n) {
    if (n < 0xfd) {
        return [n];
    } else if (n <= 0xffff) {
        return [0xfd, ...uint16ToBytes(n)];
    } else if (n <= 0xffffffff) {
        return [0xfe, ...uint32ToBytes(n)];
    } else {
        return [0xff, ...uint64ToBytes(n)];
    }
}

// export all the above functions 
module.exports = {
    reversedBytes,
    uint16ToBytes,
    uint32ToBytes,
    uint64ToBytes,
    singleSHA256,
    doubleSHA256,
    reverseHex,
    serializeVarInt
};
