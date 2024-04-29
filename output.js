// Import the file system module
const fs = require('fs');

// it is the main function
function main() {
    const mempool = readMempool();
    const validTransactions = validateTransactions(mempool);
    const blockHeader = generateBlockHeader();
    const coinbaseTransaction = serializeCoinbaseTransaction();
    const txids = extractTxIds(validTransactions);
    writeOutput(blockHeader, coinbaseTransaction, txids);
}

// reading the mempool transactions from JSON files
function readMempool() {
    const transactions = [];
    const files = fs.readdirSync('./mempool');
    for (const file of files) {
        try {
            const data = fs.readFileSync(`./mempool/${file}`, 'utf8');
            const transaction = JSON.parse(data);
            transactions.push(transaction);
        } catch (err) {
            console.error(`Error reading file ${file}: ${err}`);
        }
    }
    return transactions;
}

// Validate transactions (dummy implementation)
function validateTransactions(transactions) {
    return transactions;
}

// Generate block header
function generateBlockHeader() {
    const previousBlockHash = '00000000000000000000000000000000'; // Placeholder for previous block hash
    const timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    const difficultyTarget = '0000ffff00000000000000000000000000000000000000000000000000000000'; // difficulty target
    const nonce = 0; 
    return previousBlockHash + timestamp.toString() + difficultyTarget + nonce.toString();
}

// Serialize coinbase transaction
function serializeCoinbaseTransaction() {
// Construct the coinbase transaction data
    const coinbaseTxData = [
        '01000000', 
        '01', 
        '0000000000000000',
        'ffffffff', 
        '04ffff001d', 
        'ffffffffffffffff', 
        '01', 
        '00f2052a01000000', 
        '17a914000000000000000000000000000000000000000087', 
        '00000000' 
    ];
    return coinbaseTxData.join('');
}

// Extract transaction IDs
function extractTxIds(transactions) {
    return transactions.map(transaction => transaction.txid);
}

// Write output to output.txt
console.log('Current directory:', process.cwd());

function writeOutput(blockHeader, coinbaseTransaction, txids) {
    const output = [blockHeader, coinbaseTransaction, ...txids].join('\n');
    fs.writeFileSync('output.txt', output);
}

// Call the main function
main();