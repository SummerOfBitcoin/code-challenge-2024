import json
import os
import hashlib
from ecdsa import VerifyingKey, SECP256k1, BadSignatureError
import binascii
import bech32
from Crypto.Hash import RIPEMD160
from ecdsa import VerifyingKey, SECP256k1, util
import binascii
import random
import struct
from itertools import product
from typing import List
import time 

def ripemd160(data):
    h = RIPEMD160.new()
    h.update(data)
    return h.digest()


MEMPOOL_DIR = "mempool" 
TARGET_DIFFICULTY = "0000ffff00000000000000000000000000000000000000000000000000000000" #mentioned in the README.md file
MAX_BLOCK_SIZE = 1000000  #typical size of a block

# Function to calculate the hash with the SHA-256 algorithm
def hash_txid(txid):
    txid_bytes = bytes.fromhex(txid)
    hashed_txid = hashlib.sha256(txid_bytes).hexdigest()
    return hashed_txid

def validate_locktime(transaction):
    # Get the current UNIX timestamp
    current_time = int(time.time())
    # Extract the locktime from the transaction
    transaction_locktime = transaction['locktime']

    # Check if the transaction locktime is a UNIX timestamp
    if transaction_locktime >= 500000000:  # Generally, values above this are treated as timestamps
        # Validate the transaction based on the current time
        if current_time >= transaction_locktime:
            return True
        else:
            return False
    else:
        # If locktime is below the threshold, it's treated as a block height, not applicable here
        return True

#function to return valid transactions from the mempol 
def process_mempool():
    valid_transactions = []
    for filename in os.listdir(MEMPOOL_DIR):
        filepath = os.path.join(MEMPOOL_DIR, filename) 
        with open(filepath, 'r') as file:
            transaction = json.load(file)
            if (validate_locktime(transaction) and validate_transaction_fields(transaction)):
                valid = 1
                for index,vin in enumerate(transaction['vin']):
                    try:
                        if vin["prevout"]["scriptpubkey_type"] == 'p2pkh': 
                            if not verify_p2pkh_transaction(vin,transaction,index): 
                                valid = 0
                                break
                        elif vin["prevout"]["scriptpubkey_type"] == 'v0_p2wpkh': 
                            if not verify_p2wpkh_transaction(vin,transaction,index): 
                                valid = 0
                                break
                        elif vin["prevout"]["scriptpubkey_type"] == 'v0_p2wsh': 
                            if not verify_p2wsh_tx(vin,transaction,index): 
                                valid = 0
                                break
                        elif vin["prevout"]["scriptpubkey_type"] == 'p2sh': 
                            if "witness" in vin:
                                if not verify_p2sh_p2wpkh_transaction(vin,transaction,index): 
                                    valid = 0
                                    break
                            else:
                                if not verify_p2sh_transaction(vin,transaction,index):
                                    valid = 0
                                    break
                        else:
                            continue
                    except Exception as e:
                        valid = 0
                        break
                if(valid):
                    valid_transactions.append(transaction)        
    return valid_transactions

def validate_transaction_fields(transaction):
    # List of essential fields in a transaction
    essential_fields = ['vin', 'vout']

    # Check for presence and non-emptiness of essential fields
    for field in essential_fields:
        if field not in transaction :
            return False

    # If the transaction is SegWit, it should have a 'witness' field in every 'vin'
    for vin in transaction['vin']:
        # Additionally check that 'txid' and 'vout' are present and non-empty in each 'vin'
        if 'txid' not in vin:
            return False, #Missing or empty 'txid' in transaction input.
        if 'vout' not in vin : 
            return False, #Missing or empty 'vout' in transaction input.

    # 'vout' has a non-empty 'scriptPubKey'
    for vout in transaction['vout']:
        if 'scriptPubKey' not in vout :
            return False, #Missing or empty 'scriptPubKey' in transaction output

    # Transaction passes all checks
    return True, #Transaction includes all essential fields and they are non-empty.


def check_input_more_than_output(transaction):
    total_input_value = 0
    total_output_value = 0
    for vin in transaction.get('vin'):
        total_input_value += vin["prevout"]["value"]

    for vout in transaction.get('vout'):
        total_output_value += vout["value"]
    
    return total_input_value >= total_output_value

def serialize_varint(value):
    """Serialize an integer as a VarInt."""
    if value < 0xfd:
        return value.to_bytes(1, byteorder='little')
    elif value <= 0xffff:
        return b'\xfd' + value.to_bytes(2, byteorder='little')
    elif value <= 0xffffffff:
        return b'\xfe' + value.to_bytes(4, byteorder='little')
    else:
        return b'\xff' + value.to_bytes(8, byteorder='little')

