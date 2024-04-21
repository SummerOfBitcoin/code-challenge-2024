"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryPool = void 0;
const transaction_1 = require("./transaction");
const fs_1 = __importDefault(require("fs"));
class MemoryPool {
    constructor(mempoolFolder) {
        this.transactions = [];
        this.mempoolFolder = mempoolFolder;
        this.loadTransactions();
    }
    getTransactions() {
        return this.transactions;
    }
    loadTransactions() {
        fs_1.default.readdirSync(this.mempoolFolder).forEach((file) => {
            const data = fs_1.default.readFileSync(`${this.mempoolFolder}/${file}`, "utf-8");
            const transactionData = JSON.parse(data);
            const transaction = new transaction_1.Transaction(transactionData);
            this.transactions.push(transaction);
        });
    }
}
exports.MemoryPool = MemoryPool;
