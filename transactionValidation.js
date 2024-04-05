const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Placeholder object to store processed transaction hashes
const processedTransactions = {};

// Step 3: Validate transaction structure
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

// Step 4: Validate transaction fields
function validateTransactionFields(transaction) {
  // Implement validation logic for fields (e.g., sender, receiver, amount)
  // Example: Check if sender, receiver, and amount are non-empty strings
  return (
    typeof transaction.sender === 'string' && transaction.sender.trim() !== '' &&
    typeof transaction.receiver === 'string' && transaction.receiver.trim() !== '' &&
    typeof transaction.amount === 'number' && transaction.amount > 0
  );
}

// Step 5: Validate transaction signatures (placeholder)
function validateTransactionSignature(transaction) {
  // Placeholder implementation for signature validation
  // Replace this with your actual signature validation logic
  // For simplicity, returning true here assuming all transactions are valid
  return true;
}

// Step 6: Optionally check for duplicate transactions
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

// Step 7: Calculation function for Merkle root
function calculateMerkleRoot(transactions) {
  // Convert transaction hashes to Buffer objects
  const transactionHashes = transactions.map(transaction => crypto.createHash('sha256').update(JSON.stringify(transaction)).digest());

  // Continue hashing pairs of transaction hashes until a single hash (Merkle root) is obtained
  while (transactionHashes.length > 1) {
    const newHashes = [];
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

// Define the path to the mempool folder
const mempoolFolderPath = './mempool';

// Read the list of files in the mempool folder
fs.readdir(mempoolFolderPath, (err, files) => {
  if (err) {
    console.error('Error reading mempool folder:', err);
    return;
  }

  // Iterate through each file in the mempool folder
  files.forEach(file => {
    // Construct the full path to the file
    const filePath = path.join(mempoolFolderPath, file);

    // Read the contents of the file
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file ${file}:`, err);
        return;
      }

      try {
        // Parse the JSON data to extract transaction details
        const transaction = JSON.parse(data);

        // Step 3: Validate transaction structure
        if (!validateTransactionStructure(transaction)) {
          console.log(`Invalid transaction structure in file ${file}`);
          return;
        }

        // Step 4: Validate transaction fields
        if (!validateTransactionFields(transaction)) {
          console.log(`Invalid transaction fields in file ${file}`);
          return;
        }

        // Step 5: Validate transaction signatures (if applicable)
        if (!validateTransactionSignature(transaction)) {
          console.log(`Invalid transaction signature in file ${file}`);
          return;
        }

        // Step 6: Optionally check for duplicate transactions
        if (isDuplicateTransaction(transaction)) {
          console.log(`Duplicate transaction found in file ${file}`);
          return;
        }

        // Step 7: Calculate the Merkle root (if needed)
        const merkleRoot = calculateMerkleRoot([transaction]);
        console.log(`Merkle root for transaction in file ${file}: ${merkleRoot}`);

        // Process the transaction data here
        console.log(`Transaction details from file ${file}:`);
        console.log('Sender:', transaction.sender);
        console.log('Receiver:', transaction.receiver);
        console.log('Amount:', transaction.amount);
        console.log('Timestamp:', transaction.timestamp);

        // You can perform further processing or validation here

      } catch (parseError) {
        console.error(`Error parsing JSON in file ${file}:`, parseError);
      }
    });
  });
});