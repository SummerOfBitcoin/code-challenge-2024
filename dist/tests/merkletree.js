"use strict";
// import * as crypto from "crypto";
// export class MerkleTree {
//     private leaves: any;
//     private levels: any;
//     constructor(transactions: Transaction[]) {
//       this.leaves = transactions.map((transaction: Transaction) =>
//         this.hash(JSON.stringify(transaction))
//       );
//       this.levels = this.buildLevels(this.leaves);
//     }
//     private hash(transaction: any) {
//       return crypto.createHash("sha256").update(transaction).digest("hex");
//     }
//     private buildLevels(leaves: any) {
//       const levels = [leaves];
//       while (levels[levels.length - 1].length > 1) {
//         const prevLevel = levels[levels.length - 1];
//         const currentLevel = [];
//         for (let i = 0; i < prevLevel.length; i += 2) {
//           const left = prevLevel[i];
//           const right = i + 1 < prevLevel.length ? prevLevel[i + 1] : "";
//           currentLevel.push(this.hash(left + right));
//         }
//         levels.push(currentLevel);
//       }
//       return levels;
//     }
//     public get(): string {
//       return this.levels[this.buildLevels.length - 1][0];
//     }
//   }
//   import { TransactionsType } from "./types";
//   export class Block {
//       private height: number;
//       private timestamp: number;
//       private previousHash: string;
//       private hash: string;
//       private nonce: number;
//       private merkleRoot: string;
//       private difficulty: number;
//       private transactions: Transaction[];
//       constructor(
//           height: number,
//           previousHash: string,
//           transactions: Transaction[],
//           difficulty: number
//       ) {
//           this.height = height;
//           this.previousHash = previousHash;
//           this.transactions = transactions;
//           this.timestamp = Date.now();
//           this.nonce = 0;
//           this.difficulty = difficulty;
//           this.merkleRoot = this.calculateMerkleRoot();
//           this.hash = this.calculateHash();
//       }
//       private calculateHash(): string {
//           return crypto
//               .createHash("sha256")
//               .update(
//                   this.height +
//                   this.previousHash +
//                   this.timestamp.toString() +
//                   this.nonce
//               )
//               .digest("hex");
//       }
//       private calculateMerkleRoot(): string {
//           const merkleRoot = new MerkleTree(this.transactions);
//           return merkleRoot.get();
//       }
//       public mineBlock(): void {
//           const prefix = '0'.repeat(this.difficulty);
//           while (this.hash.substring(0, this.difficulty) !== prefix) {
//               this.nonce++;
//               this.hash = this.calculateHash();
//           }
//           console.log("Block mined: " + this.hash);
//       }
//       public getHash(): string {
//           return this.hash;
//       }
//   }
//   export class Blockchain {
//     private chain: Block[];
//     constructor() {
//       this.chain = [];
//       this.createGenesisBlock();
//     }
//     private createGenesisBlock(): void {
//       // const BlockHeader = {
//       //   timestamp: Date.now(),
//       //   previousHash: "0",
//       //   hash: "0",
//       //   nonce: 0,
//       //   merkleRoot: "0",
//       //   difficulty: 0,
//       // };
//       const genesisBlock = new Block(0,'0',[],0);
//       this.chain.push(genesisBlock);
//     }
//     addBlock(newBlock: Block) {
//       this.chain.push(newBlock);
//     }
//     public getLastBlock(): Block {
//       return this.chain[this.chain.length - 1];
//     }
//     public getHeight():number{
//       return this.chain.length
//     }
//     public getChain():Block[]{
//       console.log(this.chain)
//       return this.chain
//     }
//   }
//   import {Input,Output} from "./types";
//   export class Transaction {
//       private verison: number;
//       private locktime: number;
//       private vin: Input[];
//       private vout: Output[];
//       constructor(
//         verison:number,
//         locktime:number,
//         inputs: Input[],
//         outputs: Output[]
//       ) {
//         this.verison=verison
//         this.vin = inputs;
//         this.vout = outputs;
//         this.locktime=locktime
//       }  
//     }
//     import * as fs from "fs";
//     class Mining {
//         private mempoolFolder: string;
//         private transactions: Transaction[];
//         public difficulty:number
//         constructor(mempoolFolder: string,difficulty:number) {
//           this.mempoolFolder = mempoolFolder;
//           this.transactions = [];
//           this.difficulty=difficulty; JSON.pars
//         }
//         loadTransactions(): void {
//           fs.readdirSync(this.mempoolFolder).forEach((file) => {
//             const data = fs.readFileSync(`${this.mempoolFolder}/${file}`, "utf-8");
//             const {verison,locktime,vin,vout}:TransactionsType =e(data);
//             const transactions=new Transaction(verison,locktime,vin,vout);
//             this.transactions.push(transactions)
//           });
//         }
//         public mining(blockchain: Blockchain, difficulty: number): void {
//           const newBlock = this.generateNextBlock(blockchain, difficulty);
//           blockchain.addBlock(newBlock);
//         }
//         private generateNextBlock(blockchain: Blockchain, difficulty: number): Block {
//           const previousBlock = blockchain.getLastBlock();
//           const timestamp = Date.now();
//           let nonce = 0;
//           let hash = "";
//           while (hash.substring(0, difficulty) !== "0".repeat(difficulty)) {
//             nonce++;
//             hash = crypto
//               .createHash("sha256")
//               .update(previousBlock.getHash() + timestamp + nonce)
//               .digest("hex");
//           }
//           const previousHash = previousBlock.getHash();
//           // const blockHeader = {
//           //   timestamp: Date.now(),
//           //   previousHash: previousHash,
//           //   hash: "0",
//           //   nonce: 0,
//           //   merkleRoot: "0",
//           // };
//           return new Block(1,previousHash,this.transactions, this.difficulty);
//         }
//         public getNonce(): number {
//           return 0;
//         }
//       }
//       const startingMining=new Mining('./mempool',2);
//       console.log(startingMining.loadTransactions())
//       const blockchain=new Blockchain();
//       console.log(blockchain.getChain())
