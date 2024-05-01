import json
import os
from hashlib import sha256, new as new_hash
import struct
import ecdsa
import base58

DUST_THRESHOLD = 1e-6  # Fee rate (satoshi per byte)
BLOCK_SIZE_LIMIT = 80  # 1MB block size limit
DIFFICULTY_TARGET = "0000ffff00000000000000000000000000000000000000000000000000000000"

def decode_base58(address, length=25):
    num = base58.b58decode(address)
    return num[1:-4]  # Strip the version byte and checksum

def ripemd160(data):
    h = new_hash('ripemd160')
    h.update(data)
    return h.digest()

def validate_p2pkh(tx):
    pubkey = tx['pubkey'].encode('utf-8')
    sig = bytes.fromhex(tx['sig'])
    txid = tx['txid'].encode('utf-8')
    address = tx['address']

    expected_address = ripemd160(sha256(pubkey).digest())
    decoded_address = decode_base58(address)
    if expected_address != decoded_address:
        return False

    vk = ecdsa.VerifyingKey.from_string(pubkey, curve=ecdsa.SECP256k1)
    try:
        return vk.verify(sig, txid)
    except ecdsa.BadSignatureError:
        return False

def validate_transaction(tx):
    if tx['type'] == 'p2pkh':
        return validate_p2pkh(tx)
    else:
        return False  # Placeholder for unsupported types

def calculate_fee_rate(tx):
    return tx['fee'] / tx['size']

def is_dust_transaction(tx):
    fee_rate = calculate_fee_rate(tx)
    return fee_rate < DUST_THRESHOLD

def read_transactions(directory="mempool"):
    transactions = []
    for filename in os.listdir(directory):
        if filename.endswith('.json'):
            with open(os.path.join(directory, filename), 'r') as file:
                try:
                    tx_data = json.load(file)
                    transactions.append(tx_data)
                except json.JSONDecodeError:
                    continue  # Skip files that do not contain valid JSON
    return transactions

def select_transactions_for_block(valid_transactions):
    non_dust_transactions = [tx for tx in valid_transactions if not is_dust_transaction(tx)]
    sorted_transactions = sorted(non_dust_transactions, key=calculate_fee_rate, reverse=True)

    selected_transactions = []
    block_size = 0
    for tx in sorted_transactions:
        if block_size + tx['size'] <= BLOCK_SIZE_LIMIT:
            selected_transactions.append(tx)
            block_size += tx['size']
        else:
            break
    return selected_transactions

def compute_merkle_root(transaction_ids):
    if not transaction_ids:
        return ''
    while len(transaction_ids) > 1:
        if len(transaction_ids) % 2 == 1:
            transaction_ids.append(transaction_ids[-1])
        new_level = []
        for i in range(0, len(transaction_ids), 2):
            new_hash = sha256(sha256((transaction_ids[i] + transaction_ids[i + 1]).encode()).digest()).hexdigest()
            new_level.append(new_hash)
        transaction_ids = new_level
    return transaction_ids[0]

def serialize_transaction(tx):
    """Serialize a transaction for inclusion in a block."""
    # Simplified serialization: only txid for example, real implementation would be more complex
    return tx['txid'].encode()

def serialize_block(transactions, nonce, previous_block_hash, merkle_root):
    """Serialize the block with transactions and header info."""
    block_data = b''.join(serialize_transaction(tx) for tx in transactions)
    header_info = struct.pack('>4s32s32sQ4s4s', b'\x01\x00\x00\x00', bytes.fromhex(previous_block_hash), bytes.fromhex(merkle_root), int(time.time()), bytes.fromhex('ffff001d'), struct.pack('>I', nonce))
    return header_info + block_data

def simulate_mining(transactions, difficulty_target, miner_address, block_reward):
    transaction_fees = sum(tx.get('fee', 0) for tx in transactions)
    coinbase_tx = create_coinbase_transaction(miner_address, block_reward, transaction_fees)
    transactions = [coinbase_tx] + transactions

    transaction_ids = [tx['txid'] for tx in transactions]
    merkle_root = compute_merkle_root(transaction_ids)

    nonce = 0
    while True:
        block_header = serialize_block(transactions, nonce, "0000000000000000000000000000000000000000000000000000000000000000", merkle_root)
        block_hash = sha256(block_header).hexdigest()
        if int(block_hash, 16) < int(DIFFICULTY_TARGET, 16):
            break
        nonce += 1
    return nonce, block_hash

def main():
    miner_address = '1KFHE7w8BhaENAswwryaoccDb6qcT6DbYY'
' 
    block_reward = 6.25  # Current Bitcoin block reward

    transactions = read_transactions()
    valid_transactions = [tx for tx in transactions if validate_transaction(tx)]
    optimized_transactions = select_transactions_for_block(valid_transactions)
    
    nonce, block_hash = simulate_mining(optimized_transactions, DIFFICULTY_TARGET, miner_address, block_reward)
    
    with open('output.txt', 'w') as f:
        f.write(f"Block Header: {block_hash}\nNonce: {nonce}\n")
        for tx in optimized_transactions:
            f.write(f"{tx['txid']}\n")

if __name__ == '__main__':
    main()