def serialize_tx(tx):
    serialized_tx = bytearray()
    
    # Version
    serialized_tx.extend(int(tx['version']).to_bytes(4, byteorder='little'))
    
    # Number of inputs, using VarInt
    serialized_tx.extend(serialize_varint(len(tx['vin'])))
    
    # Inputs
    for vin in tx['vin']:
        # TXID
        serialized_tx.extend(bytes.fromhex(vin['txid'])[::-1])
        # VOUT
        serialized_tx.extend(int(vin['vout']).to_bytes(4, byteorder='little'))
        # ScriptSig (not present for SegWit inputs in txid calculation, but demonstrating VarInt usage)
        serialized_tx.extend(serialize_varint(len(bytes.fromhex(vin.get('scriptsig', '')))))
        if 'scriptsig' in vin:
            serialized_tx.extend(bytes.fromhex(vin['scriptsig']))
        # Sequence
        serialized_tx.extend(int(vin['sequence']).to_bytes(4, byteorder='little'))
    
    # Number of outputs, using VarInt
    serialized_tx.extend(serialize_varint(len(tx['vout'])))
    
    # Outputs
    for vout in tx['vout']:
        # Value
        serialized_tx.extend(int(vout['value']).to_bytes(8, byteorder='little'))
        # ScriptPubKey length and ScriptPubKey, using VarInt for the length
        scriptpubkey_bytes = bytes.fromhex(vout['scriptpubkey'])
        serialized_tx.extend(serialize_varint(len(scriptpubkey_bytes)))
        serialized_tx.extend(scriptpubkey_bytes)
    
    # Locktime
    serialized_tx.extend(int(tx['locktime']).to_bytes(4, byteorder='little'))
    
    return bytes(serialized_tx)

def double_sha256(s):
    return hashlib.sha256(hashlib.sha256(s).digest()).digest()

def get_txid(tx):
    serialized_tx = serialize_tx(tx)
    txid = double_sha256(serialized_tx)
    return txid[::-1].hex()  # Reverse txid to match usual big-endian hex display

def serialize_legacy_tx(tx):
    serialized_tx = bytearray()
    
    # Version
    serialized_tx.extend(int(tx['version']).to_bytes(4, byteorder='little'))
    
    # Number of inputs, using VarInt
    serialized_tx.extend(serialize_varint(len(tx['vin'])))
    
    # Inputs
    for vin in tx['vin']:
        # TXID
        serialized_tx.extend(bytes.fromhex(vin['txid'])[::-1])
        # VOUT
        serialized_tx.extend(int(vin['vout']).to_bytes(4, byteorder='little'))
        # ScriptSig
        scriptsig_bytes = bytes.fromhex(vin['scriptsig'])
        serialized_tx.extend(serialize_varint(len(scriptsig_bytes)))  # ScriptSig length, using VarInt
        serialized_tx.extend(scriptsig_bytes)
        # Sequence
        serialized_tx.extend(int(vin['sequence']).to_bytes(4, byteorder='little'))
    
    # Number of outputs, using VarInt
    serialized_tx.extend(serialize_varint(len(tx['vout'])))
    
    # Outputs
    for vout in tx['vout']:
        # Value
        serialized_tx.extend(int(vout['value']).to_bytes(8, byteorder='little'))
        # ScriptPubKey
        scriptpubkey_bytes = bytes.fromhex(vout['scriptpubkey'])
        serialized_tx.extend(serialize_varint(len(scriptpubkey_bytes)))  # ScriptPubKey length, using VarInt
        serialized_tx.extend(scriptpubkey_bytes)
    
    # Locktime
    serialized_tx.extend(int(tx['locktime']).to_bytes(4, byteorder='little'))
    
    return bytes(serialized_tx)

def get_legacy_txid(tx):
    serialized_tx = serialize_legacy_tx(tx)
    txid = double_sha256(serialized_tx)
    return txid[::-1].hex()  # Reverse txid to match usual big-endian hex display

def is_legacy_transaction(tx):
    # Check if any input has a 'witness' field, indicating SegWit usage
    for vin in tx.get('vin', []):
        if 'witness' in vin:
            return False  # Not a legacy transaction if any input has 'witness'
    return True

def HASH160(pubkey_bytes): 
    sha256_pubkey = hashlib.sha256(pubkey_bytes).digest()
    return ripemd160(sha256_pubkey)

def verify_p2wpkh_transaction(vin,transaction,index):
    witness = vin['witness']
    scriptPubKey = vin['prevout']['scriptpubkey']
    provided_address = vin['prevout']['scriptpubkey_address']

    if len(witness) != 2:
        return False # "Invalid number of items in witness data"

    signature, pubkey_hex = witness
    pubkey_bytes = bytes.fromhex(pubkey_hex)

    # Verify if the pubkey is compressed; if not, the transaction is invalid
    if not (pubkey_bytes[0] in [0x02, 0x03] and len(pubkey_bytes) == 33):
        return False # "Public key is not compressed or invalid"

    # Compute the HASH160 of the public key
    ripemd160_pubkey = HASH160(pubkey_bytes)

    # The expected pubkey hash from the scriptPubKey
    expected_pubkey_hash = scriptPubKey[4:]

    # Verify HASH160(pubkey) matches the scriptPubKey
    if ripemd160_pubkey.hex() != expected_pubkey_hash:
        return False # "Public key hash does not match scriptPubKey"

    # For Bech32 address validation, ensure computed address matches provided address
    hrp = "bc"  # Human-readable part for Bitcoin mainnet
    witness_version = 0
    computed_bech32_address = bech32.encode(hrp, witness_version, ripemd160_pubkey)
    if computed_bech32_address != provided_address:
        return False #Computed Bech32 address does not match provided address

    is_signature_valid = False
    if(signature[-2:]) == "01":
        t = compute_sighash_p2wpkh(transaction,index,vin["prevout"]["value"])
        is_signature_valid = verify_signature(pubkey_hex,signature[:-2],t)
    return is_signature_valid #Transaction verified successfully

