import hashlib
import struct
from ecdsa import SECP256k1, VerifyingKey, BadSignatureError
import serialize



def double_sha256(data):
    hash1 = hashlib.sha256(data).digest()
    hash2 = hashlib.sha256(hash1).digest()
    return hash2

def double_sha256_nodigest(data):
    hash1 = hashlib.sha256(data).digest()
    hash2 = hashlib.sha256(hash1)
    return hash2

def hash160(data):
    sha256_hash = hashlib.sha256(data).digest()
    ripemd160_hash = hashlib.new('ripemd160', sha256_hash).digest()
    return ripemd160_hash

def int_to_compact_size(num):
    if(0 <= num <= 252):
        return num.to_bytes(1, byteorder='little').hex()
    
    elif(253 <= num <= 65535):
        return "fd" + num.to_bytes(2, byteorder='little').hex()

    else: raise ValueError("num is too large")

#TODO: implement some error checking for decoding der encoded signatures
def der_to_rawsig(der_sig):

    der_sig = der_sig[6:]
    der_sig = der_sig[2:]
    if(der_sig[:2] == "00"):
        der_sig = der_sig[2:]
    r = der_sig[:64]
    
    der_sig = der_sig[64 + 4:]
    der_sig = der_sig[:-2]
    return r, der_sig

def are_all_elements_same(arr):
    # Check if the array is empty
    if not arr:
        return True  # Empty array, so all elements are technically the same (None)

    # Compare each element with the first element
    first_element = arr[0]
    for element in arr[1:]:
        if element != first_element:
            return False  # Found an element that is different from the first element

    return True  # All elements are the same

def determine_script_type(script):
    split = script.split()
    if split[-1] == 'OP_CHECKMULTISIG':
        return 'multisig'
    
    elif split[0] == 'OP_0' and split[1] == 'OP_PUSHBYTES_20':
        return 'p2wpkh'
    
    elif split[0] == 'OP_0' and split[1] == 'OP_PUSHBYTES_32':
        return 'p2wsh'
    else:
        print('some other script type:', script)

def validate_multisig(inner_script, curr_input, curr_witness, tx_data, witness, input_index = -1):
    inner_script = inner_script.split()
    inner_script.pop()
    assert inner_script[-1][:11] == 'OP_PUSHNUM_'
    n_public_keys = int(inner_script[-1][-1])
    inner_script.pop()
    public_keys = []
    for _ in range(0, n_public_keys):
        public_keys.append(inner_script.pop())
        assert inner_script[-1] == 'OP_PUSHBYTES_33' or inner_script[-1] == 'OP_PUSHBYTES_65'
        inner_script.pop()
    
    #the keys are in order in which they appear in inner_witnessscript_asm
    public_keys = public_keys[::-1]
    assert inner_script[-1][:11] == 'OP_PUSHNUM_'
    m_signatures = int(inner_script[-1][-1])
    #save the witness_script for signature verification
    witness_script = curr_witness.pop()
    #signatures in order which they appear in witness, the first element is empty (just pop it off)
    signatures = curr_witness[1:]
    assert m_signatures == len(signatures)
    #print("we have a ", len(signatures), "of", len(public_keys), "multisig")
    #print('signatures:', signatures)
    #print('public keys:', public_keys)

    #verify multisig
    tally = 0
    for sig in signatures:
        sig_hash = struct.pack('<I', int.from_bytes(bytes.fromhex(sig[-2:]), byteorder='big')).hex()

        message = ""
        if (witness == True):
            message = serialize.serialize_segwit_msg(tx_data, sig_hash, curr_input, witness_script, is_p2wsh = True)
        elif(witness == False):
            for input_tx in tx_data["vin"]:
                input_tx["scriptsig"] = ""
            inputs = tx_data['vin']
            inputs[input_index]['scriptsig'] = witness_script
            message = serialize.serialize_tx(tx_data['version'], tx_data['vin'], tx_data['vout'], tx_data['locktime'])
            message += sig_hash
        
        
        r, s = der_to_rawsig(sig)
        raw_signature = r + s
        signature_bytes = bytes.fromhex(raw_signature)
        
        public_key_index = 0
        for i in range(0, len(public_keys)):
            pubkey = public_keys[i]
            public_key_bytes = bytes.fromhex(pubkey)
            # use public key (r concat s) to generate verifying key
            verifying_key = VerifyingKey.from_string(public_key_bytes, curve=SECP256k1)
            #perform verify signature
            try:
                verifying_key.verify(signature_bytes, bytes.fromhex(message), hashfunc=double_sha256_nodigest)
                tally += 1
                public_key_index = i
                break
                #print("success verifying ", sig, "against", pubkey)
            except:
                #print("failed verifying ", sig, "against", pubkey)
                public_key_index = i
        
        #ignore the public_leys that have already failed
        public_keys = public_keys[public_key_index + 1:]

    if (tally == m_signatures):
        return
    else:
        raise BadSignatureError("not enough signatures")


#test these eventually:
def serialize_witness(witness):
    num_items = int_to_compact_size(len(witness))
    serialized_witness = num_items

    for item in witness:
        serialized_witness += int_to_compact_size(len(item) / 2)
        serialized_witness += item
    
    return serialized_witness

def compute_weight_units(serialized_tx, witness_field = []):
    non_witness_weight = (len(serialized_tx) / 2) * 4
    serialized_witness = serialize_witness(witness_field)
    witness_weight = len(serialized_witness) / 2 * 1
    return non_witness_weight + witness_weight + 2 # +2 for marker and flag

def calculate_transaction_fees(transaction):
    total_input = sum(vin['prevout']['value'] for vin in transaction['vin'])
    total_output = sum([vout['value'] for vout in transaction['vout']])
    fees = total_input - total_output
    return fees

# tests
# der_sig = "304402202c31662db969bbeb98e3a759583833a85f76de94253d3bcd1e551b38e49bff380220071d7b4a47a6ec28f2fa191aa606c32506bd1c8b0b89482c965870717145cc6b01"
# print(der_to_rawsig(der_sig))

# der_sig1 = "3045022100e01f5b99d49e6fe3a7cfe67a2236522f7f3d3a440b4e58dc5b385517774afd0e02204754713454ef370db5d81a0762c474f7c25475a5c95dcd107939a4fe1312ab7b"
# print(der_to_rawsig(der_sig1))

# der_sig2 = "3045022100e295f9aedc4673d0abefc35ec5b9387a46453be1278e132045d7aeeb37474d11022039ae4e3070de9cebef749c8afa2cc6e31e055de7ec0c1ebcbff813d0ca9c5d9e01"
# print(der_to_rawsig(der_sig2))