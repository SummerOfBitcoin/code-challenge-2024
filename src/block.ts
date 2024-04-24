import { BitcoinWriter } from "./buffer";
import { BlockTransaction } from "./interface";
import { calualateMerkleRoot } from "./merkleRoot";
import { Transaction } from "./transaction";
import { bigIntTo32Buffer, doubleSHA256 } from "./utils";
export const BTC = 100000000; // Number of blocks before a coinbase transaction can be spent
export const BLOCK_VERSION = 4; // Current Bitcoin block version
export const EMPTY_SCRIPT = new Uint8Array([0x00]);
export const BLOCK_SUBSIDY = 6.25; // Empty script
export class Block {
  public readonly timestamp: number; // Timestamp indicating when the block was created
  public version: number;
  public readonly previousHash: string; // Hash of the previous block in the blockchain
  public nonce: number; // Nonce used in mining to achieve the proof of work
  public transactions: BlockTransaction[] = []; // List of transactions included in the block
  public merkleRoot:string; // Merkle root of the transactions in the block
  public hash:string=''
  protected bits: bigint;
  protected txCount: number;
  protected totalfees:number;
  protected witnessMerkleRoot:string;
  constructor(
    previousHash:string,
    transaction: BlockTransaction[],
    bits: bigint=BigInt(0x1f00fff)
  ) {
    this.version = BLOCK_VERSION;
    this.previousHash = previousHash;
    this.timestamp = Math.ceil(Date.now() / 1000);
    this.nonce = 0;
    this.bits = bits;
    this.txCount = transaction.length;
    this.transactions = transaction;
    this.totalfees=this.calculateblockFees(transaction);
    this.merkleRoot = this.getmerkleRoot(transaction);
    this.witnessMerkleRoot=this.calculatewTxidRoot(transaction)
    this.calculateBlockWeight()
  }
  get difficulty(): bigint {
    return ((this.bits & BigInt(0x00ffffff)) * BigInt(2) ** (BigInt(8) * ((this.bits >> BigInt(24)) - BigInt(3))));
}

  public calculateHash(): Buffer {
    const headerHex = this.headerBuffer();
    return doubleSHA256(headerHex);
  }
  public headerBuffer(): Buffer {
    const buffer=Buffer.allocUnsafe(80);
    const writer=new BitcoinWriter(buffer);
    writer.writeUint32(this.version);
    writer.writeBuffer(Buffer.from(this.previousHash,'hex').reverse());    
    writer.writeBuffer(Buffer.from(this.merkleRoot, "hex").reverse());
    writer.writeUint32(this.timestamp);
    writer.writeUint32(Number(this.bits))
    writer.writeUint32(this.nonce)
    console.log(buffer.toString('hex'));
    return buffer;
  }
  createTransaction(tx: Transaction): Transaction {
    const transaction = new Transaction(tx);
    this.addTransaction(transaction.getTx());
    return transaction;
  }
  private calculateblockFees(transaction:BlockTransaction[]) {
    let totalFee = 0;
    for(const tx of transaction){
      totalFee+=tx.fee;
    }
    console.log("TotalFee",totalFee)
    return totalFee;
  }
  addTransaction(transaction: BlockTransaction): number {
    this.transactions.push(transaction);
    this.txCount = this.transactions.length;
    this.merkleRoot=this.getmerkleRoot(this.transactions)
    return this.txCount;
  }

  addCoinbaseTransaction(tx: Transaction) {
    tx.vout[0].value += this.totalfees;
    tx.vout[1].scriptpubkey = `6a24aa21a9ed${this.getwtxidCommitment().toString(
      "hex"
    )}`;
    console.log("coinbase",tx.getTx());
    console.log("Coinbase", tx.getTxId());
    this.transactions.unshift(tx.getTx());
    this.merkleRoot=this.getmerkleRoot(this.transactions);
    this.txCount++;
    return {serializeCoinbase:tx.serializeWithWitness()}
  }
  private getwtxidCommitment() {
    const wxidRoot=Buffer.from(this.calculatewTxidRoot(this.transactions),'hex');
    const witnessvalue= Buffer.from( "0".repeat(64), "hex")
    const witnessNullVector = Buffer.alloc(32);
     const commitment=doubleSHA256(Buffer.concat([wxidRoot,witnessNullVector]))
     console.log("94",commitment)
     return commitment

  }
  private reverseByteOrder(hexString: string): string {
    const hexBytes = Buffer.from(hexString, 'hex');
    const reversedBytes = Buffer.from(hexBytes.reverse());
    const reversedHexString = reversedBytes.toString('hex');
    return reversedHexString;
}

 private calculatewTxidRoot(transactions: BlockTransaction[]) {
    const wtxids = transactions.map((el) => el.wtxid);
    wtxids.unshift("0".repeat(64)); /// for coinbase
    const reversedWtxids = wtxids.map(this.reverseByteOrder);
    return calualateMerkleRoot(reversedWtxids);
  }
  private calculateBlockWeight(){
    let txweight=0;
    for(let tx of this.transactions){
       txweight+=tx.weight;
    }
    console.log("-------------------weight of block",320+txweight)
  }
  private getmerkleRoot(transactions:BlockTransaction[]){
    if (transactions.length === 0) {
      throw new Error("empty transactions for create merkle root");
    }
    const txids = transactions.map((el) => el.txid);
    return calualateMerkleRoot(txids);
  }
  private getTarget(){
    const bits = parseInt('0x' + this.bits, 16);
		const exponent = bits >> 24;
		const mantissa = bits & 0xFFFFFF;
		const target = (mantissa * (2 ** (8 * (exponent - 3)))).toString(16);
    return  Buffer.from('0'.repeat(64 - target.length) + target, 'hex')
  }
}



function calulateWTXIDsRoot(transaction:BlockTransaction[]){
   
}