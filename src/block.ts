import { BlockTransaction } from "./interface";
import { constructMerkleTree } from "./merkleRoot";
import { Transaction } from "./transaction";
import { doubleSHA256, uint8ArrayToHexString } from "./utils";
export const BTC = 100000000; // Number of blocks before a coinbase transaction can be spent
export const BLOCK_VERSION = 2; // Current Bitcoin block version
export const EMPTY_SCRIPT = new Uint8Array([0x00]);
export const BLOCK_SUBSIDY = 6.25; // Empty script
export class Block {
  public readonly timestamp: number; // Timestamp indicating when the block was created
  public version: number;
  public readonly previousHash: string; // Hash of the previous block in the blockchain
  public nonce: number; // Nonce used in mining to achieve the proof of work
  public transactions: BlockTransaction[] = []; // List of transactions included in the block
  public merkleRoot: string = ""; // Merkle root of the transactions in the block
  public hash: string;
  protected bits: string;
  protected txCount: number;
  constructor(
    previousHash: string,
    transaction: BlockTransaction[],
    bits: string
  ) {
    this.version = BLOCK_VERSION;
    this.previousHash = previousHash;
    this.merkleRoot = this.calculateMerkleRoot(transaction);
    this.timestamp = Math.floor(Date.now() / 1000);
    this.nonce = 0;
    this.bits = "1f00ffff";
    this.txCount = transaction.length;
    this.transactions = transaction;
    this.hash = this.calculateHash().toString("hex");
  }
  public setTarget(difficulty: bigint): bigint {
    return difficulty;
  }

  public calculateHash(): Buffer {
    const headerHex = this.constructHeaderBuffer();
    return doubleSHA256(headerHex);
  }
  private constructBits(target: string): string {
    const targetBuffer = Buffer.from(target, "hex");
    const exponent = targetBuffer.readUInt8(3);
    const mantissa = targetBuffer.readUInt32BE(4);

    const bitsExponent = exponent.toString(16).padStart(2, "0");
    const bitsMantissa = mantissa.toString(16).padStart(6, "0");
    const bits = bitsExponent + bitsMantissa;
    console.log(bits);
    return bits;
  }
  public constructHeaderBuffer(): Buffer {
    const buffers: Buffer[] = [];
    buffers.push(
      Buffer.from([
        this.version & 0xff,
        (this.version >> 8) & 0xff,
        (this.version >> 16) & 0xff,
        (this.version >> 24) & 0xff,
      ])
    );
    buffers.push(Buffer.from(this.previousHash, "hex"));
    buffers.push(Buffer.from(this.merkleRoot, "hex"));
    const timestampBytes = Buffer.alloc(4);
    timestampBytes.writeInt32LE(this.timestamp);
    buffers.push(timestampBytes);
    buffers.push(Buffer.from("1f00ffff", "hex"));
    const nonceBytes = Buffer.alloc(4);
    nonceBytes.writeUInt32LE(this.nonce);
    buffers.push(nonceBytes);
    const blockheader = Buffer.concat(buffers);
    return blockheader;
  }
  createTransaction(tx: Transaction): Transaction {
    const transaction = new Transaction(tx);
    this.addTransaction(transaction.getTx());
    return transaction;
  }
  private calculateblockFees() {
    let totalFee = 0;
    this.transactions.forEach((transaction) => totalFee + transaction.fee);
    return totalFee;
  }
  addTransaction(transaction: BlockTransaction): number {
    this.transactions.push(transaction);
    this.txCount = this.transactions.length;
    this.updateMerkleRoot(this.transactions);
    return this.txCount;
  }
  private calculateWeight() {}

  addCoinbaseTransaction(tx: Transaction) {
    tx.vout[0].value += this.calculateblockFees();
    tx.vout[1].scriptpubkey = `6a24aa21a9ed${this.getwtxidCommitment().toString(
      "hex"
    )}`;
    console.log("Coinbase", tx.getTxId());
    this.transactions.unshift(tx.getTx());
    return {serializeCoinbase:tx.serializeWithWitness()}
  }
  private getwtxidCommitment() {
    console.log(
      doubleSHA256(Buffer.from(this.calculatewTxidRoot + "0".repeat(64), "hex"))
    );
    return doubleSHA256(
      Buffer.from(this.calculatewTxidRoot + "0".repeat(64), "hex")
    );
  }
  private calculatewTxidRoot(transactions: BlockTransaction[]) {
    const wtxids = transactions.map((el) => el.wtxid);
    wtxids.unshift("0".repeat(64)); /// for coinbase
    return constructMerkleTree(wtxids);
  }
  private updateMerkleRoot(transaction: BlockTransaction[]): void {
    this.merkleRoot = this.calculateMerkleRoot(transaction);
  }
  private calculateMerkleRoot(transactions: BlockTransaction[]): string {
    if (transactions.length === 0) {
      throw new Error("empty transactions for create merkle root");
    }
    const txids = transactions.map((el) => el.txid);
    return constructMerkleTree(txids).toString("hex");
  }
}
