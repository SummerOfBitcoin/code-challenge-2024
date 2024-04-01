import os
import json
from serialize import serialize_tx

# START
mempool_dir = './mempool'
# Get a list of all files in the mempool_dir
transactions = os.listdir(mempool_dir)
# print("Verifying ", len(transactions), "transactions...")

# First line: The block header.
print('00000000000000000020cf2bdc6563fb25c424af588d5fb7223461e72715e4a9')
# Second line: The serialized coinbase transaction.
print('010000000001010000000000000000000000000000000000000000000000000000000000000000ffffffff2503233708184d696e656420627920416e74506f6f6c373946205b8160a4256c0000946e0100ffffffff02f595814a000000001976a914edf10a7fac6b32e24daa5305c723f3de58db1bc888ac0000000000000000266a24aa21a9edfaa194df59043645ba0f58aad74bfd5693fa497093174d12a4bb3b0574a878db0120000000000000000000000000000000000000000000000000000000000000000000000000')
# Following lines: The transaction IDs (txids) of the transactions mined in the block, in order. The first txid should be that of the coinbase transaction
#(need to print coinbase tx)

counter = 0
for filename in os.listdir(mempool_dir):
    filepath = os.path.join(mempool_dir, filename)
    with open(filepath, 'r') as file:
        tx_data = json.load(file)
        print(serialize_tx(tx_data['version'], tx_data['vin'], tx_data['vout'], tx_data['locktime']))
        counter += 1
        if(counter == 100):
            break

#=======================================================================================================

# def evaluate_script(script, stack = []):
#     #returns True if the script execution is successful and the result if true, reutrns False otherwise
#     i = 0
#     while i < len(script):
#         print("stack status:", stack)
#         opcode = script[i]
#         if opcode == "OP_0":
#             stack.append(0x00)
#         elif opcode == "OP_DUP":
#             duplicate = stack[-1]
#             stack.append(duplicate)
#         elif opcode == "OP_HASH160":
#             bytes_data = bytes.fromhex(stack[-1])
#             sha256_hash = hashlib.sha256(bytes_data).digest()
#             ripemd160_hash = hashlib.new('ripemd160', sha256_hash).digest()
#             stack.pop()
#             stack.append(ripemd160_hash.hex())
#         #mark a transaction invalid if the equal check fails
#         elif opcode == "OP_EQUALVERIFY": 
#             top = stack.pop()
#             second_top = stack.pop()
#             if not top == second_top:
#                 return False
        
#         elif opcode[:3] != "OP_":
#             stack.append(opcode)
#         else:
#             print("opcode not found: ", opcode)
#             return False
        
#         i += 1

#     # Check the final stack state
#     if len(stack) == 1 and stack[-1]:
#         return True  
#     else:
#         return False

# def verify_transaction(txid, txdata):
#     # returns false if the transaction is invalid, and true if the transaction is valid
#     tx_fees = calculate_transaction_fees(txdata)
#     if (tx_fees) < 0:
#         print("error negative fee: ", txid)
#         return False

#     for vin in txdata['vin']:
#         scriptpubkey_type = vin['prevout']['scriptpubkey_type']
#         #case 1: pay to witness public key hash
#         # if scriptpubkey_type == "v0_p2wpkh":
#         #     lock_script = vin['prevout']['scriptpubkey_asm'].split()

#         #     if lock_script[0] == "OP_0" and lock_script[1] == "OP_PUSHBYTES_20":
#         #         stack_initial = [vin['witness'][0], vin['witness'][1]]
#         #         p2pkh_script = ["OP_DUP", "OP_HASH160", lock_script[2], "OP_EQUALVERIFY", "OP_CHECKSIG"] #second index of lock_script is the public key hash
#         #         if not evaluate_script(p2pkh_script, stack_initial):
#         #             return False
#         #     else: 
#         #         print("no OP_0 followed by OP_PUSHBYTES found to execute tx type: ", scriptpubkey_type)
#         #         return False
        
#         if scriptpubkey_type == "v0_p2wsh":
#             # inner_script = vin['inner_witnessscript_asm'].split()
#             # condition1 = inner_script[0] == "OP_0" and inner_script[1] == "OP_PUSHBYTES_20"
#             # condition2 = inner_script[0] == "OP_0" and inner_script[1] == "OP_PUSHBYTES_32"
#             # condition3 = inner_script[-1] == "OP_CHECKMULTISIG" and inner_script[-2] == "OP_PUSHNUM_3"
#             # condition4 = inner_script[-1] == "OP_CHECKMULTISIG" and inner_script[-2] == "OP_PUSHNUM_2"
#             print(vin['inner_witnessscript_asm'])
                
#         # else:
#         #     print('transaction type not supported')
#         #     return False
#         # if scriptpubkey_type == "v1_p2tr":
#         #     w_length = len(vin["witness"])
#         #     if w_length != 1 and w_length != 3:
#         #         print(w_length)
#     return True
    

# Iterate over files in the mempool_dir
#filename = '0a3c3139b32f021a35ac9a7bef4d59d4abba9ee0160910ac94b4bcefb294f196.json'
# for filename in os.listdir(mempool_dir):
#     filepath = os.path.join(mempool_dir, filename)
#     with open(filepath, 'r') as file:
#         tx_data = json.load(file)
#         if 'vin' in tx_data:
#             print("The 'desired_field' exists in the JSON data.")



# Example public key and signature
# def verify_signature(signature_der, public_key_hex, message):
#     # Convert signature and public key from hex to bytes
#     signature = bytes.fromhex(signature_der)
#     public_key = bytes.fromhex(public_key_hex)
    
#     # Create a VerifyingKey object from the public key
#     vk = ecdsa.VerifyingKey.from_string(public_key, curve=ecdsa.SECP256k1)
    
#     # Verify the signature against the public key
#     try:
#         result = vk.verify(signature, message.encode(), hashfunc=hashlib.sha256, sigdecode=ecdsa.util.sigdecode_der)
#         return result
#     except ecdsa.BadSignatureError:
#         return False

# # Example usage
# signature_der = "304402207ed00dfbbf904a6f24d43725fe3cd9d8fec2f5b6f6a7ac7b1e0816e39266ff7602200966bdee875f64538a655dd2a0bc548c3deb5fd717ec3e9e107d1233533cc23a01"
# public_key_hex = "021160ee898d5480f4a193254338a6f289ab33a56ed639ca0b1504c9acffdf4fda"
# message = "Hello, world!"

# result = verify_signature(signature_der, public_key_hex, message)
# print("Signature is valid:", result)





    