def base58check_decode(address):
    alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    decoded = 0
    for char in address:
        decoded = decoded * 58 + alphabet.index(char)
    decoded_bytes = decoded.to_bytes(25, byteorder='big')
    checksum = decoded_bytes[-4:]
    payload = decoded_bytes[:-4]
    if hashlib.sha256(hashlib.sha256(payload).digest()).digest()[:4] == checksum:
        return payload[1:]  # Skip version byte
    else:
        raise ValueError("Invalid address checksum")
    
def hash256(data):
    """Perform a double SHA256 hash."""
    return hashlib.sha256(hashlib.sha256(data).digest()).digest()

def compute_sighash_p2wpkh(transaction, input_index, input_amount):
    # 1. Version
    version = transaction['version'].to_bytes(4, byteorder='little')
    
    # 2. Hashed TXID and VOUT
    txid_vout_pairs = b''.join(bytes.fromhex(vin['txid'])[::-1] + vin['vout'].to_bytes(4, byteorder='little') for vin in transaction['vin'])
    hashPrevOuts = hash256(txid_vout_pairs)
    
    # 3. Hashed sequences
    sequences = b''.join(vin['sequence'].to_bytes(4, byteorder='little') for vin in transaction['vin'])
    hashSequence = hash256(sequences)
    
    # 4. Outpoint
    outpoint = bytes.fromhex(transaction['vin'][input_index]['txid'])[::-1] + transaction['vin'][input_index]['vout'].to_bytes(4, byteorder='little')
    
    # 5. ScriptCode
    pubkey_hash = transaction['vin'][input_index]['prevout']['scriptpubkey'][4:]
    scriptcode = bytes.fromhex('1976a914' + pubkey_hash + '88ac')
    
    # 6. Input amount
    value = input_amount.to_bytes(8, byteorder='little')
    
    # 7. Sequence
    sequence = transaction['vin'][input_index]['sequence'].to_bytes(4, byteorder='little')
    
    # 8. Hashed outputs
    serialized_outputs = b''.join(int(vout['value']).to_bytes(8, byteorder='little') + serialize_varint(len(bytes.fromhex(vout['scriptpubkey']))) + bytes.fromhex(vout['scriptpubkey']) for vout in transaction['vout'])
    hashOutputs = hash256(serialized_outputs)
    
    # 9. Locktime
    locktime = transaction['locktime'].to_bytes(4, byteorder='little')
    
    # 10. SIGHASH type
    if transaction["vin"][input_index]["witness"][0][-2:] == "01":
        sighashtype = (1).to_bytes(4, byteorder='little')
    else : 
        sighashtype = (0x81).to_bytes(4, byteorder='little')  # SIGHASH_ANYONECANPAY | SIGHASH_ALL
    
    # 11. Combine for preimage
    preimage = version + hashPrevOuts + hashSequence + outpoint + scriptcode + value + sequence + hashOutputs + locktime + sighashtype
    # 12. Hash the preimage
    sighash = hashlib.sha256(preimage).digest()
    
    return sighash.hex()

def verify_p2pkh_transaction(vin,transaction,index):
    scriptSig_hex = vin["scriptsig"]
    scriptPubKey = vin['prevout']['scriptpubkey']
    provided_address = vin['prevout']['scriptpubkey_address']

    # Extract the signature and public key from scriptSig
    # Assuming scriptSig structure: <signature> <pubkey>
    sig_end = int(scriptSig_hex[:2], 16) * 2 + 2
    signature_hex = scriptSig_hex[2:sig_end]
    pubkey_hex = scriptSig_hex[sig_end+2:]

    pubkey_bytes = bytes.fromhex(pubkey_hex)

    # Calculate the HASH160 of the public key
    ripemd160_pubkey = HASH160(pubkey_bytes)

    # Extract the pubkey hash from scriptPubKey
    # Assuming scriptPubKey structure for p2pkh: OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG
    expected_pubkey_hash = scriptPubKey[6:46]  # Extract HASH160 directly from scriptPubKey

    # Verify HASH160(pubkey) matches the pubkey hash extracted from scriptPubKey
    if ripemd160_pubkey.hex() != expected_pubkey_hash:
        return False  # Public key hash does not match scriptPubKey

    decoded_pubkey_hash = base58check_decode(provided_address)
    
    # Verify decoded address hash matches computed ripemd160_pubkey
    if ripemd160_pubkey != decoded_pubkey_hash:
        return False  # Decoded address hash does not match computed HASH160(pubkey)

    # Placeholder for actual signature verification...
    is_signature_valid = True
    if signature_hex[-2:] == '01':
        t = compute_sighash_all(transaction,index)
    elif signature_hex[-2:] == '81':
        t = compute_sighash_anyonecanpay_all(transaction,index)
    is_signature_valid = verify_signature(pubkey_hex,signature_hex[:-2],t)
    return is_signature_valid


