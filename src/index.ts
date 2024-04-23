import * as fs from "fs";
import { Transaction } from "./transaction";
import { BlockTransaction } from "./interface";
import { Blockchain } from "./blockchain";
import { Block } from "./block";
import { MemoryPool } from "./memorypool";
import { Validator } from "./validate";
import { coinbaseTX } from "./coinbase";
import { bufferToBigInt, doubleSHA256 } from "./utils";
export const BLOCK_SUBSIDY = 1250000000;
export class MineBlock {
  started: number = Date.now();
  ended: number = Date.now();
  hashes: number = 0;

  constructor(
    protected chain: Blockchain,
    protected block: Block,
    protected difficulty: string
  ) {}

  get duration(): number {
    return this.ended - this.started;
  }

  async start() {
    const header=this.block.headerBuffer();
    this.block.hash=bufferToBigInt(doubleSHA256(header));
    while (this.block.hash > this.block.difficulty) {
      this.block.nonce+=1;
      header.writeUInt32LE(this.block.nonce,80 - 4);
      this.block.hash=bufferToBigInt(doubleSHA256(header));
      this.hashes++;
      console.log(this.block.nonce,this.block.hash);
      if (this.hashes % 1000000 === 0) {
        console.log(`Iteration ${this.hashes}: ${this.block.hash.toString()}`);
      }
    }
    console.log("Block mined", this.block.hash, `in ${this.hashes} iterations`);
  }

  // private isValidHash(hash: string, difficulty: bigint): boolean {
  //   const maxTarget = BigInt(
  //     "0x00000000ffff0000000000000000000000000000000000000000000000000000"
  //   );
  //   const target = maxTarget / difficulty;
  //   const hashBigInt = BigInt(`0x${hash}`);
  //   return hashBigInt < target;
  // }
}
export class MiningSimulation {
  protected mineBlock?: MineBlock;
  private validTransactions: BlockTransaction[] = [];
  constructor(private memoryPool: MemoryPool) {}
  async mine(chain: Blockchain) {
    const coinbase = coinbaseTX();
    const target ='0000ffff00000000000000000000000000000000000000000000000000000000'
    const validtransaction = this.getValidTransactions();
    const block = new Block(BigInt(`0x${"0".repeat(64)}`), validtransaction, BigInt(0x1f00ffff));
    console.log(block.headerBuffer().toString('hex'))
    const { serializeCoinbase } = block.addCoinbaseTransaction(coinbase);
    const mineBlock = new MineBlock(chain, block, target);
    console.log(
      `Start mining of ${block.transactions.length} transactions with of 12.5 BTC`
    );
  
    await mineBlock.start();
    chain.addBlock(block);
    const txids = block.transactions.map((tx) => tx.txid);
    const output = `${block
      .headerBuffer()
      .toString("hex")}\n${serializeCoinbase}\n${txids.join("\n")}`;
    fs.writeFileSync("output.txt", output);
    console.log(chain);
  }

  private getValidTransactions(): BlockTransaction[] {
    const transactionsToValidate: Transaction[] = [];
    this.memoryPool.getTransactions().forEach((tx: Transaction) => {
      transactionsToValidate.push(tx);
    });
    console.log("start validating transactions.../../");
    const validator = new Validator();
    this.validTransactions = validator.validateBatch(transactionsToValidate);
    return this.validTransactions;
  }
}
const blockchain = new Blockchain();
const memoryPool = new MemoryPool("./mempool");
const mining = new MiningSimulation(memoryPool);
mining.mine(blockchain);
console.log(blockchain);
