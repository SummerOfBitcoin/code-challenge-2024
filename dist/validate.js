"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
const scripts_1 = require("./scripts");
class Validator {
    constructor() {
        this.inputs = [];
        this.outputs = [];
        this.version = 0;
        this.locktime = 0;
        this.MAX_BLOCK_SIZE = 1000000; // (1 MB)
        this.MAX_COIN_VALUE = 21000000 * 100000000; // 21 million coins
        this.MAX_INT32 = 0xffffffff;
        this.SIGNATURE_OPERATION_LIMIT = 20000;
        this.Tx_Size = 100;
        this.ValidTXCount = 0;
        this.InValidTXCount = 0;
        this.check = [];
    }
    validateBatch(transactions) {
        const validTransactions = [];
        for (const transaction of transactions) {
            this.inputs = transaction.vin;
            this.outputs = transaction.vout;
            this.version = transaction.version;
            this.locktime = transaction.locktime;
            if (this.start(transaction)) {
                this.ValidTXCount++;
                validTransactions.push(transaction.getTx());
            }
            else {
                this.InValidTXCount++;
            }
        }
        console.log(`Find ${this.ValidTXCount} are valid and ${this.InValidTXCount} invalid`);
        for (let i = 0; i < 400; i++) {
            validTransactions.pop();
        }
        return validTransactions;
    }
    start(transaction) {
        return (this.checkInputOutputNotEmpty() &&
            this.checkTransactionSize(transaction) &&
            this.checkOutputValues() &&
            this.checkLockTime() &&
            this.checkInputOutputValue() &&
            this.scriptVerification(transaction));
    }
    scriptVerification(transaction) {
        const script = new scripts_1.BitcoinScript(transaction);
        return script.execute();
    }
    checkTransactionSize(transaction) {
        return (transaction.getbytes() < this.MAX_BLOCK_SIZE &&
            transaction.getbytes() >= this.Tx_Size);
    }
    checkOutputValues() {
        let totalOutputValue = 0;
        for (const output of this.outputs) {
            if (output.value < 0 || output.value > this.MAX_COIN_VALUE) {
                return false;
            }
            totalOutputValue += output.value;
        }
        return totalOutputValue <= this.MAX_COIN_VALUE;
    }
    checkLockTime() {
        return this.locktime <= this.MAX_INT32;
    }
    checkInputOutputNotEmpty() {
        return this.inputs.length > 0 && this.outputs.length > 0;
    }
    checkInputOutputValue() {
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
exports.Validator = Validator;
