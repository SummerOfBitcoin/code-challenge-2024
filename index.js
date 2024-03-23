const fs = require('fs');
const crypto = require('crypto');

// Define Transaction class
class Transaction {
    constructor(sender, receiver, amount) {
        this.sender = sender;
        this.receiver = receiver;
        this.amount = amount;
        this.timestamp = new Date().toISOString();
    }

    getTxid() {
        const data = JSON.stringify({
            sender: this.sender,
            receiver: this.receiver,
            amount: this.amount,
            timestamp: this.timestamp
        });
        return crypto.createHash('sha256').update(data).digest('hex');
    }
}

// Function to validate a transaction (placeholder logic)
function validateTransaction(transaction) {
    // Implement your validation logic here
    // For demonstration purposes, we'll assume all transactions are valid
    return true;
}

// Read all JSON files from the mempool folder
const mempoolFiles = fs.readdirSync('./mempool');

// Array to store transaction IDs (txids)
let txids = [];

// Process each JSON file
mempoolFiles.forEach(file => {
    try {
        // Read and parse the JSON file
        const rawData = fs.readFileSync(`./mempool/${file}`);
        const transaction = JSON.parse(rawData);

        // Validate the transaction
        if (validateTransaction(transaction)) {
            const newTransaction = new Transaction(transaction.sender, transaction.receiver, transaction.amount);
            txids.push(newTransaction.getTxid());
        }
    } catch (error) {
        console.error(`Error processing file ${file}: ${error}`);
    }
});

// Defined the difficulty target
const difficultyTarget = "0000ffff00000000000000000000000000000000000000000000000000000000";

// Generate the block header (placeholder)
const blockHeader = "Block Header: <insert block header here>";

// Generate the coinbase transaction (placeholder)
const coinbaseTransaction = "Serialized Coinbase Transaction: <insert serialized coinbase transaction here>";

// Mine the block
let nonce = 0;
let blockHash = "";

do {
    const blockData = blockHeader + coinbaseTransaction + txids.join("\n");
    const dataWithNonce = blockData + nonce.toString();
    blockHash = crypto.createHash('sha256').update(dataWithNonce).digest('hex');
    nonce++;
} while (blockHash > difficultyTarget);

// Write the block header, serialized coinbase transaction, and transaction IDs (txids) to output.txt
fs.writeFileSync("output.txt", blockHeader + "\n" + coinbaseTransaction + "\n" + txids.join("\n"));

console.log("Block mined and output written to output.txt successfully.");
