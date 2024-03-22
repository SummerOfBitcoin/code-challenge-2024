const { processTransactions } = require('./process_transactions');

// Function to construct the block

function constructBlock() {
    const { validTransactions } = processTransactions();

    // Construct the block with valid transactions
    const block = {
        transactions: validTransactions,
        // Add other block details like version, timestamp, previous block hash, etc.
    };

    return block;
}

module.exports = { constructBlock };
