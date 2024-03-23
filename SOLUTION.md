# Design Approach:

My approach to designing the block construction program involved several key steps:

<ins>1. Understanding Blockchain Structure:</ins>
- A blockchain is a distributed ledger that contains a sequence of blocks, each containing a set of transactions.
- Each block in the blockchain is cryptographically linked to the previous block, forming a chain.
  
<ins>2. Block Components:</ins>
- Transactions: These are the data entries representing actions or exchanges of value recorded in the blockchain.
- Block Header: Metadata containing essential information about the block, including the hash of the previous block, a Merkle root of transactions, a timestamp, a nonce, and the difficulty target.

<ins>3. Transaction Validation:</ins>
- Before including transactions in a block, they must be validated to ensure they meet certain criteria.
- Common validation checks include ensuring the sender has sufficient funds, verifying transaction signatures, and preventing double spending.
  
<ins>4. Merkle Tree:</ins>
- A Merkle tree is a binary tree structure where leaf nodes are hashes of individual transactions, and non-leaf nodes are hashes of their respective child nodes.
- The root of the Merkle tree, known as the Merkle root, is included in the block header and serves as a summary of all transactions in the block.

<ins>5. Mining Process:</ins>
- Mining is the process of finding a valid block hash that meets the difficulty target.
- Miners adjust the nonce value in the block header and compute the block hash repeatedly until a valid hash is found.
- The difficulty target determines the level of difficulty required to find a valid hash and is adjusted dynamically to maintain a consistent block generation rate.

<ins>6. Coinbase Transaction:</ins>
- The coinbase transaction is a special transaction included in each block that rewards the miner with newly created cryptocurrency.
- It has no inputs and typically contains a reward for the miner and may include transaction fees collected from other transactions in the block.

<ins>7. Constructing the Block:</ins>
- Select transactions from the mempool based on criteria such as transaction fees, priority, etc.
- Include a coinbase transaction with the miner's reward and selected transactions in the block.
- Calculate the Merkle root of transactions and construct the block header with the appropriate information.
- Begin the mining process by adjusting the nonce and computing the block hash until a valid hash is found.
  
<ins>8. Block Validation:</ins>
- Once a valid block hash is found, the block is broadcasted to the network for validation.
- Nodes in the network independently verify the validity of the block, including the correctness of transactions and the block hash.
  
By using and incorporating these key concepts, the block construction program, i have created valid blocks for inclusion in the blockchain, ensuring the security of the decentralized ledger system.

---

## Implementation Details:

This pseudo code outlines the sequence of logic, algorithms, and variables used in the implementation. It provides a high-level overview of how transactions are validated, blocks are constructed, and mining is performed in the simplified Bitcoin implementation.

```
1. Define Transaction class:
    - Properties:
        - sender: The address of the sender of the transaction.
        - receiver: The address of the receiver of the transaction.
        - amount: The amount of cryptocurrency being transferred.
        - signature: The digital signature of the transaction.
    - Methods:
        - calculateHash(): Computes the hash of the transaction data.

2. Define Block class:
    - Properties:
        - transactions: An array of Transaction objects representing the transactions included in the block.
        - previousHash: The hash of the previous block in the blockchain.
        - timestamp: The timestamp indicating when the block was created.
        - nonce: A counter used in the mining process.
        - hash: The hash of the current block.
    - Methods:
        - calculateHash(): Computes the hash of the block using its properties.
        - mineBlock(difficulty): Mines the block by finding a hash that meets the difficulty target.

3. Define function validateTransactions(transactions):
    - Input: An array of Transaction objects.
    - Output: A boolean indicating whether all transactions are valid.
    - Logic:
        - Iterate over each transaction in the array.
        - For each transaction:
            - Verify the digital signature to ensure it was signed by the sender.
            - Check if the sender has sufficient balance to complete the transaction.
            - Ensure the transaction amount is non-negative.
            - If any validation check fails, return false.
        - If all transactions pass validation, return true.

4. Main logic:
    - Create sample transactions using the Transaction class.
    - Validate transactions using the validateTransactions function.
    - If transactions are invalid, print an error message and exit.
    - Create the genesis block:
        - Set the previousHash to a predefined value (e.g., "0").
        - Set the timestamp to the current time.
        - Set the nonce to 0.
        - Calculate the hash of the genesis block.
    - Mine the genesis block:
        - Choose a difficulty target (e.g., 4 leading zeros in the block hash).
        - Call the mineBlock method of the Block class with the chosen difficulty target.

```
---

# Results and Performance:

My writen script demonstrates a simplified Bitcoin block construction and mining algorithm. It includes basic transaction validation, block hashing, and mining functionality. However, its performance and accuracy heavily depend on the actual implementation details, including the validation logic and mining algorithm. Real-world performance would require rigorous testing and optimization for efficiency, security, and scalability.

## Screenshot
<img width="960" alt="image" src="https://github.com/SummerOfBitcoin/code-challenge-2024-Durgesh4993/assets/98798977/07797543-4a8e-43b7-81b8-0a092aa0b85a">

<img width="960" alt="image" src="https://github.com/SummerOfBitcoin/code-challenge-2024-Durgesh4993/assets/98798977/1cbfd643-e23e-496f-9025-36dbc5be4ce1">

## Demo Video

https://github.com/SummerOfBitcoin/code-challenge-2024-Durgesh4993/assets/98798977/3562efbb-f5ea-4712-9794-3659077d683e




