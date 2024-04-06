const fs = require('fs');
const crypto = require('crypto');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

// Define the path to the mempool folder
const mempoolFolderPath = './mempool';

// Define the difficulty target
const difficultyTarget = '0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

// Number of threads for parallel processing
const numThreads = 4;

// Read the list of files in the mempool folder
fs.readdir(mempoolFolderPath, (err, files) => {
    if (err) {
        console.error('Error reading mempool folder:', err);
        return;
    }

    // Array to store valid transactions
    const validTransactions = [];

    // Iterate through each file in the mempool folder
    files.forEach(file => {
        // Construct the full path to the file
        const filePath = `${mempoolFolderPath}/${file}`;

        // Read the contents of the file
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading file ${file}:`, err);
                return;
            }

            try {
                // Parse the JSON data to extract transaction details
                const transaction = JSON.parse(data);

                // Validate the transaction
                if (validateTransaction(transaction)) {
                    validTransactions.push(transaction);
                }
            } catch (parseError) {
                console.error(`Error parsing JSON in file ${file}:`, parseError);
            }

            // If all files have been processed, start mining
            if (validTransactions.length === files.length) {
                mineBlock(validTransactions);
            }
        });
    });
});

// Function to validate a transaction
function validateTransaction(transaction) {
    // Implement validation logic here
    // For demonstration purposes, assuming all transactions are valid
    return true;
}

// Function to calculate the transaction ID (txid)
function getTransactionId(transaction) {
    const transactionString = JSON.stringify(transaction);
    return crypto.createHash('sha256').update(transactionString).digest('hex');
}

// Function to mine a block using parallel processing
function mineBlock(transactions) {
    console.log('Mining started...');

    const workerData = { transactions, difficultyTarget, numThreads };
    const workers = [];

    for (let i = 0; i < numThreads; i++) {
        workers[i] = new Worker(__filename, { workerData });
        workers[i].on('message', message => {
            if (message.foundBlock) {
                workers.forEach(worker => worker.terminate());
                console.log('Block mined successfully.');
                console.log('Block Hash:', message.blockHash);
                console.log('Nonce:', message.nonce);
            }
        });
    }
}

// Mining logic for each worker thread
if (!isMainThread) {
    const { transactions, difficultyTarget, numThreads } = workerData;
    const threadId = parseInt(require('worker_threads').threadId);

    const startNonce = threadId * Math.floor(Number.MAX_SAFE_INTEGER / numThreads);
    const endNonce = (threadId + 1) * Math.floor(Number.MAX_SAFE_INTEGER / numThreads);

    for (let nonce = startNonce; nonce < endNonce; nonce++) {
        const blockData = JSON.stringify({ transactions, nonce });
        const blockHash = crypto.createHash('sha256').update(blockData).digest('hex');

        if (blockHash < difficultyTarget) {
            parentPort.postMessage({ foundBlock: true, blockHash, nonce });
            break;
        }
    }
}
