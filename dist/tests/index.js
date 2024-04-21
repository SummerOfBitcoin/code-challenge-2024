"use strict";
// import * as crypto from "crypto";
// import { MerkleTree } from "./merkleRoot";
// import { Input, Output } from "./types";
// import { doubleSHA256 } from "./utils";
// class Transactions {
//   protected version: number | undefined;
//   protected input: Input[] = [];
//   protected output: Output[] = [];
//   public locktime: number | undefined;
//   witnesses: Uint8Array[][] = [];
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//   constructor() {}
// }
// class Block {
//   public readonly height: number; // Index or height of the block in the blockchain
//   public readonly timestamp: number; // Timestamp indicating when the block was created
//   public readonly previousHash: string; // Hash of the previous block in the blockchain
//   public nonce: number; // Nonce used in mining to achieve the proof of work
//   public readonly transactions: Transactions[]; // List of transactions included in the block
//   public readonly merkleRoot: string; // Merkle root of the transactions in the block
//   public readonly hash: string; // Hash of the block header
//   constructor(
//     height: number,
//     timestamp: number,
//     previousHash: string,
//     nonce: number,
//     transactions: Transactions[],
//     merkleRoot: string,
//     hash: string
//   ) {
//     this.height = height;
//     this.timestamp = timestamp;
//     this.previousHash = previousHash;
//     this.nonce = nonce;
//     this.transactions = transactions;
//     this.merkleRoot = merkleRoot;
//     this.hash = hash;
//   }
//   getHeaderHash() {
//     const timestampBuffer = Buffer.alloc(4);
//     timestampBuffer.writeUInt32BE(this.timestamp);
//     const nonceBuffer = Buffer.alloc(4);
//     nonceBuffer.writeUInt32BE(this.nonce);
//     const header = Buffer.concat([
//       Buffer.from(this.previousHash, "hex"),
//       Buffer.from(this.merkleRoot, "hex"),
//       Buffer.alloc(4),
//       timestampBuffer,
//       Buffer.alloc(4),
//       nonceBuffer,
//     ]);
//     console.log("header=---------", header);
//     return BigInt(
//       "0x" + crypto.createHash("sha256").update(header).digest("hex")
//     );
//   }
//   addTransaction(transaction: Transactions) {
//     this.transactions.push(transaction);
//   }
//   addCoinbaseTransaction() {
//     const transaction = new Transactions();
//     this.transactions.unshift(transaction);
//     return transaction;
//   }
// }
// class Blockchain {
//   public chain: Block[];
//   constructor() {
//     this.chain = [this.createGenesisBlock()];
//   }
//   createGenesisBlock(): Block {
//     return new Block("");
//   }
// }
// const blockchain = new Blockchain();
// console.log(blockchain.chain);
// class MineBlock {
//   started: number = Date.now();
//   ended: number = Date.now();
//   hashes: number = 0;
//   constructor(
//     protected chain: Blockchain,
//     protected block: Block,
//     protected difficulty: bigint
//   ) {}
//   get took(): number {
//     return this.ended - this.started;
//   }
//   calculateHash(): BigInt {
//     return crypto
//       .createHash("sha256")
//       .update(this.block.getHeaderHash())
//       .digest("hex");
//   }
//   public async start() {
//     const target = BigInt(2) ** (256n - BigInt(this.difficulty));
//     const header = Buffer.from(this.block.getBufferHeader());
//     let hash: BigInt;
//     do {
//       this.block.nonce++;
//       hash = this.calculateHash();
//     } while (hash >= target);
//     console.log("Block mined:", hash.toString(16));
//   }
// }
const elliptic_1 = __importDefault(require("elliptic"));
const EC = elliptic_1.default.ec;
const ec = new EC('secp256k1');
const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');
console.log("Public Key:", publicKey);
console.log("Private Key:", privateKey);
const tranasaction = {
    "version": 1,
    "locktime": 0,
    "vin": [
        {
            "txid": "3b7dc918e5671037effad7848727da3d3bf302b05f5ded9bec89449460473bbb",
            "vout": 16,
            "prevout": {
                "scriptpubkey": "0014f8d9f2203c6f0773983392a487d45c0c818f9573",
                "scriptpubkey_asm": "OP_0 OP_PUSHBYTES_20 f8d9f2203c6f0773983392a487d45c0c818f9573",
                "scriptpubkey_type": "v0_p2wpkh",
                "scriptpubkey_address": "bc1qlrvlygpudurh8xpnj2jg04zupjqcl9tnk5np40",
                "value": 37079526
            },
            "scriptsig": "",
            "scriptsig_asm": "",
            "witness": [
                "30440220780ad409b4d13eb1882aaf2e7a53a206734aa302279d6859e254a7f0a7633556022011fd0cbdf5d4374513ef60f850b7059c6a093ab9e46beb002505b7cba0623cf301",
                "022bf8c45da78  9f695d59f93983c813ec205203056e19ec5d3fbefa809af67e2ec"
            ],
            "is_coinbase": false,
            "sequence": 4294967295
        }
    ],
    "vout": [
        {
            "scriptpubkey": "76a9146085312a9c500ff9cc35b571b0a1e5efb7fb9f1688ac",
            "scriptpubkey_asm": "OP_DUP OP_HASH160 OP_PUSHBYTES_20 6085312a9c500ff9cc35b571b0a1e5efb7fb9f16 OP_EQUALVERIFY OP_CHECKSIG",
            "scriptpubkey_type": "p2pkh",
            "scriptpubkey_address": "19oMRmCWMYuhnP5W61ABrjjxHc6RphZh11",
            "value": 100000
        },
        {
            "scriptpubkey": "0014ad4cc1cc859c57477bf90d0f944360d90a3998bf",
            "scriptpubkey_asm": "OP_0 OP_PUSHBYTES_20 ad4cc1cc859c57477bf90d0f944360d90a3998bf",
            "scriptpubkey_type": "v0_p2wpkh",
            "scriptpubkey_address": "bc1q44xvrny9n3t5w7lep58egsmqmy9rnx9lt6u0tc",
            "value": 36977942
        }
    ]
};
