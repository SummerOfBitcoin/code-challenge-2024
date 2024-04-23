"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calualateMerkleRoot = void 0;
const crypto_1 = require("crypto");
function hash256(hex) {
    const hash1 = (0, crypto_1.createHash)('sha256').update(Buffer.from(hex, 'hex')).digest();
    const hash2 = (0, crypto_1.createHash)('sha256').update(hash1).digest();
    return hash2.toString('hex');
}
function calualateMerkleRoot(txids) {
    if (txids.length === 1) {
        return txids[0];
    }
    const result = [];
    for (let i = 0; i < txids.length; i += 2) {
        const concat = txids[i] + (txids[i + 1] || txids[i]);
        result.push(hash256(concat));
    }
    return calualateMerkleRoot(result);
}
exports.calualateMerkleRoot = calualateMerkleRoot;
