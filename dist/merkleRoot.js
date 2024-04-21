"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructMerkleTree = void 0;
const crypto_1 = require("crypto");
function doubleHash(data) {
    return (0, crypto_1.createHash)("sha256")
        .update((0, crypto_1.createHash)("sha256").update(data).digest())
        .digest();
}
function constructMerkleTree(txids) {
    let leaves = txids.map((txid) => Buffer.from(txid, "hex"));
    while (leaves.length > 1) {
        const currentLevel = [];
        for (let i = 0; i < leaves.length; i += 2) {
            const left = leaves[i];
            const right = i + 1 < leaves.length ? leaves[i + 1] : left; // If there's no right element, use left again
            const combined = Buffer.concat([left, right]);
            currentLevel.push(doubleHash(combined));
        }
        leaves = currentLevel;
    }
    return leaves[0]; // The last remaining hash is the Merkle root
}
exports.constructMerkleTree = constructMerkleTree;
