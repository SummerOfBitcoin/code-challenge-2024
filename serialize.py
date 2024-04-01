import os
import json
from hashlib import sha256
from util import double_sha256, int_to_compact_size

def serialize_tx(version_dec, inputs, outputs, locktime_dec):

    inputs_serialized = []
    outputs_serialized = []

    #version in 4 byte little endian
    version = version_dec.to_bytes(4, byteorder='little').hex()

    #input count as a compact size (assume we only need one byte)
    len_inputs = len(inputs)
    input_count = int_to_compact_size(len_inputs)
    
    for i in range(0, len_inputs):
        #txid as 32 bytes in natural byte order (reverssed from the json file)
        input_string = inputs[i]['txid']
        reverse_split = [input_string[i:i+2] for i in range(0, len(input_string), 2)][::-1]
        txid = ''.join(reverse_split)

        #index number of output (of previous transaction) that is spent as 4 byte little endian
        vout = inputs[i]['vout'].to_bytes(4, byteorder='little').hex()

        #scriptsig as compact size
        script_sig = inputs[i]['scriptsig']
        script_sig_size = int_to_compact_size(int(len(script_sig)/2))

        #sequence of 4 bytes little endian
        sequence = inputs[i]['sequence'].to_bytes(4, byteorder='little').hex()

        inputs_serialized.append(txid + vout + script_sig_size + script_sig + sequence)

    len_outputs = len(outputs)
    output_count = int_to_compact_size(len_outputs)

    for j in range (0, len_outputs):
        #amount as 8 byte little endian
        amount = outputs[j]['value'].to_bytes(8, byteorder='little').hex()

        #scriptpubkey as compact size
        script_pubkey = outputs[j]['scriptpubkey']
        script_pubkey_size = int_to_compact_size(int(len(script_pubkey)/2))

        outputs_serialized.append(amount + script_pubkey_size + script_pubkey)

    #locktime as 4 bytes little-endian
    locktime = locktime_dec.to_bytes(4, byteorder='little').hex()
    raw_inputs = ''.join(inputs_serialized)
    raw_outputs = ''.join(outputs_serialized)
    raw_tx = version + input_count + raw_inputs + output_count + raw_outputs + locktime
    return raw_tx

    # print("Version: ", version, "of type ", type(version))
    # print("Input Count: ", input_count, "of type ", type(input_count))
    # print("Txid: ", txid, "of type ", type(txid))
    # print("Vout: ", vout, "of type ", type(vout))
    # print("ScriptSig Size: ", script_sig_size, "of type", type(script_sig_size))
    # print("ScriptSig: ", script_sig, "of type ", type(script_sig))
    # print("Sequence: ", sequence, "of type ", type(sequence))
    # print("Output Count: ", output_count, "of type ", type(output_count))
    # print("Amount: ", amount, "of type", type(amount))
    # print("ScriptPubkey Size: ", script_pubkey_size, "of type", type(script_pubkey_size))
    # print("ScriptPubKey: ", script_pubkey, "of type", type(script_pubkey))
    # print(inputs_serialized)
    # print(outputs_serialized)
    # print("Locktime: ", locktime, "of type", type(locktime))

