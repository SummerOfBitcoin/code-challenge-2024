const fs = require('fs');
const crypto = require('crypto');

// Function to validate a transaction
function validateTransaction(transaction) {
    // Implement your transaction validation logic here
    // For example:
    // Check transaction format, signatures, inputs, outputs, etc.
    // Return true if valid, false otherwise


}

// Function to mine the block
function mineBlock(transactions) {
    const difficultyTarget = '0000ffff00000000000000000000000000000000000000000000000000000000';
    let nonce = 0;
    let blockHash;

    while (true) {
        const blockData = JSON.stringify(transactions) + nonce;
        const hash = crypto.createHash('sha256').update(blockData).digest('hex');
        if (hash < difficultyTarget) {
            blockHash = hash;
            break;
        }
        nonce++;
    }

    return { nonce, blockHash };
    
}

// Read transaction files from mempool folder
const mempoolFiles = fs.readdirSync('./mempool');
const transactions = [];
mempoolFiles.forEach(file => {
    const transaction = JSON.parse(fs.readFileSync(`./mempool/${file}`, 'utf8'));
    if (validateTransaction(transaction)) {
        transactions.push(transaction);
    }
});

// Create coinbase transaction (adjust as per your requirements)
const coinbaseTransaction = {
    // Add coinbase transaction details here
};

// Add coinbase transaction to the list of transactions
transactions.unshift(coinbaseTransaction);

// Mine the block
const { nonce, blockHash } = mineBlock(transactions);

// Serialize the block
const serializedBlock = {
    header: {
        nonce: nonce,
        blockHash: blockHash
    },
    coinbaseTransaction: coinbaseTransaction,
    transactions: transactions
};

// Generate transaction IDs (txids) of the transactions mined in the block
const txids = transactions.map(tx => tx.transaction_id);

// Write output to output.txt
fs.writeFileSync('output.txt', `${serializedBlock.header}\n${JSON.stringify(serializedBlock.coinbaseTransaction)}\n${txids.join('\n')}`);
console.log('Block mined successfully! Output written to output.txt');
