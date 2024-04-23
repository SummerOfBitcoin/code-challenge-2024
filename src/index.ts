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
  private MAX_NONCE: number = 4294967295;
  constructor(
    protected chain: Blockchain,
    protected block: Block,
    protected difficulty: string
  ) {}

  get duration(): number {
    return this.ended - this.started;
  }

  async start() {
    const header = this.block.headerBuffer();
    this.block.hash = doubleSHA256(header).toString("hex");
    while (
      BigInt('0x'+this.block.hash) > this.block.difficulty &&
      this.block.nonce < this.MAX_NONCE
    ) {
      this.block.nonce++;
      header.writeUInt32LE(this.block.nonce, 80 - 4);
      this.block.hash = doubleSHA256(header).toString("hex");
      this.hashes++;
      // console.log(this.block.nonce, this.block.hash);
    }
    console.log("Block mined", this.block.hash, `in ${this.hashes} iterations`);
  }
}
export class Miner {
  protected mineBlock?: MineBlock;
  private validTransactions: BlockTransaction[] = [];
  constructor(private memoryPool: MemoryPool) {}
  async start(chain: Blockchain) {
    const coinbase = coinbaseTX();

    const validtransaction = this.getValidTransactions();
    const block = new Block(
      "0".repeat(64),
      validtransaction,
      BigInt(0x1f00ffff)
    );
    console.log(block.headerBuffer().toString("hex"));
    const { serializeCoinbase } = block.addCoinbaseTransaction(coinbase);
    const mineBlock = new MineBlock(chain, block, "");
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
    // fs.writeFileSync('test.ts',`export const txids = ${JSON.stringify(txids)};`)
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
const miner = new Miner(memoryPool);
miner.start(blockchain);
console.log(blockchain);
