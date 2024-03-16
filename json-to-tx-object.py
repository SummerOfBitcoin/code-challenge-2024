# STEP 1: Run using `python3 json-to-tx-object.py mempool/bad-0e71cf1ed24c5354e48846486e1075d5aa37f437bcc6dedf57022be0657cfcef.json`

import json
import sys

from test_framework.messages import COutPoint, CTransaction, CTxIn, CTxOut
from test_framework.script import sha256

def parse_transaction(json_data):
    try:
        transaction = json.loads(json_data)

        tx = CTransaction()

        # Extract relevant fields
        # txid = transaction.get('txid')
        version = transaction.get('version')
        tx.nVersion = version
        print("Version:", version)

        locktime = transaction.get('locktime')
        tx.nLockTime = locktime
        print("Locktime:", locktime)

        vin = transaction.get('vin')
        vout = transaction.get('vout')

        # Print or return the extracted data
        # print("Transaction ID:", txid)

        print("Inputs:")
        tx.vin = []
        for input_ in vin:
            tx.vin.append(CTxIn(COutPoint(int(input_.get('txid'), 16), input_.get('vout')), nSequence=input_.get('sequence')))
            print("\tTransaction ID:", input_.get('txid'))
            print("\tVout:", input_.get('vout'))
            print("\tPrevout scriptpubkey:", input_.get('prevout').get('scriptpubkey'))
            print("\tPrevout scriptpubkey_asm:", input_.get('prevout').get('scriptpubkey_asm'))
            print("\tPrevout scriptpubkey_type:", input_.get('prevout').get('scriptpubkey_type'))
            print("\tPrevout scriptpubkey_address:", input_.get('prevout').get('scriptpubkey_address'))
            print("\tPrevout value:", input_.get('prevout').get('value'))
            print("\tScriptSig:", input_.get('scriptsig'))
            print("\tScriptsig_asm:", input_.get('scriptsig_asm'))
            print("\twitness:", input_.get('witness'))
            print("\tis_coinbase:", input_.get('is_coinbase'))
            print("\tSequence:", input_.get('sequence'))

        print("Outputs:")
        tx.vout = []
        for output in vout:
            tx.vout.append(CTxOut(output.get('value'), bytes.fromhex(output.get('scriptpubkey'))))# is it scriptpubkey or is it scriptpubkey_asm?
            print("\tScriptPubKey:", output.get('scriptpubkey'))
            print("\tscriptpubkey_asm:", output.get('scriptpubkey_asm'))
            print("\tscriptpubkey_type:", output.get('scriptpubkey_type'))
            print("\tscriptpubkey_address:", output.get('scriptpubkey_address'))
            print("\tvalue:", output.get('value'))
        print(tx)

        # STEP 2: calculate the transaction hash
        tx.calc_sha256()
        # STEP 3: calculate hash of the transaction hash
        print("hash of comput txid", sha256(bytes.fromhex(tx.hash)).hex())
        # STEP 4: see if it matches file name
        # print("hash of actual txid", sys.argv[1][8:-5])

        # STEP 5: if STEP 4 is successful, the json parsing logic here is correct yay! Then we:
        #   1. Copy transaction into new file (ex: bad-xxxxx.json)
        #   2. Invalidate it
        #   3. Print hash of newly computed txid and rename file
    except json.JSONDecodeError as e:
        print("Error parsing JSON:", e)

file_path = sys.argv[1]
# Parse the transaction
with open(file_path, 'r') as file:
    json_data = file.read()
    parse_transaction(json_data)

# calculate the hash

# calculate the hash of the hash and see if it matches file name you provided