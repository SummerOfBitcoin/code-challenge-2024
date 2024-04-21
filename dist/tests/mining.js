"use strict";
// import * as fs from "fs";
// import { Transaction } from "../transaction";
// import { TransactionData, TxIn, TxOut } from "../interface";
// import { Blockchain } from "../blockchain";
// import { BitcoinReader } from "../buffer";
// import { Block } from "../block";
// class Validator {
//   private inputs: TxIn[];
//   private outputs: TxOut[];
//   private version: number;
//   private locktime: number;
//   private MAX_BLOCK_SIZE: number = 1000000; // (1 MB)
//   private MAX_COIN_VALUE: number = 21_000_000 * 100_000_000; // 21 million coins
//   private MAX_INT32: number = 0xffffffff;
//   private SIGNATURE_OPERATION_LIMIT: number = 20_000;
//   private Tx_Size = 100
//   public validateBatch(transactions: Transaction[]): Transaction[] {
//     const validTransactions: Transaction[] = [];
//     for (const transaction of transactions) {
//       this.inputs = transaction.inputs;
//       this.outputs = transaction.outputs;
//       this.version = transaction.version;
//       this.locktime = transaction.locktime;
//       const validator = new Validator(transaction);
//       if (validator.start()) {
//         validTransactions.push(transaction);
//       }
//     }
//     return validTransactions;
//   }
//   public start() {
//     return (
//       this.checkInputOutputNotEmpty() &&
//       this.checkTransactionSize() &&
//       this.checkOutputValues() &&
//       this.checkLockTime() &&
//       this.checkInputOutputValue()
//     );
//   }
//   private checkTransactionSize(): boolean {
//     return (
//       this.getTransactionSize() < this.MAX_BLOCK_SIZE &&
//       this.getTransactionSize() >= this.Tx_Size
//     );
//   }
//   private checkOutputValues(): boolean {
//     let totalOutputValue = 0;
//     for (const output of this.outputs) {
//       if (output.value < 0 || output.value > this.MAX_COIN_VALUE) {
//         return false;
//       }
//       totalOutputValue += output.value;
//     }
//     return totalOutputValue <= this.MAX_COIN_VALUE;
//   }
//   private checkLockTime(): boolean {
//     return this.locktime <= this.MAX_INT32;
//   }
//   // private checkSignatureOperations(): boolean {
//   //   let signatureOperations = 0;
//   //   for (const input of this.inputs) {
//   //     signatureOperations += this.countScriptSigOperations(input.scriptsig);
//   //   }
//   //   for (const output of this.outputs) {
//   //     signatureOperations += this.countScriptPubKeyOperations(output.scriptpubkey);
//   //   }
//   //   return signatureOperations < this.SIGNATURE_OPERATION_LIMIT;
//   // }
//   // private countScriptSigOperations(script: Uint8Array): number {
//   //   let signatureOperations = 0;
//   //   const scriptVM = new BitcoinScriptVM(script);
//   //   const transactionValidation = new TransactionValidation();
//   //   scriptVM.eval(transactionValidation);
//   //   for (const op of scriptVM.stack) {
//   //     if (op[0] === 0xac || op[0] === 0xad) {
//   //       signatureOperations++;
//   //     }
//   //   }
//   //   return signatureOperations;
//   // }
//   // private getScriptPubKey(inputIndex: number): Uint8Array {
//   //   const prevTx = this.transaction.inputs[inputIndex].prevout.transaction;
//   //   const prevOutputIndex = this.transaction.inputs[inputIndex].prevout.index;
//   //   return prevTx.outputs[prevOutputIndex].scriptpubkey;
//   // }
//   // private checkScriptValidity(): boolean {
//   //   const transactionValidation = new TransactionValidation();
//   //   transactionValidation.previousTransaction = this.transaction;
//   //   transactionValidation.transaction = this.transaction;
//   //   for (let i = 0; i < this.inputs.length; i++) {
//   //     transactionValidation.inputIndex = i;
//   //     const scriptPubKey = this.getScriptPubKey(i);
//   //     const scriptSig = this.inputs[i].scriptsig;
//   //     const scriptVM = new BitcoinScriptVM([...scriptPubKey, ...scriptSig]);
//   //     const result = scriptVM.eval(transactionValidation);
//   //     if (result[0] !== 0x01) {
//   //       return false;
//   //     }
//   //   }
//   //   return true;
//   // }
//   // private countScriptPubKeyOperations(script: Uint8Array): number {
//   //   let signatureOperations = 0;
//   //   const scriptVM = new BitcoinScriptVM(script);
//   //   const transactionValidation = new TransactionValidation();
//   //   scriptVM.eval(transactionValidation);
//   //   for (const op of scriptVM.stack) {
//   //     if (op[0] === 0xac || op[0] === 0xad) {
//   //       signatureOperations++;
//   //     }
//   //   }
//   //   return signatureOperations;
//   // }
//   private checkInputOutputNotEmpty(): boolean {
//     return this.inputs.length > 0 && this.outputs.length > 0;
//   }
//   private checkInputOutputValue() {
//     let inputValue = 0;
//     let outputValue = 0;
//     for (let input of this.inputs) {
//       inputValue += input.prevout.value;
//     }
//     for (let output of this.outputs) {
//       outputValue += output.value;
//     }
//     return inputValue > outputValue;
//   }
//   private getTransactionSize(): number {
//     let size = 0;
//     size += 4;
//     size += this.getVarIntSize(this.inputs.length);
//     for (const input of this.inputs) {
//       size += 32;
//       size += 4;
//       size += this.getVarIntSize(input.scriptsig.length);
//       size += input.scriptsig.length;
//       size += 4;
//     }
//     size += this.getVarIntSize(this.outputs.length);
//     for (const output of this.outputs) {
//       size += 8;
//       size += this.getVarIntSize(output.scriptpubkey.length);
//       size += output.scriptpubkey.length;
//     }
//     size += 4;
//     return size;
//   }
//   private getVarIntSize(value: number): number {
//     if (value < 0xfd) {
//       return 1;
//     } else if (value <= 0xffff) {
//       return 3;
//     } else if (value <= 0xffffffff) {
//       return 5;
//     } else {
//       return 9;
//     }
//   }
// }
// export class MineBlock {
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
//   async start() {
//     console.log("finding block hash...");
//     console.log("Nonce", "Block Hash");
//     while (!this.isValidHash(this.block.hash, this.difficulty)) {
//       this.block.nonce++;
//       this.block.hash = this.block.calculateHash();
//       console.log(this.block.nonce, ":", this.block.hash);
//       this.hashes++;
//     }
//     this.ended = Date.now();
//     console.log("block mined", this.block.hash, `in ${this.hashes} iterations`);
//   }
//   private isValidHash(hash: string, difficulty: bigint) {
//     return BigInt("0x" + hash) < difficulty;
//   }
// }
// export class MemoryPool {
//   private transactions: Transaction[] = [];
//   private mempoolFolder: string;
//   constructor(mempoolFolder: string) {
//     this.mempoolFolder = mempoolFolder;
//     this.loadTransactions();
//   }
//   getTransactions(): Transaction[] {
//     return this.transactions;
//   }
//   private loadTransactions(): void {
//     fs.readdirSync(this.mempoolFolder).forEach((file) => {
//       const data = fs.readFileSync(`${this.mempoolFolder}/${file}`, "utf-8");
//       const transactionData: TransactionData = JSON.parse(data);
//       const transaction = new Transaction(transactionData);
//       this.transactions.push(transaction);
//     });
//     console.log(this.transactions.length);
//   }
// }
// class MiningSimulation {
//   protected mineBlock?: MineBlock;
//   private validTransactions: Transaction[] = [];
//   private invalidTransactions: Transaction[] = [];
//   constructor(private memoryPool: MemoryPool) {}
//   async mine(chain: Blockchain) {
//     const head = chain.getHead();
//     const block = new Block(head.hash);
//     console.log("Start Validating...");
//     this.getValidTransactions(block);
//     const mineBlock = new MineBlock(chain, block, head.Difficulty);
//     await mineBlock.start();
//     console.log(
//       `Start mining of ${block.transactions.length} transactions with reward & fees of 100$.`
//     );
//     console.log(
//       ` with difficulty ${head.Difficulty.toString(16).padStart(64, "0")}`
//     );
//     chain.addBlock(block);
//     console.log(chain);
//   }
//   private getValidTransactions(block: Block): Transaction[] {
//     let hasAddedCoinbaseTransaction = false;
//     const transactionsToValidate: Transaction[] = [];
//     this.memoryPool.getTransactions().forEach((tx) => {
//       if (!hasAddedCoinbaseTransaction && tx.isCoinbase()) {
//         block.addCoinbaseTransaction(tx.outputs[0].value, Buffer.from(tx.outputs[0].scriptpubkey));
//         hasAddedCoinbaseTransaction = true;
//       } else {
//         transactionsToValidate.push(tx);
//       }
//     });
//     const validator = new Validator();
//     this.validTransactions = validator.validateBatch(transactionsToValidate);
//     this.invalidTransactions = transactionsToValidate.filter(
//       (tx) => !this.validTransactions.includes(tx)
//     );
//   return this.validTransactions;
//   }
// }
// const blockchain = new Blockchain();
// console.log(blockchain);
// const memorypool = new MemoryPool("./mempool");
// const mining = new MiningSimulation(memorypool);
// mining.mine(blockchain);
// console.log(blockchain);
// // export class BitcoinScriptVM {
// //   stack: Uint8Array[] = [];
// //   constructor(public script: Uint8Array) {
// //   }
// //   toString(): string {
// //       const res: string[] = [];
// //       const reader = new BitcoinReader(Buffer.from(this.script));
// //       while (reader.isParsing()) {
// //           const op = reader.eatByte();
// //           const opHandler = opHandlers[op];
// //           if (!opHandler) {
// //               res.push(`0x${op.toString(16)}`);
// //               continue;
// //           }
// //           if (opHandler instanceof OP_PUSH) {
// //               const stack: any[] = [];
// //               opHandler.eval(stack, reader);
// //               res.push(`<${Buffer.from(stack[0]).toString('hex')}>`);
// //           } else {
// //               res.push(opHandler.constructor.name);
// //               opHandler.seek(reader);
// //           }
// //       }
// //       return res.join(' ');
// //   }
// //   eval(transactionValidation: TransactionValidation = new TransactionValidation): Uint8Array {
// //       const reader = new BitcoinReader(Buffer.from(this.script));
// //       while (reader.isParsing()) {
// //           const op = reader.eatByte();
// //           const opHandler = opHandlers[op];
// //           if (!opHandler) throw new Error(`No OP handler for 0x${op.toString(16)} found.`);
// //           opHandler.eval(this.stack, reader, transactionValidation);
// //       }
// //       return this.stack[this.stack.length - 1];
// //   }
// // }
