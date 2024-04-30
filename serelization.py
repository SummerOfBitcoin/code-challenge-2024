import os
import json
import pandas as pd
import ecdsa
from hashlib import sha256
from ecdsa import VerifyingKey, SECP256k1
from base64 import b64decode

from conversion import encode



# Double sha256 the raw transaction data
def dsha(tx):
    tx = bytes.fromhex(tx)
    hsha = sha256(sha256(tx).digest()).digest()
    return hsha.hex()

# reverse the bytes
def rev(buf):   # here buf is hex type
    buf = bytes.fromhex(buf)
    buf = buf[::-1]
    return buf.hex()

# Sha256 
def sha(tx):
    tx = bytes.fromhex(tx)
    tx = sha256(tx).digest()
    return tx.hex()


def little_endian(num, num_bytes):
    little_endian_bytes = num.to_bytes(num_bytes, byteorder='little')
    
    return little_endian_bytes.hex()


# Serilization for making raw transaction data
def Serelization(json_data):
    
    version = json_data['version']
    vin = json_data['vin']

    # convert version to 4 bytes litte endian
    version = little_endian(version, 4)
    Raw_transaction_data = version

    # Input count
    input_count_len = len(vin)
    input_count = encode(input_count_len)
    Raw_transaction_data = Raw_transaction_data + input_count

    for i in range(input_count_len):
        # txid in reverse
        Txid = vin[i]['txid']
        Txid = rev(Txid)
        Raw_transaction_data += Txid

        # vout size 4 bytes and little endian
        Vout = vin[i]['vout']
        Vout = little_endian(Vout, 4)
        Raw_transaction_data += Vout

        # scriptsig_size in bytes byte
        scriptsig_size_int = int(len(vin[i]['scriptsig'])/2)
        scriptsig_size = encode(scriptsig_size_int)
        Raw_transaction_data += scriptsig_size

        # scriptsig 
        if scriptsig_size_int > 0 :
            scriptsig = vin[i]['scriptsig']
            Raw_transaction_data += scriptsig
        else:
            pass

        # sequence 4 bytes and little endian and then reverse it
        sequence = vin[i]['sequence']
        sequence = little_endian(sequence, 4)
        sequence = rev(sequence)
        Raw_transaction_data += sequence

    vout = json_data['vout']

    Output_count_len = len(vout)
    Output_count = encode(Output_count_len)
    Raw_transaction_data += Output_count

    for j in range(Output_count_len):
        # amount of outputs in 8 bytes and little-endian
        amount = vout[j]["value"]
        amount = little_endian(amount, 8)
        Raw_transaction_data += amount

        # scriptpubkey size in bytes in 1 byte compact size
        scriptpubkey_size_int = int(len(vout[j]["scriptpubkey"])/2)
        scriptpubkey_size = encode(scriptpubkey_size_int)
        Raw_transaction_data += scriptpubkey_size

        # scriptpub key 
        scriptpubkey = vout[j]['scriptpubkey']
        Raw_transaction_data += scriptpubkey

    # Locktime 4 bytes little_endian
    Locktime = json_data['locktime']
    Locktime = little_endian(Locktime, 4)
    Raw_transaction_data += Locktime

    return Raw_transaction_data

def transaction_id(Raw_transaction_data):
    txid = dsha(Raw_transaction_data)
    # reverse the txid bytes
    txid = rev(txid)

    return txid

# Remove json from file name
def remove_json(text):
    text = text.replace(".json", "")
    return text

def testing(txid, file_name_value):
    if sha(txid) == file_name_value:
        return True
    else:
        return False

def checking_ptr(transaction_json_data):
    for j in range(len(transaction_json_data['vin'])):
        if transaction_json_data['vin'][j]['prevout']['scriptpubkey_type'] != 'v1_p2tr':
            return False
        else:
            pass
    for k in range(len(transaction_json_data['vout'])):
        if transaction_json_data['vout'][0]['scriptpubkey_type'] != 'v1_p2tr':
            return False
        else:
            pass
        
    return True

def total_fees_df(transaction_json_data):
    total_input_value = 0
    total_output_value = 0
    for j in range(len(transaction_json_data['vin'])):
        total_input_value += transaction_json_data['vin'][j]['prevout']['value']

    for k in range(len(transaction_json_data['vout'])):
        total_output_value += transaction_json_data['vout'][k]["value"]
    
    total_fees = total_input_value - total_output_value
    if total_fees > 0:
        return total_fees
    else:
        return 0


def wtxid_Serelization(json_data):
    
    version = json_data['version']
    vin = json_data['vin']

    # convert version to 4 bytes litte endian
    version = little_endian(version, 4)
    Raw_transaction_data = version

    # marker and flag
    marker = '00'
    flag = '01'
    Raw_transaction_data += marker + flag

    # Input count
    input_count_len = len(vin)
    input_count = encode(input_count_len)
    Raw_transaction_data = Raw_transaction_data + input_count

    for i in range(input_count_len):
        # txid in reverse
        Txid = vin[i]['txid']
        Txid = rev(Txid)
        Raw_transaction_data += Txid

        # vout size 4 bytes and little endian
        Vout = vin[i]['vout']
        Vout = little_endian(Vout, 4)
        Raw_transaction_data += Vout

        # scriptsig_size in bytes byte
        scriptsig_size_int = int(len(vin[i]['scriptsig'])/2)
        scriptsig_size = encode(scriptsig_size_int)
        Raw_transaction_data += scriptsig_size

        # scriptsig 
        if scriptsig_size_int > 0 :
            scriptsig = vin[i]['scriptsig']
            Raw_transaction_data += scriptsig
        else:
            pass

        # sequence 4 bytes and little endian and then reverse it
        sequence = vin[i]['sequence']
        sequence = little_endian(sequence, 4)
        sequence = rev(sequence)
        Raw_transaction_data += sequence

    vout = json_data['vout']

    Output_count_len = len(vout)
    Output_count = encode(Output_count_len)
    Raw_transaction_data += Output_count

    for j in range(Output_count_len):
        # amount of outputs in 8 bytes and little-endian
        amount = vout[j]["value"]
        amount = little_endian(amount, 8)
        Raw_transaction_data += amount

        # scriptpubkey size in bytes in 1 byte compact size
        scriptpubkey_size_int = int(len(vout[j]["scriptpubkey"])/2)
        scriptpubkey_size = encode(scriptpubkey_size_int)
        Raw_transaction_data += scriptpubkey_size

        # scriptpub key 
        scriptpubkey = vout[j]['scriptpubkey']
        Raw_transaction_data += scriptpubkey

    # Witness 
    for i in range(input_count_len):

        # scriptsig_size in bytes byte
        witness_stack_size_int = int(len(vin[i]['witness']))
        witness_stack_size = encode(witness_stack_size_int)
        Raw_transaction_data += witness_stack_size

        # scriptsig 
        if witness_stack_size_int > 0 :
            for j in range(witness_stack_size_int):
                witness_value_size_int = int(len(vin[i]['witness'][j])/2)
                witness_value_size = encode(witness_value_size_int)
                Raw_transaction_data += witness_value_size

                witness_value = vin[i]['witness'][j]
                Raw_transaction_data += witness_value
        else:
            pass

    # Locktime 4 bytes little_endian
    Locktime = json_data['locktime']
    Locktime = little_endian(Locktime, 4)
    Raw_transaction_data += Locktime

    return Raw_transaction_data