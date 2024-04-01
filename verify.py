from ecdsa import SECP256k1, VerifyingKey, BadSignatureError
import os
import json
from serialize import serialize_tx, serialize_segwit_msg
from util import double_sha256_nodigest, der_to_rawsig, hash160, determine_script_type, validate_multisig
import struct
from hashlib import sha256

""" 
script_pubkey_type supported:
    v1_p2tr
    p2pkh
    p2sh
    v0_p2wsh
    v0_p2wpkh
"""

def verify_p2pkh(tx_data, i):
    #remove script sigs
    
    for input_tx in tx_data["vin"]:
        input_tx["scriptsig"] = ""

    inputs = tx_data['vin']
    scriptsig_asm = tx_data['vin'][i]['scriptsig_asm'].split()

    #first verify that the public key hash matches
    if inputs[i]['prevout']['scriptpubkey_asm'].split()[3] != hash160(bytes.fromhex(scriptsig_asm[3])).hex():
        raise ValueError("public key hash doesn't match")

    raw_der_signature = scriptsig_asm[1]
    r, s = der_to_rawsig(raw_der_signature)
    raw_signature = r + s
    public_key_hex = scriptsig_asm[3]
    public_key_bytes = bytes.fromhex(public_key_hex)
    signature_bytes = bytes.fromhex(raw_signature)
    # use public key (r concat s) to generate verifying key
    verifying_key = VerifyingKey.from_string(public_key_bytes, curve=SECP256k1)

    #put current input's previous scriptpubkey in the scriptsig
    inputs[i]['scriptsig'] = inputs[i]['prevout']['scriptpubkey']

    #account for sighash type 81 (only 01 and 81 sighashes are present)
    if(raw_der_signature[-2:] == '81'):
        inputs = [inputs[i]]

    #serialize the tx_data and append 4 byte little endian hash type 
    message = serialize_tx(tx_data['version'], inputs, tx_data['vout'], tx_data['locktime']) + struct.pack('<I', int.from_bytes(bytes.fromhex(raw_der_signature[-2:]), byteorder='big')).hex()
    # Verify the signature
    is_valid = verifying_key.verify(signature_bytes, bytes.fromhex(message), hashfunc=double_sha256_nodigest)
    #reset the scriptsig
    #inputs[i]['scriptsig'] = ""
    return is_valid

def verify_p2wpkh(tx_data, i):

    curr_input = tx_data['vin'][i]
    raw_der_signature = curr_input['witness'][0]
    hashtype = struct.pack('<I', int.from_bytes(bytes.fromhex(raw_der_signature[-2:]), byteorder='big')).hex()
        
    message = serialize_segwit_msg(tx_data, hashtype, curr_input)

    raw_der_signature = curr_input['witness'][0]
    r, s = der_to_rawsig(raw_der_signature)
    raw_signature = r + s
    public_key_hex = curr_input['witness'][1]
    public_key_bytes = bytes.fromhex(public_key_hex)
    signature_bytes = bytes.fromhex(raw_signature)
    # use public key (r concat s) to generate verifying key
    verifying_key = VerifyingKey.from_string(public_key_bytes, curve=SECP256k1)
    
    #perform the two checks
    if hash160(public_key_bytes).hex() != curr_input['prevout']['scriptpubkey_asm'].split()[2]:
        raise ValueError("public key hash doesn't match")
    is_valid = verifying_key.verify(signature_bytes, bytes.fromhex(message), hashfunc=double_sha256_nodigest)
    return is_valid

def verify_p2wsh(tx_data, i):

    curr_input = tx_data['vin'][i]
    curr_witness = curr_input['witness']
    inner_script = curr_input['inner_witnessscript_asm']

    #verify sha256 hash of inner script matches the previous output scriptpubkey hash
    if sha256(bytes.fromhex(curr_witness[-1])).digest().hex() != curr_input['prevout']['scriptpubkey_asm'].split()[2]:
        raise ValueError("public key hash doesn't match")
    
    inner_script_type = determine_script_type(inner_script)
    if (inner_script_type == 'multisig'):
        validate_multisig(inner_script, curr_input, curr_witness, tx_data, witness = True)
    else:
        raise ValueError("not a multisig")

