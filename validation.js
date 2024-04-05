const fs = require('fs');

// Define the path to the mempool folder
const mempoolFolderPath = './mempool';

// Arrays to store valid and invalid transactions
const validTransactions = [];
const invalidTransactions = [];

// Read the list of files in the mempool folder
fs.readdir(mempoolFolderPath, (err, files) => {
    if (err) {
        console.error('Error reading mempool folder:', err);
        return;
    }

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
                    validTransactions.push({ filename: file, transaction });
                } else {
                    invalidTransactions.push({ filename: file, transaction });
                }
            } catch (parseError) {
                console.error(`Error parsing JSON in file ${file}:`, parseError);
            }

            // If all files have been processed, write the transactions to output.txt
            if (validTransactions.length + invalidTransactions.length === files.length) {
                writeTransactions(validTransactions, invalidTransactions);
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

// Function to write transactions to output.txt
function writeTransactions(validTransactions, invalidTransactions) {
    const output = `Valid Transactions:\n${JSON.stringify(validTransactions, null, 2)}\n\nInvalid Transactions:\n${JSON.stringify(invalidTransactions, null, 2)}`;
    fs.writeFile('output.txt', output, err => {
        if (err) {
            console.error('Error writing output to file:', err);
        } else {
            console.log('Output file generated successfully.');
        }
    });
}
