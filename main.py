import json
import os
import hashlib

# Constants
DIFFICULTY_TARGET = "0000ffff00000000000000000000000000000000000000000000000000000000"
BLOCK_SIZE_LIMIT = 4000000  # Assuming block size limit is 4,000,000 bytes

# Function to validate a transaction
def validate_transaction(transaction):
    # Check if transaction has required fields
    if "txid" not in transaction or "vin" not in transaction or "vout" not in transaction:
        return False

    # Validate inputs (vin)
    for vin in transaction["vin"]:
        if "txid" not in vin or "vout" not in vin:
            return False
        # Additional validation rules for inputs

    # Validate outputs (vout)
    for vout in transaction["vout"]:
        if "value" not in vout or "scriptpubkey_asm" not in vout:
            return False
        # Additional validation rules for outputs

    # Additional validation rules for the transaction as a whole

    # Return True if the transaction passes all validation checks
    return True

# Read JSON files from the mempool folder
mempool_folder = "mempool"
transactions = []
for filename in os.listdir(mempool_folder):
    if filename.endswith(".json"):
        with open(os.path.join(mempool_folder, filename)) as file:
            transaction_data = json.load(file)
            transactions.append(transaction_data)

# Validate and filter valid transactions
valid_transactions = []
for transaction in transactions:
    if validate_transaction(transaction):
        valid_transactions.append(transaction)

# Sort valid transactions by fee in descending order
valid_transactions.sort(key=lambda x: x["fee"], reverse=True)

# Calculate total fee and block size
total_fee = 0
block_size = 0
mined_transactions = []
for transaction in valid_transactions:
    transaction_size = len(json.dumps(transaction))
    if block_size + transaction_size <= BLOCK_SIZE_LIMIT:
        mined_transactions.append(transaction)
        total_fee += transaction["fee"]
        block_size += transaction_size

# Create the block header
block_header = f"Block Header: Difficulty Target={DIFFICULTY_TARGET}"

# Create the coinbase transaction
coinbase_transaction = {
    "txid": "coinbase",
    "vin": [],
    "vout": [{"value": total_fee, "scriptpubkey_asm": "coinbase_script"}]
}

# Mine the block
nonce = 0
block_hash = ""
while block_hash[:16] != DIFFICULTY_TARGET:
    block_data = json.dumps([block_header, coinbase_transaction] + mined_transactions + [nonce])
    block_hash = hashlib.sha256(block_data.encode()).hexdigest()
    nonce += 1

# Write the output file
with open("output.txt", "w") as output_file:
    output_file.write(f"{block_header}\n")
    output_file.write(f"{json.dumps(coinbase_transaction)}\n")
    output_file.write(f"{coinbase_transaction['txid']}\n")
    for transaction in mined_transactions:
        output_file.write(f"{transaction['txid']}\n")