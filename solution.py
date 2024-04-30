import os
import json

# reading the mempool transactions from JSON files
def read_mempool():
    transactions = []
    files = os.listdir('./mempool')
    for file in files:
        try:
            with open(f'./mempool/{file}', 'r') as f:
                transaction = json.load(f)
                transactions.append(transaction)
        except Exception as err:
            print(f"Error reading file {file}: {err}")
    return transactions

# Validate transactions (dummy implementation)
def validate_transactions(transactions):
    return transactions

# Generate block header
def generate_block_header():
    previous_block_hash = '00000000000000000000000000000000'  # Placeholder for previous block hash
    timestamp = int(time.time())  # Current timestamp in seconds
    difficulty_target = '0000ffff00000000000000000000000000000000000000000000000000000000'  # difficulty target
    nonce = 0
    return previous_block_hash + str(timestamp) + difficulty_target + str(nonce)

# Serialize coinbase transaction
def serialize_coinbase_transaction():
    coinbase_tx_data = [
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
    ]
    return ''.join(coinbase_tx_data)

# Extract transaction IDs
def extract_tx_ids(transactions):
    return [transaction['txid'] for transaction in transactions]

# Write output to output.txt
def write_output(block_header, coinbase_transaction, txids):
    output = '\n'.join([block_header, coinbase_transaction] + txids)
    with open('output.txt', 'w') as f:
        f.write(output)

def main():
    mempool = read_mempool()
    valid_transactions = validate_transactions(mempool)
    block_header = generate_block_header()
    coinbase_transaction = serialize_coinbase_transaction()
    txids = extract_tx_ids(valid_transactions)
    write_output(block_header, coinbase_transaction, txids)

# Call the main function
if __name__ == "__main__":
    main()
