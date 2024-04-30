import hashlib
# import binascii
import json
import ecdsa
import struct
from hashlib import sha256
from ecdsa.util import sigdecode_der

from bitcoinlib.transactions import Transaction
from Crypto.Hash import SHA256
from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15


def hash160(data_hex):
    data = bytes.fromhex(data_hex)
    # Step 1: Perform SHA-256 hash
    sha256_hash = hashlib.sha256(data).digest()
    
    # Step 2: Perform RIPEMD-160 hash on the SHA-256 hash
    ripemd160_hash = hashlib.new('ripemd160', sha256_hash).digest()
    
    return ripemd160_hash.hex()

# print(hash160('038b572d6693afe809ed2df3233ba99b67415a60655a71fa5f06a3cf982e7d37e7'))

def op_checksig( txn ):
    for vin in txn["vin"]:
        scriptSig = vin["scriptsig"]
        pubLen = int(scriptSig[0:2], 16)*2
        public_key = scriptSig[2:2 + pubLen ]
        # print(public_key)
        sigLen = int(scriptSig[2 + pubLen:4 + pubLen], 16)*2
        signature = scriptSig[4 + pubLen: 4+pubLen + sigLen]

        message = serialize(txn)
        # print(signature)
        # print(scriptSig)
        # public_key = public_key[2:]
        # print(len(public_key))
        transaction_data = serialize(txn)
        public_key_bytes = bytes.fromhex(public_key)
        signature_bytes = bytes.fromhex(signature)
        # print(len(public_key_bytes))
        vk = ecdsa.VerifyingKey.from_string(public_key_bytes, curve=ecdsa.SECP256k1, hashfunc=sha256)
        assert vk.verify(signature_bytes, transaction_data, hashlib.sha256, sigdecode=sigdecode_der)
        # vk = ecdsa.VerifyingKey.from_string(public_key_bytes, curve=ecdsa.SECP256k1)

        # is_valid = vk.verify(signature_bytes, message.encode(), hashfunc=hashlib.sha256)

        # signature_decoded = binascii.unhexlify(signature.encode("utf-8"))
        # public_key_bytes = public_key.encode("utf-8")
        # public_key_object = RSA.import_key(binascii.unhexlify(public_key_bytes))
        # transaction_bytes = json.dumps(transaction_data, indent=2).encode('utf-8')
        # transaction_hash = SHA256.new(transaction_bytes)
        # pkcs1_15.new(public_key_object).verify(transaction_hash, signature_decoded)


def get_total_amount_in_inputs(transaction) -> int:
    total_in = 0
    vin_sum = sum([vin["prevout"]["value"] for vin in transaction["vin"]])

    print("Sum of values inside 'vin':", vin_sum)
    return vin_sum


def encode_varint(i):
    if i < 0xfd:
        return struct.pack("<B", i)
    elif i <= 0xffff:
        return b"\xfd" + struct.pack("<H", i)
    elif i <= 0xffffffff:
        return b"\xfe" + struct.pack("<I", i)
    else:
        return b"\xff" + struct.pack("<Q", i)

def serialize_transaction(tx):
    result = b""
    
    # Version
    result += struct.pack("<I", tx["version"])
    
    # Inputs
    result += encode_varint(len(tx["vin"]))
    for vin in tx["vin"]:
        result += bytes.fromhex(vin["txid"])[::-1]  # Reversed txid
        result += struct.pack("<I", vin["vout"])
        result += encode_varint(len(vin["scriptsig"]))
        result += bytes.fromhex(vin["scriptsig"])
        result += struct.pack("<I", vin["sequence"])
    
    # Outputs
    result += encode_varint(len(tx["vout"]))
    for vout in tx["vout"]:
        result += struct.pack("<Q", vout["value"])
        result += encode_varint(len(vout["scriptpubkey"]))
        result += bytes.fromhex(vout["scriptpubkey"])
    
    # Locktime
    result += struct.pack("<I", tx["locktime"])
    
    return result

def checkSer(transaction):
    # tx = Transaction.from_hex(transaction)
    serialized = serialize_transaction(transaction)
    print(serialized.hex())

    # transaction2 = Transaction. .from_dict(transaction)
    # ser_trans = transaction2.serialize()
    # print(ser_trans)
    # tx2 = transaction.seria


# checkSer()

def serInp(txn):
    res = b''
    count =0
    locktime = txn["locktime"]
    v = txn["version"].to_bytes(4, byteorder='little')
    for vin in txn["vin"]:
        count += 1
        txid = vin["txid"]
        voutIndex = vin["vout"]
        script_hex = vin["scriptsig"]

        scriptpubkey_size = len(bytes.fromhex(script_hex))

        seq = vin["sequence"]   
        res += bytes.fromhex(txid)[::-1] #bytes.fromhex(value_hex)
        res += (voutIndex.to_bytes(4, byteorder='little'))
        res += (scriptpubkey_size).to_bytes(1, byteorder='big')
        res += bytes.fromhex(script_hex)
        res += seq.to_bytes(4, byteorder='little')
        # print((voutIndex.to_bytes(4, byteorder='little')).hex())
        # print(((scriptpubkey_size).to_bytes(1, byteorder='big')).hex())
        # print(value_hex) 
    res = count.to_bytes(1, byteorder='big') + res    
    res = v + res      
    # print( res.hex())
    return res.hex()


def serOut(txn):    
    res= b''
    count =0
    locktime = txn["locktime"]
    for vout in txn["vout"]:
        count += 1
        scriptpubkey_hex = vout["scriptpubkey"]
        value = vout["value"]

        # scriptpubkey_size = len(scriptpubkey_hex) // 2
        
        value_hex = value.to_bytes(8, byteorder='big')[::-1] #.rjust(8, b'\x00')[::-1] #vout["value"] #[2:].zfill(8)
        scriptpubkey_size = len(bytes.fromhex(scriptpubkey_hex))
        res += value_hex #bytes.fromhex(value_hex)
        res += (scriptpubkey_size).to_bytes(1, byteorder='little')
        res += bytes.fromhex(scriptpubkey_hex) 
        res += locktime.to_bytes(4, byteorder='big')
        # print((scriptpubkey_size).to_bytes(1, byteorder='little').hex())
        # print(value_hex) 
    res = count.to_bytes(1, byteorder='big') + res          
    # print( res.hex())
    return res.hex()


def serialize(txn):
    res = serInp(txn)+ serOut(txn)
    print (res)
    s = '0100000001b121f4028d22f72d036ca5c23e2aa945f8fb3468f9b099ace7675e7689d60744030000006b483045022100feeafd13943ece155a277351b5649a3b69186de24f90785a8e2cd3170eb6c0c902201b072cb2ef7eeff1eea8ba185dfca77c5bb6b38e521fd008835d46c50c73aa5c0121038b572d6693afe809ed2df3233ba99b67415a60655a71fa5f06a3cf982e7d37e7ffffffff01d4be0000000000001976a9145192aab0e1617a7ecd92123059ca9a8fe1a734fb88ac00000000'
    if(s == res):
        print ("yes")
    else:
        print(s)
        print (res)
    return res    