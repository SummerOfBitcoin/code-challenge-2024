'''from bitcoin.core import CTransaction, CTxIn, CTxOut
from bitcoin.core.script import CScript, SignatureHash, SIGHASH_ALL
from bitcoin.wallet import CBitcoinAddress, CBitcoinSecret

# Transaction data (example)
version = 1
locktime = 0
txid_prev = '64ca1941edef34b690dd6672c7d395c60882067f7f3fc396e64d88e39c1da5b4'
vout_prev = 0
scriptpubkey_prev = '0014d5bfb7a6d05d44c1e14443919b30d284c0c0a10a'
value_prev = 10740
scriptpubkey_type = 'v0_p2wpkh'
scriptpubkey_address = 'bc1q6klm0fkst4zvrc2ygwgekvxjsnqvpgg2jjfurm'
value = 9520
scriptpubkey = 'a91450feb99697a4901d3fe082eca341204fb6711b9487'
scriptpubkey_asm = 'OP_HASH160 OP_PUSHBYTES_20 50feb99697a4901d3fe082eca341204fb6711b94 OP_EQUAL'
scriptpubkey_type = 'p2sh'
scriptpubkey_address = '395H8VPYPtAoZWa2bx5SRyN2VojXrsb7j3'
witness_script = '3044022100884219ecbb54a6ec4d09597ca6aca49692ded3c2ffb13d1858ca5b70e59fabb4021f2de73021471a01d8f03a71a923b662f00120d181d0f7fa8e06faa1bb750e8f0120271d4e7a84804c075017593271c370e8983f704f123d22aa747cd321268981cba'
print("HELLOHELLO")
witness = [bytes.fromhex(witness_script)]
print("HELLOHELLO")
# Construct the transaction
#txin = CTxIn(outpoint=CTxOut(), n=int(txid_prev, 16), scriptSig=CScript.from_hex(scriptpubkey_prev))
txin = CTxIn(CTxOut(), int(txid_prev, 16), vout_prev)
txout = CTxOut(value, CScript.from_hex(scriptpubkey))
tx = CTransaction([txin], [txout])

# Verify the witness
sighash = SignatureHash(CScript.from_hex(scriptpubkey_prev), tx, 0, SIGHASH_ALL)
sk = CBitcoinSecret("dc3e5dcdb0a8def798f3d118ae8a3b6749d4d7800b2b66e0f57a50b0f5628d13")
sig = sk.sign(sighash) + bytes([SIGHASH_ALL])
witness.append(sig)
tx.wit = witness

# Verify the transaction
is_valid = tx.is_coinbase() == False and tx.check_tx_input() == True and tx.is_final(locktime)
print("Is valid:", is_valid)
'''
from bitcoin.core import x, lx, b2x, b2lx, COIN, COutPoint, CTxIn, CTxOut, CTransaction, Hash160, Hash
from bitcoin.core.script import CScript, SignatureHash, SIGHASH_ALL, OP_DUP, OP_HASH160, OP_EQUALVERIFY, OP_CHECKSIG, OP_RETURN
from bitcoin.wallet import CBitcoinSecret, P2PKHBitcoinAddress

# Example transaction data
txid_prev = "64ca1941edef34b690dd6672c7d395c60882067f7f3fc396e64d88e39c1da5b4"
vout_prev = 0
scriptpubkey_prev = "0014d5bfb7a6d05d44c1e14443919b30d284c0c0a10a"
value_prev = 10740
value = 9520
scriptpubkey = "a91450feb99697a4901d3fe082eca341204fb6711b9487"


outpoint = COutPoint(lx(txid_prev), vout_prev)
txin = CTxIn(outpoint=outpoint)

txout = CTxOut(nValue=value, scriptPubKey=CScript.from_hex(scriptpubkey))

tx = CTransaction([txin], [txout])


scriptSig_hex = "47304402200f50ad086e2d1009c2c2be6da37f3445e4b7e927968c54e60a5cfc0f39da23b02205ec5e15b24dfdc4cf6f3a888e2a7ee5ff38e3d3d50615f7228d5f6c2e45f0c4201210271d4e7a84804c075017593271c370e8983f704f123d22aa747cd321268981cba"
scriptSig = CScript.from_hex(scriptSig_hex)


txin.scriptSig = scriptSig


witness_script_hex = "3044022100884219ecbb54a6ec4d09597ca6aca49692ded3c2ffb13d1858ca5b70e59fabb4021f2de73021471a01d8f03a71a923b662f00120d181d0f7fa8e06faa1bb750e8f0120271d4e7a84804c075017593271c370e8983f704f123d22aa747cd321268981cba"
witness = [bytes.fromhex(witness_script_hex)]


tx.wit = witness

# Verify the transaction
print("ScriptSig and Witness are valid:", tx.is_coinbase() == False and tx.check_tx_input() == True and tx.is_final(0))
