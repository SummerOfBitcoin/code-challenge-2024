const fs = require('fs');
const { validateTransaction } = require('./transaction_validator');

const mempoolFolder = './mempool';

// Function to read and validate transactions
function processTransactions() {
    const validTransactions = [];
    const invalidTransactions = [];

    fs.readdirSync(mempoolFolder).forEach(file => {
        const transaction = JSON.parse(fs.readFileSync(`${mempoolFolder}/${file}`, 'utf-8'));
        
        if (validateTransaction(transaction)) {
            validTransactions.push(transaction);
        } else {
            invalidTransactions.push(transaction);
        }
    });

    return { validTransactions, invalidTransactions };
}

module.exports = { processTransactions };