def verify_p2sh(tx_data, i):

    curr_input = tx_data['vin'][i]
    scriptsig = curr_input['scriptsig_asm'].split()
    inner_script = curr_input['inner_redeemscript_asm']

    #perform the redeem script hash verification 
    script_sig_asm = curr_input['scriptsig_asm'].split()[-1]
    if hash160(bytes.fromhex(script_sig_asm)).hex() != curr_input['prevout']['scriptpubkey_asm'].split()[2]:
        raise ValueError("redeem script hash doesn't match")
    
    #extract the inner_script and find out which type it is
    script_type = determine_script_type(inner_script)
    #print(script_type)

    if script_type == 'p2wpkh':
        curr_input['prevout']['scriptpubkey_asm'] = inner_script
        verify_p2wpkh(tx_data, i)

    elif script_type == 'p2wsh':
        curr_input['prevout']['scriptpubkey_asm'] = inner_script
        verify_p2wsh(tx_data, i)

    elif script_type == 'multisig':
        #construct a 'witness' by extracting elements from scriptsig_asm
        witness = []
        witness.append("")
        for element in scriptsig:
            if element.startswith("OP_"):
                continue
            else:
                witness.append(element)
        #print(witness)
        validate_multisig(inner_script, curr_input, witness, tx_data, witness = False, input_index = i)

    else:
        raise ValueError("not a standard script type")

# BEGIN TESTS
mempool_dir = './mempool'
def test1():
    filename = '0a8b21af1cfcc26774df1f513a72cd362a14f5a598ec39d915323078efb5a240.json'
    filepath = os.path.join(mempool_dir, filename)
    with open(filepath, 'r') as file:
        tx_data = json.load(file)
        verified = True
        for i in range(0, len(tx_data['vin'])):
            #print("verifying: ", filename)
            try:
                verify_p2pkh(tx_data, i)
            except ValueError as e:
                verified = False
                print(e, "file failed:", filename)
                break
            except BadSignatureError as e:
                verified = False
                print(e, "file failed:", filename)
                break
            except:
                verified = False
                print("some other error", "file failed:", filename)
                break
        if (verified):
            print("success")

#test all p2pkh, alternative sig hash is 0x81
def test2():
    only_p2pkh_inputs = []
    for filename in os.listdir(mempool_dir):
        filepath = os.path.join(mempool_dir, filename)
        with open(filepath, 'r') as file:
            tx_data = json.load(file)
            all_p2pkh = all(elem['prevout']['scriptpubkey_type'] == 'p2pkh' for elem in tx_data['vin'])
            if(all_p2pkh):
                only_p2pkh_inputs.append(filename)

    failed = []
    succeeded = []
    for filename in only_p2pkh_inputs:
        filepath = os.path.join(mempool_dir, filename)
        with open(filepath, 'r') as file:
            tx_data = json.load(file)
            verified = True
            for i in range(0, len(tx_data['vin'])):
                #print("verifying: ", filename)
                try:
                    verify_p2pkh(tx_data, i)
                except ValueError as e:
                    verified = False
                    failed.append(filename)
                    print(e, "file failed:", filename)
                    break
                except BadSignatureError as e:
                    verified = False
                    failed.append(filename)
                    print(e, "file failed:", filename)
                    break
                except:
                    verified = False
                    failed.append(filename)
                    print("some other error", "file failed:", filename)
                    break
            if (verified):
                succeeded.append(filename)

    print(len(succeeded), "successes")
    print(len(failed), "fails")
    print(failed)

def test3():
#test 3 (should succeed)
    mempool_dir = './mempool'
    filename = 'dc8b57d0b5e1c79ba48d2383eb00f631b693f8ab1f5688432b90c3ec1b0187cc.json'
    filepath = os.path.join(mempool_dir, filename)
    with open(filepath, 'r') as file:
        tx_data = json.load(file)
        verified = True
        for i in range(0, len(tx_data['vin'])):
            #print("verifying: ", filename)
            try:
                verify_p2pkh(tx_data, i)
            except ValueError as e:
                verified = False
                print(e, "file failed:", filename)
                break
            except BadSignatureError as e:
                verified = False
                print(e, "file failed:", filename)
                break
            except:
                verified = False
                print("some other error", "file failed:", filename)
                break
        if (verified):
            print("success")

