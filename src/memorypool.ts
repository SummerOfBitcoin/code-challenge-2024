import { Transaction } from "./transaction";
import fs from "fs";
export class MemoryPool {
    private transactions: Transaction[] = [];
    private mempoolFolder: string;
  
    constructor(mempoolFolder: string) {
      this.mempoolFolder = mempoolFolder;
      this.loadTransactions();
    }
  
    getTransactions(): Transaction[] {
      return this.transactions;
    }
  
    private loadTransactions(): void {
      fs.readdirSync(this.mempoolFolder).forEach((file:string) => {
        const data = fs.readFileSync(`${this.mempoolFolder}/${file}`, "utf-8");
        const transactionData: Transaction = JSON.parse(data);
        const transaction = new Transaction(transactionData);
        this.transactions.push(transaction);
      });
    }
  }