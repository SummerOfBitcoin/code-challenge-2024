import { BlockTransaction, TxIn, TxOut } from "./interface";
import { Transaction, Vin, Vout } from "./transaction";
import { BitcoinScript } from "./scripts";
export class Validator {
  private inputs: Vin[] = [];
  private outputs: Vout[] = [];
  private version: number = 0;
  private locktime: number = 0;
  private MAX_BLOCK_SIZE: number = 1000000; // (1 MB)
  private MAX_COIN_VALUE: number = 21_000_000 * 100_000_000; // 21 million coins
  private MAX_INT32: number = 0xffffffff;
  private SIGNATURE_OPERATION_LIMIT: number = 20_000;
  private Tx_Size = 100;
  public ValidTXCount: number = 0;
  public InValidTXCount: number = 0;
  private check: string[] = [];
  public validateBatch(transactions: Transaction[]): BlockTransaction[] {
    const validTransactions: BlockTransaction[] = [];
    for (const transaction of transactions) {
      this.inputs = transaction.vin;
      this.outputs = transaction.vout;
      this.version = transaction.version;
      this.locktime = transaction.locktime;
      if (this.start(transaction)) {
        this.ValidTXCount++;
        validTransactions.push(transaction.getTx());
      } else {
        this.InValidTXCount++;
      }
    }
    console.log(
      `Find ${this.ValidTXCount} are valid and ${this.InValidTXCount} invalid`
    );
    for (let i = 0; i < 500; i++) {
      validTransactions.pop();
    }
    return validTransactions;
  }

  public start(transaction: Transaction): boolean {
    return (
      this.checkInputOutputNotEmpty() &&
      this.checkTransactionSize(transaction) &&
      this.checkOutputValues() &&
      this.checkLockTime() &&
      this.checkInputOutputValue() &&
      this.scriptVerification(transaction)
    );
  }
  private scriptVerification(transaction: Transaction): boolean {
    const script = new BitcoinScript(transaction);
    return script.execute();
  }

  private checkTransactionSize(transaction: Transaction): boolean {
    return (
      transaction.getbytes() < this.MAX_BLOCK_SIZE &&
      transaction.getbytes() >= this.Tx_Size
    );
  }

  private checkOutputValues(): boolean {
    let totalOutputValue = 0;
    for (const output of this.outputs) {
      if (output.value < 0 || output.value > this.MAX_COIN_VALUE) {
        return false;
      }
      totalOutputValue += output.value;
    }
    return totalOutputValue <= this.MAX_COIN_VALUE;
  }

  private checkLockTime(): boolean {
    return this.locktime <= this.MAX_INT32;
  }

  private checkInputOutputNotEmpty(): boolean {
    return this.inputs.length > 0 && this.outputs.length > 0;
  }

  private checkInputOutputValue(): boolean {
    let inputValue = 0;
    let outputValue = 0;
    for (const input of this.inputs) {
      inputValue += input.prevout.value;
    }
    for (const output of this.outputs) {
      outputValue += output.value;
    }
    return inputValue > outputValue;
  }
}
