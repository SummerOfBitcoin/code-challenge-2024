import os
import json
import pandas as pd
import ecdsa
import time
from hashlib import sha256
from ecdsa import VerifyingKey, SECP256k1
from base64 import b64decode

from serelization import Serelization, dsha, rev, sha, little_endian, transaction_id, remove_json, testing, checking_ptr, wtxid_Serelization
from conversion import encode


def coinbase_txid_fn(coinbase_json_data):
    Raw_transaction_data = wtxid_Serelization(coinbase_json_data)
    txid = transaction_id(Raw_transaction_data)

    return txid

'''
Txid_list must contain txids in natural byte order + coinbase transaction
'''

def merkleroot(Txid_list):
    # here coinbase txid must be in in natural byte order 

    txids = Txid_list
    if len(txids) == 1:
        return txids[0]
    
    result = []
    # Txid in in natural byte order in merkle root.
    for i in range(0, len(txids), 2):
        one = txids[i]
        if i + 1 < len(txids):
            two = txids[i + 1]
        else:
            two = one
        
        concat = one + two
        
        result.append(dsha(concat))
    
    return merkleroot(result)

def transaction_count(transaction_list):
    # 1 for coinbase.
    total_no = len(transaction_list) + 1
    count = encode(total_no)
    return count


def block(merkle_root, bits, nonce, transaction_count, coinbase_txid, transaction_list):
    
    # Block Header.
    # verison - 4bytes in little endian.
    version = '20000000'

    # previous block hash - 32 bytes and normal byte order.
    previous_block_hash = '00000000000000000000edfa4600a4f4d631607aee815632ed1b27c2b5c362b8'

    # Merkle_root - size is 32 bytes and normal byte order.
    merkle_root = merkle_root

    # Time - 4 bytes and Little-endian
    # little_endian_time  = '6d3f2f66'

    # Bits - sizeis 4 bytes and it is compact representation of the difficulty target.
    bits = '1f00ffff'

    # nonce - 4bytes and format little endian
    nonce = nonce

    # transaction_count - compat format
    transaction_count = transaction_count

    # coinbase transaction - in reverse byte order
    coinbase_transaction = coinbase_transaction

    # Transaction list - reverse byte oreder.
    transaction_list = transaction_list


def block_header(version, previous_block_hash, merkle_root, nonce):
    
    version = rev(version)
    block_head_raw = version

    previous_block_hash = rev(previous_block_hash)
    block_head_raw += previous_block_hash

    merkle_root = merkle_root
    block_head_raw += merkle_root

    # Time - 4 bytes and Little-endian
    current_unix_time = int(time.time())
    time_little_endian  = little_endian(current_unix_time, 4)
    block_head_raw += time_little_endian

    # Bits - sizeis 4 bytes and it is compact representation of the difficulty target.
    bits = '1f00ffff'
    bits = rev(bits)
    block_head_raw += bits

    # nonce - 4bytes and format little endian
    nonce = nonce
    nonce = little_endian(nonce, 4)
    block_head_raw += nonce

    return block_head_raw


def wtxid_commitment(wtxid_list):
    # merkle root for all of the wTXIDs
    # Txid in in natural byte order in merkle root
    witness_root_hash = rev(merkleroot(wtxid_list))

    witness_reserved_value = '0000000000000000000000000000000000000000000000000000000000000000'
    wTXID_commitment = dsha(witness_root_hash+ witness_reserved_value)
    return wTXID_commitment
