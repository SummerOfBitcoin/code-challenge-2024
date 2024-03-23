const crypto = require('crypto');

class Transaction {
    constructor(sender, receiver, amount) {
        this.sender = sender;
        this.receiver = receiver;
        this.amount = amount;
        this.timestamp = new Date().toISOString();
    }

    toString() {
        return `${this.sender} -> ${this.receiver}: ${this.amount} (${this.timestamp})`;
    }
}

class Block {
    constructor(transactions, previousHash) {
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.timestamp = new Date().toISOString();
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        const blockContent = this.transactions.map(transaction => transaction.toString()).join('') + this.previousHash + this.timestamp + this.nonce;
        return crypto.createHash('sha256').update(blockContent).digest('hex');
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== '0'.repeat(difficulty)) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
    }

    toString() {
        const transactionStrings = this.transactions.map(transaction => transaction.toString());
        return `Previous Hash: ${this.previousHash}\nTransactions: ${transactionStrings.join(', ')}\nTimestamp: ${this.timestamp}\nNonce: ${this.nonce}\nHash: ${this.hash}\n`;
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4;
    }

    createGenesisBlock() {
        return new Block([], "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    isValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

// Sample transactions
const transactions = [
    new Transaction("Alice", "Bob", 10),
    new Transaction("Bob", "Charlie", 5)
];

// Create blockchain
const blockchain = new Blockchain();

// Add transactions to the blockchain
transactions.forEach(transaction => {
    const block = new Block([transaction], blockchain.getLatestBlock().hash);
    blockchain.addBlock(block);
});

console.log("Blockchain:");
console.log(JSON.stringify(blockchain, null, 2));


// Output:
console.log("Is blockchain valid?", blockchain.isValid());
