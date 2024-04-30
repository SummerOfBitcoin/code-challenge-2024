import pandas as pd
import json
from serelization import wtxid_Serelization, dsha

# file_path = "mempool/ffbbcc1a0f725c68ee90265761c39812513d28281c8d2dc57f17dc18e2157c6e.json"

# with open(file_path, 'r') as file:
#     transaction_json_data = json.load(file)

# ans  = wtxid_Serelization(transaction_json_data)

# x = "02000000000101cf46c2191fde4e4e44b8fa8fa9b9913d1e93818206298c2b8b188f44bed62d010100000000ffffffff02401f000000000000225120e65ff50a8f5ad3b1b8b1595fcfa84a1f7f078078135e1492d51739d12e9a089ebed004000000000022512075334c38a38f32bfde98df25d435a4ac32baad2c76c237aa3704e5a7632840000140c3a17a149e79d0a4b505cbfd6a0072e3a3e74aae2c8736404b82f40dc53d3b270e007965a7cb663230f48d14773e06c3345cef1f7aed3c14d208c114785a6e7900000000"

# if ans == x:
#     print(True)
# else:
#     print(False)
#     print(ans)
    # print(x)


witness_root_hash =  "dbee9a868a8caa2a1ddf683af1642a88dfb7ac7ce3ecb5d043586811a41fdbf2"

witness_reserved_value = "0000000000000000000000000000000000000000000000000000000000000000"
print(witness_root_hash + witness_reserved_value)
wTXID_commitment = dsha(witness_root_hash+ witness_reserved_value)
print(wTXID_commitment)