def compute_sighash_all(transaction, input_index):
    serialized_tx = transaction['version'].to_bytes(4, byteorder='little')
    serialized_tx += serialize_varint(len(transaction['vin']))
    
    for i, vin in enumerate(transaction['vin']):
        txid = bytes.fromhex(vin['txid'])[::-1]
        vout = vin['vout'].to_bytes(4, byteorder='little')
        script = b''
        sequence = vin['sequence'].to_bytes(4, byteorder='little')
        if i == input_index:
            script = bytes.fromhex(vin['prevout']['scriptpubkey'])
        script_len = serialize_varint(len(script))
        serialized_tx += txid + vout + script_len + script + sequence
        
    serialized_tx += serialize_varint(len(transaction['vout']))
    for vout in transaction['vout']:
        value = int(vout['value']).to_bytes(8, byteorder='little')
        scriptpubkey = bytes.fromhex(vout['scriptpubkey'])
        scriptpubkey_len = serialize_varint(len(scriptpubkey))
        serialized_tx += value + scriptpubkey_len + scriptpubkey

    serialized_tx += transaction['locktime'].to_bytes(4, byteorder='little')
    serialized_tx += (1).to_bytes(4, byteorder='little')  # SIGHASH_ALL
    sighash = hashlib.sha256(serialized_tx).digest()
    return sighash.hex()

def compute_sighash_anyonecanpay_all(transaction, input_index):
    serialized_tx = transaction['version'].to_bytes(4, byteorder='little')
    
    # With SIGHASH_ANYONECANPAY, only serialize the current input
    serialized_tx += serialize_varint(1)  # Only one input is considered
    
    # Serialize the current input
    vin = transaction['vin'][input_index]
    txid = bytes.fromhex(vin['txid'])[::-1]
    vout = vin['vout'].to_bytes(4, byteorder='little')
    script = bytes.fromhex(vin['prevout']['scriptpubkey'])  # Script of the output being spent
    sequence = vin['sequence'].to_bytes(4, byteorder='little')
    script_len = serialize_varint(len(script))
    serialized_tx += txid + vout + script_len + script + sequence
    
    # Serialize all outputs as in SIGHASH_ALL
    serialized_tx += serialize_varint(len(transaction['vout']))
    for vout in transaction['vout']:
        value = int(vout['value']).to_bytes(8, byteorder='little')
        scriptpubkey = bytes.fromhex(vout['scriptpubkey'])
        scriptpubkey_len = serialize_varint(len(scriptpubkey))
        serialized_tx += value + scriptpubkey_len + scriptpubkey
    
    # Append locktime and sighash type
    serialized_tx += transaction['locktime'].to_bytes(4, byteorder='little')
    serialized_tx += (0x81).to_bytes(4, byteorder='little')  # SIGHASH_ANYONECANPAY | SIGHASH_ALL
    
    sighash = hashlib.sha256(serialized_tx).digest()
    return sighash.hex()

def verify_signature(pubkey_hex, signature_der_hex, message_hex):
    # Decode the public key, signature, and message from hex
    pubkey_bytes = binascii.unhexlify(pubkey_hex)
    signature_der_bytes = binascii.unhexlify(signature_der_hex)
    message_hash_bytes = binascii.unhexlify(message_hex)  # Assuming this is the double SHA-256 hash
    
    # Create a VerifyingKey object
    vk = VerifyingKey.from_string(pubkey_bytes, curve=SECP256k1)
    
    # Parse the DER-encoded signature to obtain the raw signature (r and s values)
    r, s = util.sigdecode_der(signature_der_bytes, vk.curve.order)
    
    # Convert r and s to the 64-byte signature format
    signature_bytes = util.sigencode_string(r, s, vk.curve.order)

    # Verify the signature
    try:
        is_valid = vk.verify(signature_bytes, message_hash_bytes, hashfunc=util.sha256, sigdecode=util.sigdecode_string)
        return is_valid
    except Exception as e:
        return False

def verify_p2sh_p2wpkh_transaction(vin,transaction,index):
    scriptSig = vin['scriptsig']
    scriptPubKey = vin['prevout']['scriptpubkey']
    witness = vin['witness']
    provided_address = vin['prevout']['scriptpubkey_address']
    
    # Extract the redeem script from scriptSig for P2SH(P2WPKH)
    redeem_script_hex = vin['scriptsig_asm'].split(" ")[-1]  # Skipping the push byte for simplicity
    redeem_script = bytes.fromhex(redeem_script_hex)

    if len(redeem_script) > 520:
        return False

    # Validate redeem script hash against scriptPubKey
    redeem_script_hash = HASH160(redeem_script)
    expected_script_hash = scriptPubKey[4:44]  # Extract from OP_HASH160 <hash> OP_EQUAL
    if redeem_script_hash.hex() != expected_script_hash:
        return False
    
    decoded_pubkey_hash = base58check_decode(provided_address)

    if redeem_script_hash.hex() != decoded_pubkey_hash.hex():
        return False

    # Assuming witness structure: [<signature>, <pubkey>]
    

    is_signature_valid = True
    if len(witness) == 2:
        signature_hex, pubkey_hex = witness
        t = compute_sighash_p2sh_p2wpkh(transaction,index,vin["prevout"]["value"])
        is_signature_valid = verify_signature(pubkey_hex,signature_hex[:-2],t)
        
        return is_signature_valid

    else :
        sig = []
        for i in witness[:-1] :
            if i != "":
                sig.append(i)
        
        inner_witnessscript = vin["inner_witnessscript_asm"].split(" ")
        pub = []
        for i in range(len(inner_witnessscript)):
            if inner_witnessscript[i] == "OP_PUSHBYTES_33":
                pub.append(inner_witnessscript[i+1])
        t = compute_sighash_p2sh_p2wpkh_multi(transaction,index,vin["prevout"]["value"])
        j = 0
        for i in pub:
            if(verify_signature(i,sig[j][:-2],t)): 
                j+=1
            if(j==len(sig)):break 
    
    if(j==len(sig)): return True
    return False
        

