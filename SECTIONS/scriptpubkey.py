import hashlib
import binascii


ScriptPubKey = "76a914010966776006953d5567439e5e39f86a0d273bee88ac"
ScriptSig = "3044022100884219ecbb54a6ec4d09597ca6aca49692ded3c2ffb13d1858ca5b70e59fabb4021f2de73021471a01d8f03a71a923b662f00120d181d0f7fa8e06faa1bb750e8f01"
tx_hash = "46f4ea7258f733c0a64a7ed4bd7c65e149c0b6b5cda1e146071e8f0dd0158a10"

ScriptPubKey_bytes = binascii.unhexlify(ScriptPubKey)
ScriptSig_bytes = binascii.unhexlify(ScriptSig)


combined_script = ScriptSig_bytes + ScriptPubKey_bytes


combined_script_hash = hashlib.sha256(hashlib.sha256(combined_script).digest()).digest()


reversed_hash = bytes(reversed(combined_script_hash))


if reversed_hash.hex() == tx_hash:
    print("Transaction hash is valid")
else:
    print("Transaction hash is not valid")