#test all p2wpkh
def test4():
    only_p2wpkh_inputs = []
    for filename in os.listdir(mempool_dir):
        filepath = os.path.join(mempool_dir, filename)
        with open(filepath, 'r') as file:
            tx_data = json.load(file)
            all_p2wpkh = all(elem['prevout']['scriptpubkey_type'] == 'v0_p2wpkh' for elem in tx_data['vin'])
            if(all_p2wpkh):
                only_p2wpkh_inputs.append(filename)

    failed = []
    succeeded = []
    for filename in only_p2wpkh_inputs:
        filepath = os.path.join(mempool_dir, filename)
        with open(filepath, 'r') as file:
            tx_data = json.load(file)
            verified = True
            for i in range(0, len(tx_data['vin'])):
                try:
                    verify_p2wpkh(tx_data, i)
                except ValueError as e:
                    verified = False
                    failed.append(filename)
                    print(e, "file failed:", filename)
                    break
                except BadSignatureError as e:
                    verified = False
                    failed.append(filename)
                    print(e, "file failed:", filename)
                    break
                except:
                    verified = False
                    failed.append(filename)
                    print("some other error", "file failed:", filename)
                    break
            if (verified):
                succeeded.append(filename)

    print(len(succeeded), "successes")
    print(len(failed), "fails")
    #print(failed)

    #TODO: around 26 signatures have sighash type 81 or 83
    #TODO: try to lower the ratio from 3008 successes and 90


def test5():
#(should succeed)
    mempool_dir = './mempool'
    filename = '0a250dfd08a8d349121a722baa0b600a3a218e5716430d2d5ad9f1b3fb6d48f7.json'
    filepath = os.path.join(mempool_dir, filename)
    with open(filepath, 'r') as file:
        tx_data = json.load(file)
        verified = True
        for i in range(0, len(tx_data['vin'])):
            #print("verifying: ", filename)
            try:
                verify_p2wpkh(tx_data, i)
            except ValueError as e:
                verified = False
                print(e, "file failed:", filename)
                break
            except BadSignatureError as e:
                verified = False
                print(e, "file failed:", filename)
                break
            except:
                verified = False
                print("some other error", "file failed:", filename)
                break
        if (verified):
            print("success")

#test all p2wsh
def test6():
    only_p2wsh_inputs = []
    for filename in os.listdir(mempool_dir):
        filepath = os.path.join(mempool_dir, filename)
        with open(filepath, 'r') as file:
            tx_data = json.load(file)
            all_v0_p2wsh = all(elem['prevout']['scriptpubkey_type'] == 'v0_p2wsh' for elem in tx_data['vin'])
            if(all_v0_p2wsh):
                only_p2wsh_inputs.append(filename)
    
    failed = []
    succeeded = []
    for filename in only_p2wsh_inputs:
        filepath = os.path.join(mempool_dir, filename)
        with open(filepath, 'r') as file:
            tx_data = json.load(file)
            verified = True
            for i in range(0, len(tx_data['vin'])):
                try:
                    verify_p2wsh(tx_data, i)
                except ValueError as e:
                    verified = False
                    failed.append(filename)
                    print(e, "file failed:", filename)
                    break
                except BadSignatureError as e:
                    verified = False
                    failed.append(filename)
                    print(e, "file failed:", filename)
                    break
                except:
                    verified = False
                    failed.append(filename)
                    print("some other error", "file failed:", filename)
                    break
            if (verified):
                succeeded.append(filename)

    print(len(succeeded), "successes")
    print(len(failed), "fails")
    #print(failed)

def test7():
    filename = 'ff4f6a0f58a252c4b05034a9207a7b4479c73c1217c2a2bf73c7f56a041f7420.json'
    filepath = os.path.join(mempool_dir, filename)
    with open(filepath, 'r') as file:
        tx_data = json.load(file)
        verified = True
        for i in range(0, len(tx_data['vin'])):
            #print("verifying: ", filename)
            try:
                verify_p2wsh(tx_data, i)
            except ValueError as e:
                verified = False
                print(e, "file failed:", filename)
                break
            except BadSignatureError as e:
                verified = False
                print(e, "file failed:", filename)
                break
            except:
                verified = False
                print("some other error", "file failed:", filename)
                break
        if (verified):
            print("success")


