"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Block = exports.BLOCK_SUBSIDY = exports.EMPTY_SCRIPT = exports.BLOCK_VERSION = exports.BTC = void 0;
const buffer_1 = require("./buffer");
const merkleRoot_1 = require("./merkleRoot");
const transaction_1 = require("./transaction");
const utils_1 = require("./utils");
exports.BTC = 100000000; // Number of blocks before a coinbase transaction can be spent
exports.BLOCK_VERSION = 4; // Current Bitcoin block version
exports.EMPTY_SCRIPT = new Uint8Array([0x00]);
exports.BLOCK_SUBSIDY = 6.25; // Empty script
class Block {
    constructor(previousHash, transaction, bits = BigInt(0x1f00fff)) {
        this.transactions = []; // List of transactions included in the block
        this.hash = '';
        this.version = exports.BLOCK_VERSION;
        this.previousHash = previousHash;
        this.timestamp = Math.ceil(Date.now() / 1000);
        this.nonce = 0;
        this.bits = bits;
        this.txCount = transaction.length;
        this.transactions = transaction;
        this.totalfees = this.calculateblockFees(transaction);
        this.merkleRoot = this.getmerkleRoot(transaction);
    }
    get difficulty() {
        return ((this.bits & BigInt(0x00ffffff)) * BigInt(2) ** (BigInt(8) * ((this.bits >> BigInt(24)) - BigInt(3))));
    }
    calculateHash() {
        const headerHex = this.headerBuffer();
        return (0, utils_1.doubleSHA256)(headerHex);
    }
    headerBuffer() {
        const buffer = Buffer.allocUnsafe(80);
        const writer = new buffer_1.BitcoinWriter(buffer);
        writer.writeUint32(this.version);
        writer.writeBuffer(Buffer.from(this.previousHash, 'hex').reverse());
        writer.writeBuffer(Buffer.from(this.merkleRoot, "hex").reverse());
        writer.writeUint32(this.timestamp);
        writer.writeUint32(Number(this.bits));
        writer.writeUint32(this.nonce);
        console.log(buffer.toString('hex'));
        return buffer;
    }
    createTransaction(tx) {
        const transaction = new transaction_1.Transaction(tx);
        this.addTransaction(transaction.getTx());
        return transaction;
    }
    calculateblockFees(transaction) {
        let totalFee = 0;
        for (const tx of transaction) {
            totalFee += tx.fee;
        }
        console.log("TotalFee", totalFee);
        return totalFee;
    }
    addTransaction(transaction) {
        this.transactions.push(transaction);
        this.txCount = this.transactions.length;
        this.merkleRoot = this.getmerkleRoot(this.transactions);
        return this.txCount;
    }
    addCoinbaseTransaction(tx) {
        tx.vout[0].value += this.totalfees;
        tx.vout[1].scriptpubkey = `6a24aa21a9ed${this.getwtxidCommitment().toString("hex")}`;
        console.log("Coinbase", tx.getTxId());
        this.transactions.unshift(tx.getTx());
        this.merkleRoot = this.getmerkleRoot(this.transactions);
        this.txCount++;
        return { serializeCoinbase: tx.serializeWithWitness() };
    }
    getwtxidCommitment() {
        return (0, utils_1.doubleSHA256)(Buffer.from(this.calculatewTxidRoot(this.transactions) + "0".repeat(64), "hex"));
    }
    calculatewTxidRoot(transactions) {
        const wtxids = transactions.map((el) => el.wtxid);
        wtxids.unshift("0".repeat(64)); /// for coinbase
        return (0, merkleRoot_1.calualateMerkleRoot)(wtxids);
    }
    getmerkleRoot(transactions) {
        if (transactions.length === 0) {
            throw new Error("empty transactions for create merkle root");
        }
        const txids = transactions.map((el) => el.txid);
        return (0, merkleRoot_1.calualateMerkleRoot)(txids);
    }
    getTarget() {
        const bits = parseInt('0x' + this.bits, 16);
        const exponent = bits >> 24;
        const mantissa = bits & 0xFFFFFF;
        const target = (mantissa * (2 ** (8 * (exponent - 3)))).toString(16);
        return Buffer.from('0'.repeat(64 - target.length) + target, 'hex');
    }
}
exports.Block = Block;
function calulateWTXIDsRoot(transaction) {
}
