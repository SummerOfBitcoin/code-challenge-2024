import os
import json
import hashlib
import time
from typing import List, Dict

# Set the difficulty target
DIFFICULTY_TARGET = 0000ffff00000000000000000000000000000000000000000000000000000000

# Define the function to validate transactions
def is_valid_transaction(tx: Dict) -> bool:
    # Check if the transaction has the required keys
    required_keys = ['txid', 'version', 'locktime', 'vin', 'vout', 'size', 'weight', 'fee', 'status']
    if not all(key in tx for key in required_keys):
        return False

    # Check if input transactions are valid
    for vin in tx['vin']:
        if not is_valid_input(vin, tx['vout']):
            return False

    # Check if output values are non-negative
    if any(vout['value'] < 0 for vout in tx['vout']):
        return False

   #Need to insert all the functions I created in SECTIONS folder

    return True


def is_valid_input(vin: Dict, vout: List[Dict]) -> bool:
    
    txid = vin['txid']
    vout_index = vin['vout']
    for tx_vout in vout:
        if txid == tx_vout['txid'] and vout_index == tx_vout['vout']:
            return True

    return False

# Define the function to mine the block
def mine_block(transactions: List[Dict]) -> (Dict, bytes, List[str]):
    # Create the block header
    version = 1 or 2
    block_header = {
        'version': version,
        'prev_block_hash': '0000000000000000000000000000000000000000000000000000000000000000',
        'merkle_root': calculate_merkle_root(transactions),
        'timestamp': int(time.time()),
        'bits': '%064x' % DIFFICULTY_TARGET,
        'nonce': 0
    }

    # Serialize the block header
    header_bin = serialize_header(block_header)

    # Mine the block by incrementing the nonce until the hash meets the target
    while True:
        block_hash = hashlib.sha256(hashlib.sha256(header_bin).digest()).digest()[::-1].hex()
        if int(block_hash, 16) < DIFFICULTY_TARGET:
            break
        block_header['nonce'] += 1
        header_bin = serialize_header(block_header)

    # Create the coinbase transaction
    coinbase_tx = create_coinbase_transaction()

    # Serialize the coinbase transaction
    coinbase_tx_serialized = serialize_transaction(coinbase_tx)
    return block_header, coinbase_tx_serialized, [coinbase_tx['txid']] + [tx['txid'] for tx in transactions]

def calculate_merkle_root(transactions: List[Dict]) -> str:
    
    tx_hashes = [bytes.fromhex(tx['txid']) for tx in transactions]
    if not tx_hashes:
        return '0' * 64
    else:
        return hashlib.sha256(b''.join(tx_hashes)).hexdigest()

def serialize_header(header: Dict) -> bytes:
    
    version = header['version'].to_bytes(4, byteorder='little')
    prev_block_hash = bytes.fromhex(header['prev_block_hash'])
    merkle_root = bytes.fromhex(header['merkle_root'])
    timestamp = header['timestamp'].to_bytes(4, byteorder='little')
    bits = bytes.fromhex(header['bits'])
    nonce = header['nonce'].to_bytes(4, byteorder='little')
    return version + prev_block_hash + merkle_root + timestamp + bits + nonce

# Function to create the coinbase transaction
def create_coinbase_transaction() -> Dict:
    
    return {'txid': '0000000000000000000000000000000000000000000000000000000000000000'}

# Function to serialize a transaction
def serialize_transaction(tx: Dict) -> bytes:
  
    return bytes.fromhex(tx['hex'])

# Load transactions from the mempool folder
mempool_dir = 'mempool'
transactions = []
for filename in os.listdir(mempool_dir):
    filepath = os.path.join(mempool_dir, filename)
    if os.path.isfile(filepath):
        with open(filepath, 'r') as file:
            tx = json.load(file)
            if is_valid_transaction(tx):
                transactions.append(tx)

# Mine the block
block_header, coinbase_tx, txids = mine_block(transactions)

# Write the output to output.txt
with open('output.txt', 'w') as file:
    file.write(json.dumps(block_header) + '\n')
    file.write(coinbase_tx.hex() + '\n')
    for txid in txids:
        file.write(txid + '\n')
