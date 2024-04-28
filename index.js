const fs = require('fs');
const crypto = require('crypto');
const secp256k1 = require('secp256k1');

// Load transactions from mempool
const mempoolDir = './mempool';
const transactions = [];
fs.readdirSync(mempoolDir).forEach(file => {
  const filePath = `${mempoolDir}/${file}`;
  const transaction = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  transactions.push(transaction);
});

// Validate transactions
const validTransactions = [];
transactions.forEach(transaction => {
  if (validateTransaction(transaction)) {
    validTransactions.push(transaction);
  }
});

// Calculate total transaction fees
let totalFees = 0;
validTransactions.forEach(transaction => {
  transaction.vin.forEach(input => {
    totalFees += input.prevout.value;
  });
  transaction.vout.forEach(output => {
    totalFees -= output.value;
  });
});

// Create coinbase transaction
const coinbaseTransaction = {
  version: 1,
  locktime: 0,
  vin: [{
    prevout: {
      txid: '0000000000000000000000000000000000000000000000000000000000000000',
      value: 2500000 + totalFees // 25 BTC reward + total transaction fees
    }
  }],
  vout: [
    {
      scriptpubkey: '76a9146085312a9c500ff9cc35b571b0a1e5efb7fb9f1688ac',
      scriptpubkey_asm: 'OP_DUP OP_HASH160 OP_PUSHBYTES_20 6085312a9c500ff9cc35b571b0a1e5efb7fb9f16 OP_EQUALVERIFY OP_CHECKSIG',
      scriptpubkey_type: 'p2pkh',
      scriptpubkey_address: '19oMRmCWMYuhnP5W61ABrjjxHc6RphZh11',
      value: 0
    }
  ]
};

// Mine block
const blockHeader = {
  version: 1,
  prevBlockHash: '0000000000000000000000000000000000000000000000000000000000000000',
  merkleRoot: getMerkleRoot(validTransactions.concat([coinbaseTransaction])),
  timestamp: Math.floor(Date.now() / 1000),
  bits: "0000ffff00000000000000000000000000000000000000000000000000000000", // difficulty target
  nonce: 0
};

let blockHash;
do {
  blockHash = getBlockHash(blockHeader);
  blockHeader.nonce++;
} while (blockHash > '0x0000ffff000000000000000000000000000000000000000000000000000000000');

// Write output to file
const outputFile = 'output.txt';
fs.writeFileSync(outputFile, `${getBlockHeaderString(blockHeader)}\n`);
fs.appendFileSync(outputFile, `${getTransactionString(coinbaseTransaction)}\n`);
validTransactions.forEach(transaction => {
  fs.appendFileSync(outputFile, `${getTransactionString(transaction)}\n`);
});

// Helper functions
function validateTransaction(transaction) {
  // Check if transaction has valid vin and vout
  if (!transaction.vin || transaction.vin.length === 0 ||!transaction.vout || transaction.vout.length === 0) {
    return false;
  }

  // Check if transaction has valid signatures
  transaction.vin.forEach(input => {
    const scriptSig = input.scriptSig;
    const scriptPubKey = input.prevout.scriptPubKey;
    if (!input.prevout.txid) {
      return false;
    }
    const messageHash = crypto.createHash('sha256');
    messageHash.update(input.prevout.txid);
    const publicKey = recoverPubKey(messageHash.digest(), scriptSig);
    const isValid = secp256k1.verify(messageHash.digest(), scriptSig, publicKey);
    if (!isValid) {
      return false;
    }
  });

  // Check if transaction outputs are valid
  transaction.vout.forEach(output => {
    if (output.value <= 0) {
      return false;
    }
  });

  return true;
}

function recoverPubKey(messageHash, signature) {
  const recoveredKeys = [];
  const secp256k1n = BigInt('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141');
  const signatureBytes = Buffer.from(signature, 'hex');
  const r = BigInt(signatureBytes.slice(0, 32).toString('hex'));
  const s = BigInt(signatureBytes.slice(32, 64).toString('hex'));
  const recoveryId = signatureBytes[64];
  const publicKey = secp256k1.publicKeyCreate(Buffer.from('00', 'hex'));
  const publicKeyPoint = secp256k1.publicKeyTweakAdd(publicKey, recoveryId === 27 ? secp256k1n - r : r);
  recoveredKeys.push(publicKeyPoint);
  return recoveredKeys;
}

function getMerkleRoot(transactions) {
  const hashes = transactions.map(transaction => {
    const txHash = crypto.createHash('sha256');
    txHash.update(JSON.stringify(transaction));
    return txHash.digest('hex');
  });

  function merkleRoot(hashes) {
    if (hashes.length === 1) {
      return hashes[0];
    }

    const newHashes = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const hash1 = hashes[i];
      const hash2 = hashes[i + 1] || hash1;
      const combinedHash = crypto.createHash('sha256');
      combinedHash.update(Buffer.concat([Buffer.from(hash1, 'hex'), Buffer.from(hash2, 'hex')]));
      newHashes.push(combinedHash.digest('hex'));
    }

    return merkleRoot(newHashes);
  }

  return merkleRoot(hashes);
}

function getBlockHash(blockHeader) {
  const blockHeaderBuffer = Buffer.concat([
    Buffer.from(blockHeader.version.toString(), 'hex'),
    Buffer.from(blockHeader.prevBlockHash, 'hex'),
    Buffer.from(blockHeader.merkleRoot, 'hex'),
    Buffer.from(blockHeader.timestamp.toString(), 'hex'),
    Buffer.from(blockHeader.bits, 'hex'),
    Buffer.from(blockHeader.nonce.toString(), 'hex')
  ]);
  const blockHash = crypto.createHash('sha256');
  blockHash.update(blockHeaderBuffer);
  return crypto.createHash('sha256').update(blockHash.digest()).digest('hex');
}

function getBlockHeaderString(blockHeader) {
  return `${blockHeader.version} ${blockHeader.prevBlockHash} ${blockHeader.merkleRoot} ${blockHeader.timestamp} ${blockHeader.bits} ${blockHeader.nonce}`;
}

function getTransactionString(transaction) {
  return JSON.stringify(transaction);
}