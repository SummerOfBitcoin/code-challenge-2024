"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calualateMerkleRoot = void 0;
const crypto_1 = __importDefault(require("crypto"));
function reverseHex(hex) {
    var _a, _b;
    return (_b = (_a = hex.match(/.{2}/g)) === null || _a === void 0 ? void 0 : _a.reverse().join('')) !== null && _b !== void 0 ? _b : '';
}
function hash256(hex) {
    const binary = Buffer.from(hex, 'hex');
    const hash1 = crypto_1.default.createHash('sha256').update(binary).digest();
    const hash2 = crypto_1.default.createHash('sha256').update(hash1).digest();
    return hash2.toString('hex');
}
function calualateMerkleRoot(txids) {
    // console.log(txids.length,txids)
    if (txids.length === 0) {
        throw new Error('Transaction IDs array cannot be empty');
    }
    const reversedTxids = txids.map(reverseHex);
    let tree = txids.slice();
    while (tree.length > 1) {
        const newTree = [];
        for (let i = 0; i < tree.length; i += 2) {
            const left = tree[i];
            const right = i + 1 < tree.length ? tree[i + 1] : left;
            const concat = left + right;
            const hash = hash256(concat);
            newTree.push(hash);
        }
        tree = newTree;
    }
    const merkleRoot = reverseHex(tree[0]);
    return merkleRoot;
}
exports.calualateMerkleRoot = calualateMerkleRoot;
