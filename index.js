const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path'); // To handle file paths

const app = express();
const port = 3000; // Choose any port you like

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

// POST route for mining
app.post('/mine', (req, res) => {
    // Generate dynamic block header
    const previousBlockHash = generateRandomString(64); // Placeholder, replace with actual hash
    const timestamp = new Date().toISOString();
    const merkleRoot = generateRandomString(64); // Placeholder, replace with actual Merkle root hash
    const version = 1; // Placeholder, replace with actual version number
    const blockHeader = `${version}|${previousBlockHash}|${merkleRoot}|${timestamp}`;

    // Generate dynamic coinbase transaction
    const blockReward = 10; // Placeholder, replace with actual block reward
    const minerAddress = 'minerAddress'; // Placeholder, replace with actual miner's address
    const coinbaseTransaction = new Transaction("coinbase", minerAddress, blockReward);

    // Read all JSON files from the mempool folder
    const mempoolFiles = fs.readdirSync('./mempool');
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

    // Mine the block
    let nonce = 0;
    let blockHash = "";

    do {
        const blockData = blockHeader + JSON.stringify(coinbaseTransaction) + txids.join("\n");
        const dataWithNonce = blockData + nonce.toString();
        blockHash = crypto.createHash('sha256').update(dataWithNonce).digest('hex');
        nonce++;
    } while (blockHash > difficultyTarget);

    // Write the block header, serialized coinbase transaction, and transaction IDs (txids) to output.txt
    const outputPath = path.join(__dirname, 'output.txt');
    fs.writeFileSync(outputPath, blockHeader + "\n" + JSON.stringify(coinbaseTransaction) + "\n" + txids.join("\n"));

    // Send response
    res.json({ message: "Block mined and output written to output.txt successfully." });
});

// GET route to retrieve output.txt content
app.get('/output', (req, res) => {
    const outputPath = path.join(__dirname, 'output.txt');
    fs.readFile(outputPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading output.txt:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json({ output: data });
    });
});

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Function to generate a random alphanumeric string (for demonstration purposes)
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