def compute_sighash_p2sh_p2wpkh_multi(transaction, input_index, input_amount):
    # 1. Version
    version = transaction['version'].to_bytes(4, byteorder='little')
    
    # 2. Hashed TXID and VOUT
    txid_vout_pairs = b''.join(bytes.fromhex(vin['txid'])[::-1] + vin['vout'].to_bytes(4, byteorder='little') for vin in transaction['vin'])
    hashPrevOuts = hash256(txid_vout_pairs)
    
    # 3. Hashed sequences
    sequences = b''.join(vin['sequence'].to_bytes(4, byteorder='little') for vin in transaction['vin'])
    hashSequence = hash256(sequences)
    
    # 4. Outpoint
    outpoint = bytes.fromhex(transaction['vin'][input_index]['txid'])[::-1] + transaction['vin'][input_index]['vout'].to_bytes(4, byteorder='little')
    
    # 5. ScriptCode
    witness_script = bytes.fromhex(transaction['vin'][input_index]['witness'][-1])
    scriptcode = serialize_varint(len(witness_script)) + witness_script
    
    # 6. Input amount
    value = input_amount.to_bytes(8, byteorder='little')
    
    # 7. Sequence
    sequence = transaction['vin'][input_index]['sequence'].to_bytes(4, byteorder='little')
    
    # 8. Hashed outputs
    serialized_outputs = b''.join(int(vout['value']).to_bytes(8, byteorder='little') + serialize_varint(len(bytes.fromhex(vout['scriptpubkey']))) + bytes.fromhex(vout['scriptpubkey']) for vout in transaction['vout'])
    hashOutputs = hash256(serialized_outputs)
    
    # 9. Locktime
    locktime = transaction['locktime'].to_bytes(4, byteorder='little')
    
    # 10. SIGHASH type
    
    sighashtype = (1).to_bytes(4, byteorder='little')
    
    # 11. Combine for preimage
    preimage = version + hashPrevOuts + hashSequence + outpoint + scriptcode + value + sequence + hashOutputs + locktime + sighashtype
    # 12. Hash the preimage
    sighash = hashlib.sha256(preimage).digest()
    return sighash.hex()

def compute_sighash_p2sh_p2wpkh(transaction, input_index, input_amount):
    # 1. Version
    version = transaction['version'].to_bytes(4, byteorder='little')
    
    # 2. Hashed TXID and VOUT
    txid_vout_pairs = b''.join(bytes.fromhex(vin['txid'])[::-1] + vin['vout'].to_bytes(4, byteorder='little') for vin in transaction['vin'])
    hashPrevOuts = hash256(txid_vout_pairs)
    
    # 3. Hashed sequences
    sequences = b''.join(vin['sequence'].to_bytes(4, byteorder='little') for vin in transaction['vin'])
    hashSequence = hash256(sequences)
    
    # 4. Outpoint
    outpoint = bytes.fromhex(transaction['vin'][input_index]['txid'])[::-1] + transaction['vin'][input_index]['vout'].to_bytes(4, byteorder='little')
    
    # 5. ScriptCode
    pubkey_hash = transaction['vin'][input_index]['inner_redeemscript_asm'].split(" ")[-1]
    scriptcode = bytes.fromhex('1976a914' + pubkey_hash + '88ac')
    
    # 6. Input amount
    value = input_amount.to_bytes(8, byteorder='little')
    
    # 7. Sequence
    sequence = transaction['vin'][input_index]['sequence'].to_bytes(4, byteorder='little')
    
    # 8. Hashed outputs
    serialized_outputs = b''.join(int(vout['value']).to_bytes(8, byteorder='little') + serialize_varint(len(bytes.fromhex(vout['scriptpubkey']))) + bytes.fromhex(vout['scriptpubkey']) for vout in transaction['vout'])
    hashOutputs = hash256(serialized_outputs)
    
    # 9. Locktime
    locktime = transaction['locktime'].to_bytes(4, byteorder='little')
    
    # 10. SIGHASH type
    if transaction["vin"][input_index]["witness"][0][-2:] == "01":
        sighashtype = (1).to_bytes(4, byteorder='little')
    else : 
        sighashtype = (0x83).to_bytes(4, byteorder='little')  # SIGHASH_ANYONECANPAY | SIGHASH_ALL
    
    # 11. Combine for preimage
    preimage = version + hashPrevOuts + hashSequence + outpoint + scriptcode + value + sequence + hashOutputs + locktime + sighashtype
    # 12. Hash the preimage
    sighash = hashlib.sha256(preimage).digest()
    return sighash.hex()



