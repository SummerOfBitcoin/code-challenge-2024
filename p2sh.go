/*
	{
	      "scriptpubkey": "a914d6bfee7c8c925ad5ff17035b2672eee12baf168b87",
	      "scriptpubkey_asm": "OP_HASH160 OP_PUSHBYTES_20 d6bfee7c8c925ad5ff17035b2672eee12baf168b OP_EQUAL",
	      "scriptpubkey_type": "p2sh",
	      "scriptpubkey_address": "3MGWTEe7C77RBmhtGhYN1B3fszdXYSQdZA",
	      "value": 2313802
	 }
*/
package main

import (
	"encoding/hex"
	"strings"
)

func p2sh(scriptpubkey_asm string) []byte {
	hashed_script := ExtractHexFromScriptpubkeyAsm(strings.Split(scriptpubkey_asm, " "))
	hashed_script_bytes, _ := hex.DecodeString(hashed_script)
	versionByte_bytes, _ := hex.DecodeString("05")
	version_hash := append(versionByte_bytes, hashed_script_bytes...)

	checksum := to_sha(to_sha(version_hash))

	appended_checksum := append(version_hash, checksum[:4]...)

	address := Base58Encode(appended_checksum)

	return address

}
