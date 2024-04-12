import json
import hashlib
import sys
import os
import binascii

# Calculate the block hash
def calculate_block_hash(block_header):
    block_header_bin = binascii.unhexlify(block_header)
    block_hash = hashlib.sha256(hashlib.sha256(block_header_bin).digest()).digest()
    return block_hash[::-1].hex()

# Validate a transaction
def validate_transaction(transaction):
    try:
        vin = transaction.get('vin', [])
        vout = transaction.get('vout', [])
        
        # Validate each input (vin)
        for input in vin:
            prevout = input.get('prevout', {})
            scriptpubkey_type = prevout.get('scriptpubkey_type', '')
            scriptpubkey_address = prevout.get('scriptpubkey_address', '')
            value = prevout.get('value', 0)
            
            # Perform basic checks on input
            if scriptpubkey_type not in ['v0_p2wpkh', 'v1_p2tr']:  # Valid scriptpubkey types
                return False
            if not scriptpubkey_address.startswith('bc1'):  # Valid Bitcoin address format
                return False
            if value <= 0:  # Positive value for input
                return False
        
        # Validate each output (vout)
        for output in vout:
            scriptpubkey_type = output.get('scriptpubkey_type', '')
            scriptpubkey_address = output.get('scriptpubkey_address', '')
            value = output.get('value', 0)
            
            # Perform basic checks on output
            if scriptpubkey_type not in ['v0_p2wpkh', 'v1_p2tr']:  # Valid scriptpubkey types
                return False
            if not scriptpubkey_address.startswith('bc1'):  # Valid Bitcoin address format
                return False
            if value <= 0:  # Positive value for output
                return False
        
        return True  # Transaction is valid if all checks pass
    
    except Exception as e:
        print(f"Error validating transaction: {str(e)}")
        return False

# Mine a block
def mine_block(transactions, prev_block_hash, difficulty_target):
    nonce = 0  # Initialize nonce to 0
    while True:
        block_header = prev_block_hash + format(nonce, '08x')  # Append nonce to block header
        block_hash = calculate_block_hash(block_header)
        
        # Check if block hash meets the difficulty target
        if block_hash < difficulty_target:
            # Serialize coinbase transaction (first valid transaction)
            valid_transactions = [tx for tx in transactions if validate_transaction(tx)]
            if not valid_transactions:
                raise Exception("No valid transactions to mine.")
                
            coinbase_transaction = valid_transactions[0]
            txid_list = [tx['vin'][0]['txid'] for tx in valid_transactions]
            
            return block_header, block_hash, coinbase_transaction, txid_list
        
        nonce += 1  # Increment nonce if hash does not meet target

def main():
    # Path to mempool folder containing transaction files
    mempool_folder = "./mempool"
    transactions = []
    
    try:
        # Read all transaction files from mempool folder
        for filename in os.listdir(mempool_folder):
            with open(os.path.join(mempool_folder, filename), 'r') as file:
                transaction_data = json.load(file)
                transactions.append(transaction_data)
        
        print(f"Number of transactions read: {len(transactions)}")
        
        # Validate transactions
        valid_transactions = [tx for tx in transactions if validate_transaction(tx)]
        print(f"Number of valid transactions: {len(valid_transactions)}")
        
        if not valid_transactions:
            print("No valid transactions to mine. Exiting.")
            sys.exit(0)
        
        # Previous block hash (placeholder for demonstration)
        prev_block_hash = "0000000000000000000000000000000000000000000000000000000000000000"
        # Difficulty target
        difficulty_target = "0000ffff00000000000000000000000000000000000000000000000000000000"
        
        # Mine the block
        mined_block_header, mined_block_hash, coinbase_transaction, txid_list = mine_block(transactions, prev_block_hash, difficulty_target)
        
        # Output block header and mined transactions
        with open("output.txt", 'w') as output_file:
            output_file.write(mined_block_header + "\n")
            output_file.write(json.dumps(coinbase_transaction) + "\n")  # Serialize coinbase transaction
            for txid in txid_list:
                output_file.write(txid + "\n")  # Write transaction ID to file
        
    
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