def verify_p2sh_transaction(vin,transaction,index):
    scriptSig = vin['scriptsig']
    scriptPubKey = vin['prevout']['scriptpubkey']
    provided_address = vin['prevout']['scriptpubkey_address']
    
    # Extract the redeem script from scriptSig for P2SH(P2WPKH)
    redeem_script_hex = vin['scriptsig_asm'].split(" ")[-1]  # Skipping the push byte for simplicity
    redeem_script = bytes.fromhex(redeem_script_hex)

    if len(redeem_script) > 520:
        return False

    # Validate redeem script hash against scriptPubKey
    redeem_script_hash = HASH160(redeem_script)
    expected_script_hash = scriptPubKey[4:44]  # Extract from OP_HASH160 <hash> OP_EQUAL
    if redeem_script_hash.hex() != expected_script_hash:
        return False
    
    decoded_pubkey_hash = base58check_decode(provided_address)

    if redeem_script_hash.hex() != decoded_pubkey_hash.hex():
        return False
     
    t = compute_sighash_p2sh(transaction,index)
    sig = []
    components = vin["scriptsig_asm"].split(" ")[2:-2]
    for i in range(0,len(components),2):
        sig.append(components[i])
    
    pubkey = []
    components = vin["inner_redeemscript_asm"].split(" ")[2:-2]
    for i in range(0,len(components),2):
        pubkey.append(components[i])
    j = 0
    for i in pubkey:
       if(verify_signature(i,sig[j][:-2],t)): 
          j+=1
       if(j==len(sig)):break 
    
    if(j==len(sig)): return True
    return False
        
def compute_sighash_p2sh(transaction, input_index=-1):
    # Start with the version (little-endian)
    serialized = transaction['version'].to_bytes(4, byteorder='little')

    # Number of inputs
    serialized += len(transaction['vin']).to_bytes(1, byteorder='little')

    # Serialize inputs
    for index, input_item in enumerate(transaction['vin']):
        # TXID (little-endian)
        txid = bytes.fromhex(input_item['txid'])
        serialized += txid[::-1]

        # VOUT (little-endian)
        vout = input_item['vout'].to_bytes(4, byteorder='little')
        serialized += vout

        # ScriptSig length and ScriptSig
        if index == input_index or input_index == -1:
            # Extract redeem script from the last element of the ScriptSig ASM
            scriptsig_asm = input_item.get('scriptsig_asm', '').split()
            redeem_script = scriptsig_asm[-1] if scriptsig_asm else ''
            redeem_script_bytes = bytes.fromhex(redeem_script)
            serialized += len(redeem_script_bytes).to_bytes(1, byteorder='little') + redeem_script_bytes
        else:
            serialized += b'\x00'  # Empty ScriptSig for other inputs

        # Sequence (little-endian)
        sequence = input_item['sequence'].to_bytes(4, byteorder='little')
        serialized += sequence

    # Number of outputs
    serialized += len(transaction['vout']).to_bytes(1, byteorder='little')

    # Serialize outputs
    for output in transaction['vout']:
        # Value in satoshis (little-endian)
        value = output['value'].to_bytes(8, byteorder='little')
        serialized += value

        # ScriptPubKey length and ScriptPubKey
        scriptpubkey = bytes.fromhex(output['scriptpubkey'])
        serialized += len(scriptpubkey).to_bytes(1, byteorder='little') + scriptpubkey

    # Locktime (little-endian)
    locktime = transaction['locktime'].to_bytes(4, byteorder='little')
    serialized += locktime

    # Append SIGHASH type (assumed to be SIGHASH_ALL)
    serialized += b'\x01\x00\x00\x00'
    # Compute double SHA-256 hash of the serialized transaction
    sighash = hashlib.sha256(serialized).digest()
    return sighash.hex()


def verify_p2wsh_tx(vin,transaction,index):
    
    # Extract the scriptPubKey and its SHA-256 hash
    provided_scriptpubkey = vin['prevout']['scriptpubkey']
    provided_address = vin['prevout']['scriptpubkey_address']
    
        
    # Extract the SHA-256 hash from the provided scriptPubKey (skip the first 2 bytes indicating OP_0 and PUSH_32)
    expected_sha256_hash = provided_scriptpubkey[4:]
        
     # Decode the witness script from the last element of the witness field and compute its SHA-256 hash
    witness_script_asm = vin['witness']
    # Placeholder for converting asm to bytes, actual conversion depends on the script's details
    witness_script_bytes = witness_script_asm[-1]  # Simplified, adjust as needed
    witness_script_bytes = binascii.unhexlify(witness_script_bytes)
    calculated_sha256_hash = hashlib.sha256(witness_script_bytes).hexdigest()
        
    # Compare the SHA-256 hash of the witness script with the hash in the scriptPubKey
    if calculated_sha256_hash != expected_sha256_hash:
        return False
        
    # Placeholder for address verification, assume a function to validate the bech32 address
    script_hash_hex = expected_sha256_hash
    script_hash_bytes = bytes.fromhex(script_hash_hex)
    
    # Encode the script hash using Bech32 for a P2WSH address
    hrp = "bc"  # Human-readable part for Bitcoin mainnet
    witness_version = 0  # Version 0 for both P2WPKH and P2WSH
    computed_bech32_address = bech32.encode(hrp, witness_version, script_hash_bytes)
    
    # Compare the computed address with the provided address
    if computed_bech32_address != provided_address:
        return False
    witness = vin["witness"]
    sig = []
    for i in witness[:-1] :
        if i != "":
            sig.append(i)
        
    inner_witnessscript = vin["inner_witnessscript_asm"].split(" ")
    pub = []
    for i in range(len(inner_witnessscript)):
        if inner_witnessscript[i] == "OP_PUSHBYTES_33":
            pub.append(inner_witnessscript[i+1])
    t = compute_sighash_p2sh_p2wpkh_multi(transaction,index,vin["prevout"]["value"])
    j = 0
    for i in pub:
        if(verify_signature(i,sig[j][:-2],t)): 
            j+=1
        if(j==len(sig)):break 
    
    if(j==len(sig)): return True
    return False


