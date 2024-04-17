const fs = require('fs');
const crypto = require('crypto');

// Step 1: Read transactions from the mempool folder
const mempoolFolderPath = './mempool';
let transactions = [];

fs.readdirSync(mempoolFolderPath).forEach(file => {
    const transactionData = JSON.parse(fs.readFileSync(`${mempoolFolderPath}/${file}`));
    transactions.push(transactionData);
});

// Placeholder object to store processed transaction hashes
const processedTransactions = {};

// Placeholder object to store selected transactions
const selectedTransactions = [];

// Placeholder variable to store total fees collected
let totalFees = 0;

// Step 2: Validate transaction structure
function validateTransactionStructure(transaction) {
    // Ensure transaction object has required fields
    return (
        typeof transaction === 'object' &&
        transaction.hasOwnProperty('sender') &&
        transaction.hasOwnProperty('receiver') &&
        transaction.hasOwnProperty('amount') &&
        transaction.hasOwnProperty('timestamp')
    );
}

// Step 3: Validate transaction fields
function validateTransactionFields(transaction) {
    // Implement validation logic for fields (e.g., sender, receiver, amount)
    // Example: Check if sender, receiver, and amount are non-empty strings
    return (
        typeof transaction.sender === 'string' && transaction.sender.trim() !== '' &&
        typeof transaction.receiver === 'string' && transaction.receiver.trim() !== '' &&
        typeof transaction.amount === 'number' && transaction.amount > 0
    );
}

// Step 4: Validate transaction signatures (placeholder)
function validateTransactionSignature(transaction) {
    // Placeholder implementation for signature validation
    // Replace this with your actual signature validation logic
    // For simplicity, returning true here assuming all transactions are valid
    return true;
}

// Step 5: Optionally check for duplicate transactions
function isDuplicateTransaction(transaction) {
    // Generate a unique hash for the transaction
    const transactionHash = JSON.stringify(transaction);

    // Check if the transaction hash exists in the processed transactions record
    if (processedTransactions.hasOwnProperty(transactionHash)) {
        return true; // Duplicate transaction found
    } else {
        // Add the transaction hash to the processed transactions record
        processedTransactions[transactionHash] = true;
        return false; // Transaction is not a duplicate
    }
}

// Step 6: Calculation function for Merkle root
function calculateMerkleRoot(transactions) {
    // Convert transaction hashes to Buffer objects
    let transactionHashes = transactions.map(transaction => crypto.createHash('sha256').update(JSON.stringify(transaction)).digest());

    // Continue hashing pairs of transaction hashes until a single hash (Merkle root) is obtained
    while (transactionHashes.length > 1) {
        let newHashes = [];
        for (let i = 0; i < transactionHashes.length; i += 2) {
            const combinedHash = (i + 1 < transactionHashes.length) ? Buffer.concat([transactionHashes[i], transactionHashes[i + 1]]) : transactionHashes[i];
            const newHash = crypto.createHash('sha256').update(combinedHash).digest();
            newHashes.push(newHash);
        }
        transactionHashes = newHashes;
    }

    // Return the Merkle root (single hash)
    return transactionHashes[0].toString('hex');
}

// Step 7: Validate transactions and select valid ones
transactions.forEach(transaction => {
    // Step 2: Validate transaction structure
    if (!validateTransactionStructure(transaction)) {
        console.log(`Invalid transaction structure`);
        return;
    }

    // Step 3: Validate transaction fields
    if (!validateTransactionFields(transaction)) {
        console.log(`Invalid transaction fields`);
        return;
    }

    // Step 4: Validate transaction signatures (if applicable)
    if (!validateTransactionSignature(transaction)) {
        console.log(`Invalid transaction signature`);
        return;
    }

    // Step 5: Optionally check for duplicate transactions
    if (isDuplicateTransaction(transaction)) {
        console.log(`Duplicate transaction found`);
        return;
    }

    // Step 7: Calculate the Merkle root (if needed)
    const merkleRoot = calculateMerkleRoot([transaction]);
    console.log(`Merkle root for transaction: ${merkleRoot}`);

    // Process the transaction data here
    console.log('Transaction details:');
    console.log('Sender:', transaction.sender);
    console.log('Receiver:', transaction.receiver);
    console.log('Amount:', transaction.amount);
    console.log('Timestamp:', transaction.timestamp);

    // Store the transaction in the selected transactions array
    selectedTransactions.push(transaction);
    // Add the transaction fee to the total fees collected
    totalFees += transaction.fee;
});

// Step 8: Generate output.txt file
const outputFileName = 'output.txt';
let outputContent = '';

// Block header (placeholder, replace with actual header)
const blockHeader = {
    timestamp: Math.floor(Date.now() / 1000),
    // Add other block header metadata
};
outputContent += JSON.stringify(blockHeader) + '\n';

// Serialized coinbase transaction (placeholder, replace with actual transaction)
const coinbaseTransaction = {
    txid: "coinbase_txid_placeholder",
    // Add other coinbase transaction details
};
outputContent += JSON.stringify(coinbaseTransaction) + '\n';

// Add transaction IDs of mined transactions (coinbase transaction first)
outputContent += coinbaseTransaction.txid + '\n';
selectedTransactions.forEach(transaction => {
    outputContent += transaction.txid + '\n';
});

fs.writeFileSync(outputFileName, outputContent);

console.log('Block mined successfully and written to output.txt.');
