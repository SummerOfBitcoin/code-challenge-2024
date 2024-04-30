import hashlib

def get_coinbase_transaction(block_height, fees, block_reward, witness_root_hash, wtxid_commitment):
    tx = bytearray()

    # add version
    version = 0x00000002
    tx.extend(version.to_bytes(4, byteorder='little'))

    # add marker and flag
    marker = 0x00
    tx.append(marker)
    flag = 0x01
    tx.append(flag)

    # add input count
    input_count = 0x01
    tx.append(input_count)

    # add coinbase input
    coinbase_input = bytes.fromhex("0000000000000000000000000000000000000000000000000000000000000000")
    tx.extend(coinbase_input)

    # add value of the output
    output_value = 0xffffffff
    tx.extend(output_value.to_bytes(8, byteorder='little'))

    # place coinbase
    coinbase = bytearray()
    temp = bytearray()
    height = block_height.to_bytes(4, byteorder='little')
    height_size = len(height).to_bytes(1, byteorder='little')
    temp.extend(height_size)
    temp.extend(height)
    random_data = 0x69966996
    temp.extend(random_data.to_bytes(4, byteorder='little'))
    coinbase.append(len(temp))
    coinbase.extend(temp)

    # add sequence
    sequence = 0xffffffff
    tx.extend(sequence.to_bytes(4, byteorder='little'))

    # add output count
    output_count = 0x02
    tx.append(output_count)

    # add value of the output
    output_value = fees + block_reward
    tx.extend(output_value.to_bytes(8, byteorder='little'))

    script_str = "6a026996"
    script = bytes.fromhex(script_str)
    tx.append(len(script))
    tx.extend(script)

    # add value of the output
    output_value = 0x0000000000000000
    tx.extend(output_value.to_bytes(8, byteorder='little'))

    commit = bytearray()
    commit.append(0x6a)
    commit.append(0x24)
    commit.extend(witness_root_hash)
    commit.extend(wtxid_commitment)
    hash_value = hashlib.sha256(hashlib.sha256(commit).digest()).digest()

    commit.extend(hash_value)

    # add number of witnesses
    witness_count = 0x01
    tx.append(witness_count)

    # add witness
    witness_size = 0x20
    tx.append(witness_size)

    witness_data = bytes.fromhex("0000000000000000000000000000000000000000000000000000000000000000")
    tx.extend(witness_data)

    # add locktime
    locktime = 0x00000000
    tx.extend(locktime.to_bytes(4, byteorder='little'))

    return tx.hex()

# Example usage:
block_height = 123456
fees = 1000000
block_reward = 123456789
witness_root_hash = bytes.fromhex("aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899")
wtxid_commitment = bytes.fromhex("112233445566778899aabbccddeeffaabbccddeeff00112233445566778899aabbccddeeff00112233445566778899")
print(get_coinbase_transaction(block_height, fees, block_reward, witness_root_hash, wtxid_commitment))