# def classify_transactions_by_prevout_script(mempool_dir):
#     script_types_count = {}
#     print(len(os.listdir(mempool_dir)))
#     # Iterate through each file in the mempool directory
#     for filename in os.listdir(mempool_dir):
#         filepath = os.path.join(mempool_dir, filename)
        
#         # Open and load the JSON transaction file
#         with open(filepath, 'r') as file:
#             transaction = json.load(file)
            
#             # Iterate through each input in the transaction
#             for vin in transaction.get('vin', []):
#                 # Extract the scriptpubkey_type from the prevout section
#                 script_type = vin.get('prevout', {}).get('scriptpubkey_type', 'Unknown')
                
#                 # If the script type is not in our dictionary, add it with a starting count of 0
#                 if script_type not in script_types_count:
#                     script_types_count[script_type] = 0
                
#                 # Increment the count for this script type
#                 script_types_count[script_type] += 1

#     return script_types_count

def calculate_transaction_weight(tx):
    non_witness_bytes = 0
    witness_bytes = 0

    tx_type = "SEGWIT" if any('witness' in vin for vin in tx['vin']) else "LEGACY"

    if tx_type == "LEGACY":
        # VERSION
        non_witness_bytes += 4

        if len(tx['vin']) >= 50:
            raise ValueError("Too many inputs")

        # INPUT COUNT
        non_witness_bytes += 1

        # INPUTS
        for input in tx['vin']:
            # TXID
            txid = bytes.fromhex(input['txid'])
            non_witness_bytes += 32

            # VOUT
            non_witness_bytes += 4

            # SCRIPTSIG
            script_sig = bytes.fromhex(input.get('scriptsig', ''))
            non_witness_bytes += 1 + len(script_sig)

            # SEQUENCE
            non_witness_bytes += 4

        if len(tx['vout']) >= 50:
            raise ValueError("Too many outputs")

        # OUTPUT COUNT
        non_witness_bytes += 1

        # OUTPUTS
        for output in tx['vout']:
            # VALUE
            non_witness_bytes += 8

            # SCRIPTPUBKEY
            scriptpubkey = bytes.fromhex(output['scriptpubkey'])
            non_witness_bytes += 1 + len(scriptpubkey)

        # LOCKTIME
        non_witness_bytes += 4

    else:
        # VERSION
        non_witness_bytes += 4

        # MARKER and FLAG (witness data)
        witness_bytes += 2

        if len(tx['vin']) >= 50:
            raise ValueError("Too many inputs")

        # INPUT COUNT
        non_witness_bytes += 1

        # INPUTS
        for input in tx['vin']:
            # TXID and VOUT
            non_witness_bytes += 32 + 4

            # SCRIPTSIG (if any)
            script_sig = bytes.fromhex(input.get('scriptsig', ''))
            non_witness_bytes += 1 + len(script_sig)

            # SEQUENCE
            non_witness_bytes += 4

        if len(tx['vout']) >= 255:
            raise ValueError("Too many outputs")

        # OUTPUT COUNT
        non_witness_bytes += 1

        # OUTPUTS
        for output in tx['vout']:
            # VALUE and SCRIPTPUBKEY
            non_witness_bytes += 8 + 1 + len(bytes.fromhex(output['scriptpubkey']))

        # WITNESS DATA
        for input in tx['vin']:
            witness = input.get('witness', [])
            for item in witness:
                item_bytes = bytes.fromhex(item)
                witness_bytes += 1 + len(item_bytes)

        # LOCKTIME
        non_witness_bytes += 4

    # Calculate the total weight of the transaction
    tx_weight = (non_witness_bytes * 4) + witness_bytes

    # Return the transaction weight
    return tx_weight

def cal_fees(transaction):
    total_input_value = 0
    total_output_value = 0
    for vin in transaction.get('vin'):
        total_input_value += vin["prevout"]["value"]

    for vout in transaction.get('vout'):
        total_output_value += vout["value"]
    
    return total_input_value - total_output_value

