package Validation

import (
	"encoding/hex"
	"strings"
	"github.com/pred695/code-challenge-2024-pred695/Utils"
)

/*
The example:

	{
	      "scriptpubkey": "76a9146085312a9c500ff9cc35b571b0a1e5efb7fb9f1688ac",
	      "scriptpubkey_asm": "OP_DUP OP_HASH160 OP_PUSHBYTES_20 6085312a9c500ff9cc35b571b0a1e5efb7fb9f16 OP_EQUALVERIFY OP_CHECKSIG",
	      "scriptpubkey_type": "p2pkh",
	      "scriptpubkey_address": "19oMRmCWMYuhnP5		W61ABrjjxHc6RphZh11",
	      "value": 100000
	}
*/
const (
	versionByte string = "00"
)

func P2pkh(scriptpubkey_asm string) []byte {
	str := strings.Split(scriptpubkey_asm, " ")

	pubkeyhash := Utils.ExtractHexFromScriptpubkeyAsm(str)
	// Convert hex to bytes)
	pubkeyhash_bytes, _ := hex.DecodeString(pubkeyhash)
	versionByte_bytes, _ := hex.DecodeString(versionByte)

	version_pubkeyhash := append(versionByte_bytes, pubkeyhash_bytes...)

	checksum := Utils.To_sha(Utils.To_sha(version_pubkeyhash))

	appended_checksum := append(version_pubkeyhash, checksum[:4]...)

	address := Utils.Base58Encode(appended_checksum)

	return address

}