def serialize_segwit_msg(tx_data, hashtype, curr_input, witness_script = "", is_p2wsh = False):

    #nVersion of the transaction (4-byte little endian) (reusable)
    nVersion = tx_data['version'].to_bytes(4, byteorder='little').hex()
    #print("nVersion:", nVersion, "of type", type(nVersion))

    #hashPrevouts (32-byte hash) (reusable)
    serialized_tx_vout = ""
    for input in tx_data['vin']:
        input_string = input['txid']
        txid = ''.join([input_string[i:i+2] for i in range(0, len(input_string), 2)][::-1])
        vout = input['vout'].to_bytes(4, byteorder='little').hex()
        #print("txid:", txid, "of type", type(txid))
        #print("vout:", vout, "of type", type(vout))
        serialized_tx_vout += txid
        serialized_tx_vout += vout

    #print("serialized_tx_vout:", serialized_tx_vout)
    hashPrevouts = double_sha256(bytes.fromhex(serialized_tx_vout)).hex()
    #print("hashPrevouts: ", hashPrevouts, "of type", type(hashPrevouts))

    #hashSequence (32-byte hash), assuming the sighash type is 01 (reusable)
    serialized_sequences = ""
    for input in tx_data['vin']:
        serialized_sequences += input['sequence'].to_bytes(4, byteorder='little').hex()

    #print("serialized_sequences", serialized_sequences)
    hashSequence = double_sha256(bytes.fromhex(serialized_sequences)).hex()
    #print("hashSequence:", hashSequence, "of type", type(hashSequence))

    #hashOutputs (32-byte hash), assuming the sighash type is 01 (do we need scriptpubkeysize?) (reusable)
    serialized_outputs = ""
    for output in tx_data['vout']:
        amount = output['value'].to_bytes(8, byteorder='little').hex()  #8-byte little endian
        scriptPubKey = output['scriptpubkey']
        scriptpubkeysize = int_to_compact_size(int(len(scriptPubKey) / 2))
        serialized_outputs = serialized_outputs + amount + scriptpubkeysize + scriptPubKey

    #print("serialized_outputs:", serialized_outputs)
    hashOutputs = double_sha256(bytes.fromhex(serialized_outputs)).hex()
    #print("hashOutputs:", hashOutputs, "of type", type(hashOutputs))

    #nLocktime of the transaction (4-byte little endian) (reusable)
    nLocktime = tx_data['locktime'].to_bytes(4, byteorder='little').hex()
    #print("nLocktime:", nLocktime, "of type", type(nLocktime))

    #TODO: recalculate hashOutputs for other hash types
    # outpoint (32-byte hash + 4-byte little endian) (TXID+VOUT) (not reusable)
    input_string = curr_input['txid']
    txid = ''.join([input_string[i:i+2] for i in range(0, len(input_string), 2)][::-1])
    vout = curr_input['vout'].to_bytes(4, byteorder='little').hex()
    outpoint = txid + vout
    #print("outpoint ", i, ":", outpoint, "of type", type(outpoint))

    # scriptCode of the input (serialized as scripts inside CTxOuts) (not reusable)
    #in the p2wpkh case 0x1976a914{20-byte-pubkey-hash}88ac (TODO: implement p2wsh)
    scriptCode = ""
    if(is_p2wsh == False):
        publickeyhash = curr_input['prevout']['scriptpubkey_asm'].split()[2]
        scriptCode = '1976a914' + publickeyhash + '88ac'
        #print("scriptCode:", scriptCode, "of type", type(scriptCode))
    elif(is_p2wsh == True):
        scriptCode = int_to_compact_size(int(len(witness_script) / 2)) + witness_script
        #print("scriptCode:", scriptCode, "of type", type(scriptCode))
        
    # value of the output spent by this input (8-byte little endian) (not reusable)
    ith_value = curr_input['prevout']['value'].to_bytes(8, byteorder='little').hex()
    #print("ith_value:", ith_value, "of type", type(ith_value))

    # nSequence of the input (4-byte little endian)  (not reusable)
    nSequence = curr_input['sequence'].to_bytes(4, byteorder='little').hex()
    #print("nSequence:", nSequence, "of type", type(nSequence))
    return (nVersion + hashPrevouts + hashSequence + outpoint + scriptCode + ith_value + nSequence + hashOutputs + nLocktime + hashtype)
    
    

#test
mempool_dir = './mempool'
for filename in os.listdir(mempool_dir):
    filepath = os.path.join(mempool_dir, filename)
    with open(filepath, 'r') as file:
        tx_data = json.load(file)
        
        raw_tx = serialize_tx(tx_data['version'], tx_data['vin'], tx_data['vout'], tx_data['locktime'])
        tx_id = double_sha256(bytes.fromhex(raw_tx)).hex()
        # print(raw_tx == '')

        txid_rev = ''.join([tx_id[i:i+2] for i in range(0, len(tx_id), 2)][::-1])
        #print(txid_rev)
        if(sha256(bytes.fromhex(txid_rev)).digest().hex() != filename[:-5]):
            print("no match") #prints nothing (it works)