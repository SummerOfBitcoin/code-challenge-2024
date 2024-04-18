/*
	{
	      "scriptpubkey": "a914d6bfee7c8c925ad5ff17035b2672eee12baf168b87",
	      "scriptpubkey_asm": "OP_HASH160 OP_PUSHBYTES_20 d6bfee7c8c925ad5ff17035b2672eee12baf168b OP_EQUAL",
	      "scriptpubkey_type": "p2sh",
	      "scriptpubkey_address": "3MGWTEe7C77RBmhtGhYN1B3fszdXYSQdZA",
	      "value": 2313802
	 }
*/
package Validation

import (
	"encoding/hex"
	"strings"

	"github.com/pred695/code-challenge-2024-pred695/Utils"
)

func P2sh(scriptpubkey_asm string) []byte {
	hashed_script := Utils.ExtractHexFromScriptpubkeyAsm(strings.Split(scriptpubkey_asm, " "))
	hashed_script_bytes, _ := hex.DecodeString(hashed_script)
	versionByte_bytes, _ := hex.DecodeString("05")
	version_hash := append(versionByte_bytes, hashed_script_bytes...)

	checksum := Utils.To_sha(Utils.To_sha(version_hash))

	appended_checksum := append(version_hash, checksum[:4]...)

	address := Utils.Base58Encode(appended_checksum)

	return address

}
