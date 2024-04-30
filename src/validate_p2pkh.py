import opcode_handler
import os
import json

directory = "../mempool/"
def validate_p2pkhh(filename):
    print(filename)
    with open(os.path.join(directory, filename), 'r') as file:
        data = json.load(file)
        if 'vin' in data and isinstance(data['vin'], list):
            for vin in data['vin']:
                if 'scriptsig' in vin:
                    last_66_chars = vin['scriptsig'][-66:]
                    hash = opcode_handler.hash160(last_66_chars)
                    hash_given = vin['prevout']['scriptpubkey'][6:46]
                    if(hash == hash_given):
                        # pass
                        opcode_handler.op_checksig(data)
                        # opcode_handler.serialize(data)
                        # opcode_handler.checkSer(data)
                        # opcode_handler.get_total_amount_in_inputs(data)
                        # print("Pass 1")
                    else:
                        opcode_handler.get_total_amount_in_inputs(data)
                        print(filename)    
                    # print(hash ,"   ==  ", hash_given)
                    # print("Last 66 characters of scriptsig inside vin:", last_66_chars)

validate_p2pkhh('085bd26cc0003281d1ebecda8a5e16c378f32200be01b1318c30d6f35fcd377c.json')
# validate_p2pkhh('0d7f82acd12a9f2ddec18af6f977ab8c5fa98ee488f7e611924c4d320cfbfa82.json')