import hashlib
import time
from datetime import datetime

def get_block_header(merkle_root):
    nonce = 0
    block_header = ""

    # target in compact format => 1f00ffff
    target = int("0000ffff00000000000000000000000000000000000000000000000000000000", 16)

    while True:
        predigest = bytearray()

        # add version
        version = 0x00000002
        predigest.extend(version.to_bytes(4, byteorder='little'))

        # add prev block hash
        prev_block_hash = bytearray(32)  # This should be the hash of the previous block
        predigest.extend(prev_block_hash)

        # add merkle root
        predigest.extend(merkle_root)

        # add time
        time_now = int(time.time())
        predigest.extend(time_now.to_bytes(4, byteorder='little'))

        # add target
        bits = 0x1f00ffff
        predigest.extend(bits.to_bytes(4, byteorder='big'))

        # add nonce
        predigest.extend(nonce.to_bytes(4, byteorder='little'))

        header_candidate = hashlib.sha256(hashlib.sha256(bytes(predigest)).digest()).digest()

        # Convert header_candidate to integer
        header_for_calc = int.from_bytes(header_candidate, byteorder='big')

        # Compare header_for_calc with target
        if header_for_calc < target:
            block_header = header_candidate.hex()
            break

        nonce += 1

    return block_header

# Example usage:
merkle_root = bytes.fromhex("b472a266d0bd89c13706a4132ccfb16f7c3b9fcb9319ee4d08aeb78f4955a060")
print(get_block_header(merkle_root))
