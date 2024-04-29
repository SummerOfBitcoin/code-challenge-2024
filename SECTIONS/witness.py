import hashlib
import binascii

transaction_data = {
  "version": 2,
  "locktime": 0,
  "vin": [
    {
      "txid": "8c6eb49c8345d211eb5d7eaa109f63d9a696baab723ba2da06e559167b70076d",
      "vout": 10,
      "prevout": {
        "scriptpubkey": "51207a31300834f7c8e99673d7b0ea7147a30e7992344c70e3869c9500feebb41085",
        "scriptpubkey_asm": "OP_PUSHNUM_1 OP_PUSHBYTES_32 7a31300834f7c8e99673d7b0ea7147a30e7992344c70e3869c9500feebb41085",
        "scriptpubkey_type": "v1_p2tr",
        "scriptpubkey_address": "bc1p0gcnqzp57lywn9nn67cw5u285v88ny35f3cw8p5uj5q0a6a5zzzskqccj9",
        "value": 1962
      },
      "scriptsig": "",
      "scriptsig_asm": "",
      "witness": [
        "74a0db2ce056a58cce7a046b82a38fd9bda0c9dd5979f06e81ca6973c44b08f39937cd88d285cb1dda99dacc22fb1639f73d543332a996cb934abdbec100394b",
        "2024f14b181a0f77d670b063836b8942eaafb9714de6ee5bcf9b5ecfaeb76446d1ac0063036f7264010118746578742f706c61696e3b636861727365743d7574662d3800367b2270223a226272632d3230222c226f70223a226d696e74222c227469636b223a2261616161222c22616d74223a223130303030227d68",
        "c024f14b181a0f77d670b063836b8942eaafb9714de6ee5bcf9b5ecfaeb76446d1"
      ],
      "is_coinbase": False,
      "sequence": 4294967293
    }
  ],
  "vout": [
    {
      "scriptpubkey": "0014858ccaca6c4e482f629fdbcc5539e695d8673ea2",
      "scriptpubkey_asm": "OP_0 OP_PUSHBYTES_20 858ccaca6c4e482f629fdbcc5539e695d8673ea2",
      "scriptpubkey_type": "v0_p2wpkh",
      "scriptpubkey_address": "bc1qskxv4jnvfeyz7c5lm0x92w0xjhvxw04zpzg6gn",
      "value": 294
    }
  ]
}

# Validate the witness data
def validate_witness(transaction_data):
   
    tx_data = {
        "version": hex(transaction_data["version"])[2:].zfill(8),  # Convert to hexadecimal
        "locktime": hex(transaction_data["locktime"])[2:].zfill(8),  # Convert to hexadecimal
        "vin": [
            {
                "txid": transaction_data["vin"][0]["txid"],
                "vout": hex(transaction_data["vin"][0]["vout"])[2:].zfill(8),  # Convert to hexadecimal
                "scriptSig": transaction_data["vin"][0]["prevout"]["scriptpubkey"],
                "sequence": hex(transaction_data["vin"][0]["sequence"])[2:].zfill(8)  # Convert to hexadecimal
            }
        ],
        "vout": transaction_data["vout"]
    }
    tx_bytes = binascii.unhexlify(tx_data["version"]) + binascii.unhexlify(tx_data["locktime"])
    for vin in tx_data["vin"]:
        tx_bytes += binascii.unhexlify(vin["txid"]) + binascii.unhexlify(vin["vout"])
        tx_bytes += binascii.unhexlify(vin["scriptSig"]) + binascii.unhexlify(vin["sequence"])
    for vout in tx_data["vout"]:
        tx_bytes += int(vout["value"]).to_bytes(8, byteorder='little') + binascii.unhexlify(vout["scriptpubkey"])
    
    
    for witness in transaction_data["vin"][0]["witness"]:
        tx_bytes += binascii.unhexlify(witness)
  
    tx_hash = hashlib.sha256(hashlib.sha256(tx_bytes).digest()).digest()[::-1].hex()

   
    return tx_hash == transaction_data["vin"][0]["txid"]


print("Is valid:", validate_witness(transaction_data))




'''import hashlib
import binascii

transaction_data = {
  "version": 2,
  "locktime": 0,
  "vin": [
    {
      "txid": "64ca1941edef34b690dd6672c7d395c60882067f7f3fc396e64d88e39c1da5b4",
      "vout": 0,
      "prevout": {
        "scriptpubkey": "0014d5bfb7a6d05d44c1e14443919b30d284c0c0a10a",
        "scriptpubkey_asm": "OP_0 OP_PUSHBYTES_20 d5bfb7a6d05d44c1e14443919b30d284c0c0a10a",
        "scriptpubkey_type": "v0_p2wpkh",
        "scriptpubkey_address": "bc1q6klm0fkst4zvrc2ygwgekvxjsnqvpgg2jjfurm",
        "value": 10740
      },
      "scriptsig": "",
      "scriptsig_asm": "",
      "witness": [
        "3044022100884219ecbb54a6ec4d09597ca6aca49692ded3c2ffb13d1858ca5b70e59fabb4021f2de73021471a01d8f03a71a923b662f00120d181d0f7fa8e06faa1bb750e8f01",
        "0271d4e7a84804c075017593271c370e8983f704f123d22aa747cd321268981cba"
      ],
      "is_coinbase": False,
      "sequence": 4294967293
    }
  ],
  "vout": [
    {
      "scriptpubkey": "a91450feb99697a4901d3fe082eca341204fb6711b9487",
      "scriptpubkey_asm": "OP_HASH160 OP_PUSHBYTES_20 50feb99697a4901d3fe082eca341204fb6711b94 OP_EQUAL",
      "scriptpubkey_type": "p2sh",
      "scriptpubkey_address": "395H8VPYPtAoZWa2bx5SRyN2VojXrsb7j3",
      "value": 9520
    }
  ]
}

# Validate the witness data
def validate_witness(transaction_data):
    # Serialize the transaction without witness
    tx_data = {
        "version": hex(transaction_data["version"])[2:],  # Convert to hexadecimal and remove '0x' prefix
        "locktime": hex(transaction_data["locktime"])[2:],  # Convert to hexadecimal and remove '0x' prefix
        "vin": [
            {
                "txid": transaction_data["vin"][0]["txid"],
                "vout": transaction_data["vin"][0]["vout"],
                "scriptSig": transaction_data["vin"][0]["prevout"]["scriptpubkey"],
                "sequence": transaction_data["vin"][0]["sequence"]
            }
        ],
        "vout": transaction_data["vout"]
    }
    tx_bytes = binascii.unhexlify(tx_data["version"]) + binascii.unhexlify(tx_data["locktime"])
    for vin in tx_data["vin"]:
        tx_bytes += binascii.unhexlify(vin["txid"]) + binascii.unhexlify(vin["vout"])
        tx_bytes += binascii.unhexlify(vin["scriptSig"]) + binascii.unhexlify(vin["sequence"])
    for vout in tx_data["vout"]:
        tx_bytes += binascii.unhexlify(vout["value"]) + binascii.unhexlify(vout["scriptpubkey"])
    
    # Add witness data
    for witness in transaction_data["vin"][0]["witness"]:
        tx_bytes += binascii.unhexlify(witness)
    
    # Hash the transaction
    tx_hash = hashlib.sha256(hashlib.sha256(tx_bytes).digest()).digest()[::-1].hex()

    # Compare with provided txid
    return tx_hash == transaction_data["vin"][0]["txid"]

# Validate the witness data
print("Is valid:", validate_witness(transaction_data))
'''