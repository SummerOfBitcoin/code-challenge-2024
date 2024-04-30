import os
import json

import opcode_handler
import validate_p2pkh
import validate_p2sh
import validate_p2tr
import validate_p2wpkh
import validate_p2wsh

directory = '../mempool/'

scriptpubkey_type_counts = {}
# Function to read JSON files and print file names with scriptpubkey_type of vin = "p2pkh"
def segregate_files_on_type(directory):
    for filename in os.listdir(directory):
        if filename.endswith('.json'):
            with open(os.path.join(directory, filename), 'r') as file:
                data = json.load(file)
                # Check if vin has scriptpubkey_type "p2pkh"
                if 'vin' in data and isinstance(data['vin'], list):
                    for vin in data['vin']:
                        if 'prevout' in vin and 'scriptpubkey_type' in vin['prevout']:
                            if vin['prevout']['scriptpubkey_type'] == 'p2pkh':
                                # print("p2pkh")
                                validate_p2pkh.validate_p2pkhh(filename)
                            # if vin['prevout']['scriptpubkey_type'] == 'p2sh':
                            #     print("p2sh")
                            # if vin['prevout']['scriptpubkey_type'] == 'v0_p2wpkh':
                            #     print("p2wpkh")        
                            # if vin['prevout']['scriptpubkey_type'] == 'v0_p2wsh':
                            #     print("p2wsh")
                            # if vin['prevout']['scriptpubkey_type'] == 'v1_p2tr':
                            #     print("p2tr")        
                            scriptpubkey_type = vin['prevout']['scriptpubkey_type']
                            scriptpubkey_type_counts[scriptpubkey_type] = scriptpubkey_type_counts.get(scriptpubkey_type, 0) + 1

                            # print(f"File: {filename}")


segregate_files_on_type(directory)

# for scriptpubkey_type, count in scriptpubkey_type_counts.items():
#     print(f"Scriptpubkey Type: {scriptpubkey_type}, Count: {count}")
