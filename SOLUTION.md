 ## Design Approach:
 To design a block program, I took a step-by-step approach to ensure that all the necessary components of a valid block are included. The program starts by loading transactions from the mempool directory, validating each transaction, and then selecting the valid transactions to be included in the block. The program then creates a coinbase transaction, calculates the total transaction fees, and constructs the block header. Finally, the program mines the block by finding a hash below the difficulty target and writes the output to a file named output.txt.

## Implementation Details:
 The implementation of the block construction program involves the following steps:

 1. Load transactions from the mempool directory using the fs module.
 2. Validate each transaction using the validateTransaction function, which checks for valid vin and vout, valid signatures, and valid output values.
 3. Select the valid transactions to be included in the block.
 4. Create a coinbase transaction with a reward of 25 BTC plus the total transaction fees.
 5. Calculate the total transaction fees by summing the input values and subtracting the output values for each transaction.
 6. Construct the block header using the getBlockHeader function, which includes the version, prevBlockHash, merkleRoot, timestamp, bits, and nonce.
 7. Mine the block by finding a hash below the difficulty target using the getBlockHash function.
 8. Write the output to a file named output.txt in the specified format.

 ## PseudoCode:
 loadTransactions() {
  transactions = []
  fs.readdirSync(mempoolDir).forEach(file => {
    transaction = JSON.parse(fs.readFileSync(file, 'utf8'))
    transactions.push(transaction)
  })
}

validateTransaction(transaction) {
  if (!transaction.vin || transaction.vin.length === 0 ||!transaction.vout || transaction.vout.length === 0) {
    return false
  }
  transaction.vin.forEach(input => {
    if (!input.prevout.txid) {
      return false
    }
    messageHash = crypto.createHash('sha256')
    messageHash.update(input.prevout.txid)
    publicKey = recoverPubKey(messageHash.digest(), input.scriptSig)
    isValid = secp256k1.verify(messageHash.digest(), input.scriptSig, publicKey)
    if (!isValid) {
      return false
    }
  })
  transaction.vout.forEach(output => {
    if (output.value <= 0) {
      return false
    }
  })
  return true
}

createCoinbaseTransaction() {
  coinbaseTransaction = {
    version: 1,
    locktime: 0,
    vin: [{
      prevout: {
        txid: '0000000000000000000000000000000000000000000000000000000000000000',
        value: 2500000 + totalFees
      }
    }],
    vout: [{
      scriptpubkey: '76a9146085312a9c500ff9cc35b571b0a1e5efb7fb9f1688ac',
      scriptpubkey_asm: 'OP_DUP OP_HASH160 OP_PUSHBYTES_20 6085312a9c500ff9cc35b571b0a1e5efb7fb9f16 OP_EQUALVERIFY OP_CHECKSIG',
      scriptpubkey_type: 'p2pkh',
      scriptpubkey_address: '19oMRmCWMYuhnP5W61ABrjjxHc6RphZh11',
      value: 0
    }]
  }
}

constructBlockHeader() {
  blockHeader = {
    version: 1,
    prevBlockHash: '0000000000000000000000000000000000000000000000000000000000000000',
    merkleRoot: getMerkleRoot(validTransactions.concat([coinbaseTransaction])),
    timestamp: Math.floor(Date.now() / 1000),
    bits: "0000ffff00000000000000000000000000000000000000000000000000000000",
    nonce: 0
  }
}

mineBlock() {
  blockHash = getBlockHash(blockHeader)
  while (blockHash > '0x0000ffff000000000000000000000000000000000000000000000000000000000') {
    blockHeader.nonce++
    blockHash = getBlockHash(blockHeader)
  }
}

writeOutput() {
  fs.writeFileSync('output.txt', `${getBlockHeaderString(blockHeader)}\n`)
  fs.appendFileSync('output.txt', `${getTransactionString(coinbaseTransaction)}\n`)
  validTransactions.forEach(transaction => {
    fs.appendFileSync('output.txt', `${getTransactionString(transaction)}\n`)
  })
}

