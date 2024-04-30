import os
import json
import pandas as pd
import ecdsa
import time
from hashlib import sha256
from ecdsa import VerifyingKey, SECP256k1
from base64 import b64decode

from serelization import Serelization, dsha, rev, sha, little_endian, transaction_id, remove_json, testing, checking_ptr, total_fees_df, wtxid_Serelization
from conversion import encode
from block import merkleroot, coinbase_txid_fn, block_header, wtxid_commitment

'''
TODO :
Validate the transactions if it is valid or not.
'''

folder_path = 'mempool'


def files_extraction(folder_path):
    file_names = os.listdir(folder_path)
    return file_names

total_file_names = files_extraction((folder_path))

valid_files_name = []  # this will contain all valid and serilized files
# valid txids
valid_txids_RBO = []
valid_txids_NBO = []
valid_wtxids_RBO = []
valid_wtxids_NBO = []
Total_Number_of_correct_serilization = 0
Total_Number_of_Incorrect_serlization = 0
total_fees = 0


for i in range(len(total_file_names)):

    file_name = total_file_names[i]
    file_path = f'{folder_path}/{file_name}'
    with open(file_path, 'r') as file:
        transaction_json_data = json.load(file)

    # file name value
    file_name_without_json = remove_json(file_name)

    # calling function for raw transaction
    Raw_transaction_data = Serelization(transaction_json_data)
    # txid in reverse byte order.
    txid = transaction_id(Raw_transaction_data)

    # testing txid if it matches with file value name
    if testing(txid, file_name_without_json) == True and checking_ptr(transaction_json_data) == True:
        Total_Number_of_correct_serilization += 1
        valid_files_name.append(file_name_without_json)
        
        valid_txids_RBO.append(txid)
        valid_txids_NBO.append(rev(txid))

        # Raw transaction data  for wtxid
        Raw_transaction_data_wtxid = wtxid_Serelization(transaction_json_data)
        # Wtxid in reverse byte order
        wtxid = transaction_id(Raw_transaction_data_wtxid)

        valid_wtxids_RBO.append(wtxid)
        valid_wtxids_NBO.append(rev(wtxid))

        fees = total_fees_df(transaction_json_data)
        total_fees += fees

    else :
        Total_Number_of_Incorrect_serlization += 1

    # print(f"Epoch {i} and {file_name}")

# Wtxid_commitment = wtxid_commitment(valid_wtxids_NBO)
# print(Wtxid_commitment)

# Converting array into string 
valid_files_name = ','.join(map(str, valid_files_name))
file_path = "Valid_p2tr_files.txt"
with open(file_path, 'w') as file:
    file.write(valid_files_name)

valid_txids = ','.join(map(str, valid_txids_RBO))
file_path = "Valid_txids.txt"
with open(file_path, 'w') as file:
    file.write(valid_txids)


# Coinbase txid 
file_path = 'coinbase_transaction.json'
with open(file_path, 'r') as file:
    coinbase_json_data = json.load(file)

coinbase_txid = coinbase_txid_fn(coinbase_json_data)
coinbase_txid_NBO = rev(coinbase_txid)
valid_txids_NBO.insert(0, coinbase_txid_NBO)


merkle_root = merkleroot(valid_txids_NBO)
version = "20000000"
target = '0000ffff00000000000000000000000000000000000000000000000000000000'
previous_block_hash = "00000000000000000000edfa4600a4f4d631607aee815632ed1b27c2b5c362b8"
nonce = 0

# Proof of work

while True:

    # block Header serilization 
    Block_Header = block_header(version, previous_block_hash, merkle_root, nonce)
    result = dsha(Block_Header)
    result = rev(result)


    # end if we get a block hash below the target
    if int(result, 16) < int(target, 16):
        break
    nonce += 1

print("Final_nonce:", nonce)
Final_nonce = nonce



# Output.txt
Block_header = block_header(version, previous_block_hash, merkle_root, Final_nonce)
Coinbase_serilize_transaction_data = Serelization(coinbase_json_data)

with open("output.txt", "w") as file:
    file.write(Block_header + "\n")
    
    file.write(Coinbase_serilize_transaction_data + "\n")
    
    file.write(coinbase_txid + "\n")
    # Write the transaction IDs (txids)
    for txid in valid_txids_RBO:
        file.write(txid + "\n")