def best_transactions_for_block(valid_transactions):
    # This variable will hold the selected transactions for the block
    selected_transactions = []
    max_block_weight = 4000000
    # Keep track of the current weight of the block as transactions are added
    amount = 0
    temp = []
    for transaction in valid_transactions:
        # Calculate fees for the transaction
        fees = cal_fees(transaction)  
        # Store the fee in the transaction dictionary
        transaction['fees'] = fees
        temp.append(transaction)
    # Sort the transactions by the fee in descending order
    sorted_transactions = sorted(temp, key=lambda x: x['fees'], reverse=True)
    sorted_transactions = sorted_transactions[0:4000]
    # Select transactions for the block based on the sorted order until the max block weight is reached
    for transaction in sorted_transactions:
            amount += transaction['fees']   
    # Return the selected transactions for the block
    return sorted_transactions,amount

def return_id(transactions):
    id = []
    wid = []
    for tx in transactions:
        if is_legacy_transaction(tx):
            id.append(get_legacy_txid(tx))
        else:
            id.append(get_txid(tx))
            wid.append(get_txid(tx))
    return id,wid

def merkle_root(txids: List[str]) -> str:
    hashes = [bytes.fromhex(txid) for txid in txids]
    while len(hashes) > 1:
        if len(hashes) % 2 == 1:
            hashes.append(hashes[-1])
        hashes = [double_sha256(hashes[i] + hashes[i + 1]) for i in range(0, len(hashes), 2)]
    return hashes[0].hex()

def witness_commitment(txs):
    root = merkle_root(txs)
    reserved = '00' * 32  # 32 bytes of zero
    return double_sha256(bytes.fromhex(root + reserved)).hex()

def coinbase(txs):
    tx = bytearray()
    tx.extend(b'\x01\x00\x00\x00') # Version
    tx.extend(b'\x00') # Marker
    tx.extend(b'\x01') # Flag
    tx.extend(b'\x01') # Num Inputs
    tx.extend(b'\x00' * 32) # Prev Tx Hash
    tx.extend(b'\xff\xff\xff\xff') # Prev Txout Index
    tx.extend(b'\x00') # Txin Script Len
    tx.extend(b'\xff\xff\xff\xff') # Sequence
    tx.extend(b'\x02') # Num Outputs

    # First Output
    tx.extend(bytes.fromhex('28a0d11500000000')) # Amount 1
    tx.extend(b'\x19') # Txout Script Len
    tx.extend(bytes.fromhex('76a914edf10a7fac6b32e24daa5305c723f3ee58db1bc888ac')) # ScriptPubKey

    # Second Output
    tx.extend(bytes.fromhex('0000000000000000')) # Amount 2
    script = bytes.fromhex('6a24aa21a9ed') + bytes.fromhex(witness_commitment(txs))
    tx.extend(len(script).to_bytes(1, 'big')) # Txout Script Len
    tx.extend(script) # Script

    # Locktime
    tx.extend(b'\x01\x20') # Stack Items Len
    tx.extend(b'\x00' * 32)
    tx.extend(b'\x00\x00\x00\x00') # Locktime
    txid = double_sha256(tx)
    return tx.hex(), txid[::-1].hex()


def create_block_header(merkle_root):
    version = 0x20000000  # Version 00000020
    prev_block_hash = '64' + '00' * 31  # 32-byte value with 0x64 at the start
    prev_block_hash_bytes = bytes.fromhex(prev_block_hash)  # No need to reverse as it's already in little-endian
    
    # Convert the given difficulty into bits (compact format)
    difficulty_target = '0000ffff00000000000000000000000000000000000000000000000000000000'
    bits = 0x1d00ffff  # Compact format of the difficulty target
    
    merkle_root_bytes = bytes.fromhex(merkle_root)[::-1]  # Reverse to match little-endian
    timestamp = int(time.time())
    timestamp_bytes = struct.pack('<I', timestamp)
    bits_bytes = struct.pack('<I', bits)
    
    nonce = 0
    target = int(difficulty_target, 16)
    target_bytes = target.to_bytes(32, byteorder='big')

    # Mining process
    while True:
        nonce_bytes = struct.pack('<I', nonce)
        header = (struct.pack('<I', version) + prev_block_hash_bytes +
                  merkle_root_bytes + timestamp_bytes +
                  bits_bytes + nonce_bytes)
        block_hash = double_sha256(header)
        
        if block_hash[::-1] < target_bytes:
            break
        nonce += 1

    return header.hex()

BLOCK_HEIGHT = 840000
SUBSIDY = 3.125 * 100000000

transactions = process_mempool()
best_transaction , amount = best_transactions_for_block(transactions)
amount += SUBSIDY
amount = int(amount)
amount =  amount.to_bytes(8, byteorder='little').hex()
tx_id , wid = return_id(best_transaction)
coinbase_txn , coinbase_id = coinbase(wid)
tx_id.insert(0,coinbase_id)
root = merkle_root(tx_id)
block_header = create_block_header(root)
output_content = f"{block_header}\n{coinbase_txn}\n" + "\n".join(tx_id)

# Write to output.txt
output_file_path = 'output.txt'  # Using the mounted directory to save the file
with open(output_file_path, 'w') as file:
    file.write(output_content)
# Generate the complete block
#block = create_block(block_version, previous_block_hash, root, block_time, block_bits, transactions)
#block