"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiningSimulation = exports.MineBlock = exports.BLOCK_SUBSIDY = void 0;
const fs = __importStar(require("fs"));
const blockchain_1 = require("./blockchain");
const block_1 = require("./block");
const memorypool_1 = require("./memorypool");
const validate_1 = require("./validate");
const coinbase_1 = require("./coinbase");
const utils_1 = require("./utils");
exports.BLOCK_SUBSIDY = 1250000000;
class MineBlock {
    constructor(chain, block, difficulty) {
        this.chain = chain;
        this.block = block;
        this.difficulty = difficulty;
        this.started = Date.now();
        this.ended = Date.now();
        this.hashes = 0;
    }
    get duration() {
        return this.ended - this.started;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            const target = BigInt("0x" + this.difficulty);
            const header = Buffer.from(this.block.headerBuffer());
            let hash = (0, utils_1.doubleSHA256)(header).toString('hex');
            while (BigInt(`0x${this.block.hash}`) >= target) {
                this.block.nonce += 1;
                header.writeUInt32LE(this.block.nonce, 80 - 4);
                this.block.hash = this.block.calculateHash().toString('hex');
                this.hashes++;
                if (this.hashes % 1000000 === 0) {
                    console.log(`Iteration ${this.hashes}: ${this.block.hash}`);
                }
            }
            console.log("Block mined", this.block.hash, `in ${this.hashes} iterations`);
        });
    }
    isValidHash(hash, difficulty) {
        const maxTarget = BigInt("0x00000000ffff0000000000000000000000000000000000000000000000000000");
        const target = maxTarget / difficulty;
        const hashBigInt = BigInt(`0x${hash}`);
        return hashBigInt < target;
    }
}
exports.MineBlock = MineBlock;
class MiningSimulation {
    constructor(memoryPool) {
        this.memoryPool = memoryPool;
        this.validTransactions = [];
    }
    mine(chain) {
        return __awaiter(this, void 0, void 0, function* () {
            const coinbase = (0, coinbase_1.coinbaseTX)();
            const target = "0000ffff00000000000000000000000000000000000000000000000000000000";
            const validtransaction = this.getValidTransactions();
            const block = new block_1.Block("0".repeat(64), validtransaction, target);
            const { serializeCoinbase } = block.addCoinbaseTransaction(coinbase);
            const mineBlock = new MineBlock(chain, block, target);
            console.log(`Start mining of ${block.transactions.length} transactions with of 12.5 BTC`);
            yield mineBlock.start();
            chain.addBlock(block);
            const txids = block.transactions.map((tx) => tx.txid);
            const output = `${block
                .headerBuffer()
                .toString("hex")}\n${serializeCoinbase}\n${txids.join("\n")}`;
            fs.writeFileSync("output.txt", output);
            console.log(chain);
        });
    }
    getValidTransactions() {
        const transactionsToValidate = [];
        console.log("start fetching transaction from memory pool");
        this.memoryPool.getTransactions().forEach((tx) => {
            transactionsToValidate.push(tx);
        });
        console.log("start validating transactions.../../");
        const validator = new validate_1.Validator();
        this.validTransactions = validator.validateBatch(transactionsToValidate);
        return this.validTransactions;
    }
}
exports.MiningSimulation = MiningSimulation;
const blockchain = new blockchain_1.Blockchain();
const memoryPool = new memorypool_1.MemoryPool("./mempool");
const mining = new MiningSimulation(memoryPool);
mining.mine(blockchain);
console.log(blockchain);
