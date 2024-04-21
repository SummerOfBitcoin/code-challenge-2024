import * as fs from "fs";
import { Transaction } from "./transaction";
import { BlockTransaction, TransactionData, TxIn, TxOut } from "./interface";
import { Blockchain } from "./blockchain";
import { BitcoinReader } from "./buffer";
import { Block } from "./block";
import { MemoryPool } from "./memorypool";
import { Validator } from "./validate";
import { coinbaseTX } from "./coinbase";
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
    console.log("Finding block hash...");
    console.log("Nonce", "Block Hash");

    while (!this.isValidHash(this.block.hash, BigInt(this.difficulty))) {
      this.block.nonce++;
      this.block.hash = this.block.calculateHash().toString("hex");
      console.log(this.block.nonce, ":", this.block.hash);
      this.hashes++;
    }
    this.ended = Date.now();

    console.log("Block mined", this.block.hash, `in ${this.hashes} iterations`);
    console.log("timetaken", this.duration);
    console.log(
      this.block.transactions[0],
      this.block.transactions[1],
      this.block.transactions[2],
      this.block.transactions[3],
      this.block.transactions[4],
      this.block.transactions[5]
    );
  }

  private isValidHash(hash: string, difficulty: bigint): boolean {
    return BigInt("0x" + hash) < difficulty;
  }
}
export class MiningSimulation {
  protected mineBlock?: MineBlock;
  private validTransactions: BlockTransaction[] = [];
  constructor(private memoryPool: MemoryPool) {}
  async mine(chain: Blockchain) {
    const coinbase = coinbaseTX();
    const target =
      "0x0000ffff00000000000000000000000000000000000000000000000000000000";
    const validtransaction = this.getValidTransactions();
    const block = new Block("0".repeat(64), validtransaction, target);
    const { serializeCoinbase } = block.addCoinbaseTransaction(coinbase);
    const mineBlock = new MineBlock(chain, block, target);
    console.log(
      `Start mining of ${block.transactions.length} transactions with of 12.5 BTC`
    );
    await mineBlock.start();
    chain.addBlock(block);
    const txids=block.transactions.map((tx)=>tx.txid)
    const output=`${block.constructHeaderBuffer().toString('hex')}\n${serializeCoinbase}\n${txids.join('\n')}`;
    fs.writeFileSync('output.txt',output);
    console.log(chain);
  }

  private getValidTransactions(): BlockTransaction[] {
    const transactionsToValidate: Transaction[] = [];
    console.log("start fetching transaction from memory pool");
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