# ================================
# verify all p2sh
def test8():
    #test all p2wsh
    only_p2sh_inputs = []
    for filename in os.listdir(mempool_dir):
        filepath = os.path.join(mempool_dir, filename)
        with open(filepath, 'r') as file:
            tx_data = json.load(file)
            all_v0_p2sh = all(elem['prevout']['scriptpubkey_type'] == 'p2sh' for elem in tx_data['vin'])
            if(all_v0_p2sh):
                only_p2sh_inputs.append(filename)
    
    failed = []
    succeeded = []
    for filename in only_p2sh_inputs:
        filepath = os.path.join(mempool_dir, filename)
        with open(filepath, 'r') as file:
            tx_data = json.load(file)
            verified = True
            for i in range(0, len(tx_data['vin'])):
                try:
                    verify_p2sh(tx_data, i)
                except ValueError as e:
                    verified = False
                    failed.append(filename)
                    print(e, "\nfile failed:", filename)
                    break
                except BadSignatureError as e:
                    verified = False
                    failed.append(filename)
                    print(e, "\nfile failed:", filename)
                    break
                except:
                    verified = False
                    failed.append(filename)
                    print("some other error", "\nfile failed:", filename)
                    break
            if (verified):
                succeeded.append(filename)

    print(len(succeeded), "successes")
    print(len(failed), "fails")
    #print(failed)

#verify p2sh which is wrapping p2wpkh
def test9():
    filename = '0ac4f7f16822968c9fbc25e811c8acc05f29cf442f26ddfd69c1074abede59c9.json'
    filepath = os.path.join(mempool_dir, filename)
    with open(filepath, 'r') as file:
        tx_data = json.load(file)
        verified = True
        for i in range(0, len(tx_data['vin'])):
            #print("verifying: ", filename)
            try:
                verify_p2sh(tx_data, i)
            except ValueError as e:
                verified = False
                print(e, "file failed:", filename)
                break
            except BadSignatureError as e:
                verified = False
                print(e, "file failed:", filename)
                break
            except:
                verified = False
                print("some other error", "file failed:", filename)
                break
        if (verified):
            print("success")

#verify p2sh which is wrapping multisig
def test10():
    
    filename = 'ddc6fe9dd54783b8e49cb6f8bbf11a5bfcb0451eb7673045e44c0dafb13006ac.json'
    filepath = os.path.join(mempool_dir, filename)
    with open(filepath, 'r') as file:
        tx_data = json.load(file)
        verified = True
        for i in range(0, len(tx_data['vin'])):
            #print("verifying: ", filename)
            try:
                verify_p2sh(tx_data, i)
            except ValueError as e:
                verified = False
                print(e, "file failed:", filename)
                break
            except BadSignatureError as e:
                verified = False
                print(e, "file failed:", filename)
                break
            except:
                verified = False
                print("some other error", "file failed:", filename)
                break
        if (verified):
            print("success")
#verify p2sh which is wrapping p2wsh
def test11():
    filename = '676f5a844b8c4ed3fbad2dc5fecb8d27780717b76f19f6c2bb87cae5cffc81d1.json'
    filepath = os.path.join(mempool_dir, filename)
    with open(filepath, 'r') as file:
        tx_data = json.load(file)
        verified = True
        for i in range(0, len(tx_data['vin'])):
            #print("verifying: ", filename)
            try:
                verify_p2sh(tx_data, i)
            except ValueError as e:
                verified = False
                print(e, "file failed:", filename)
                break
            except BadSignatureError as e:
                verified = False
                print(e, "file failed:", filename)
                break
            except:
                verified = False
                print("some other error", "file failed:", filename)
                break
        if (verified):
            print("success")

#test1()
#test2()
#test3()
#test4()
#test5()
#test6()
#test7()
test8()
#test9()
#test10()
#test11()

#test all p2wsh
# only_p2sh_inputs = []
# for filename in os.listdir(mempool_dir):
#     filepath = os.path.join(mempool_dir, filename)
#     with open(filepath, 'r') as file:
#         tx_data = json.load(file)
#         all_v0_p2sh = all(elem['prevout']['scriptpubkey_type'] == 'p2sh' for elem in tx_data['vin'])
#         if(all_v0_p2sh):
#             only_p2sh_inputs.append(filename)

# success = []
# for filename in only_p2sh_inputs:
#     filepath = os.path.join(mempool_dir, filename)
#     with open(filepath, 'r') as file:
#         tx_data = json.load(file)
#         for i in range(0, len(tx_data['vin'])):
#             if tx_data['vin'][i]['inner_redeemscript_asm'].split()[-1] == 'OP_CHECKMULTISIG':
#                 success.append(filename)
#                 break

# print("multisig", success)


        
                


