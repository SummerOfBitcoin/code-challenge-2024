package Validation

import (
	"encoding/hex"
	"strings"

	"github.com/btcsuite/btcutil/bech32"
	"github.com/pred695/code-challenge-2024-pred695/Utils"
)

/*
		{
	        "scriptpubkey": "002091e3d9fd88a640bf81a6a5997c73340b1b3e6068c9e4e98fe9398621a5d1f561",
	        "scriptpubkey_asm": "OP_0 OP_PUSHBYTES_32 91e3d9fd88a640bf81a6a5997c73340b1b3e6068c9e4e98fe9398621a5d1f561",
	        "scriptpubkey_type": "v0_p2wsh",
	        "scriptpubkey_address": "bc1qj83anlvg5eqtlqdx5kvhcue5pvdnucrge8jwnrlf8xrzrfw374sszral4a",
	        "value": 326923
	      }
*/
func P2wsh(scriptpubkey_asm string) []byte {
	witness_scriptHash := Utils.ExtractHexFromScriptpubkeyAsm(strings.Split(scriptpubkey_asm, " "))
	witness_scriptHash_bytes, _ := hex.DecodeString(witness_scriptHash)
	version := "00"
	version_bytes, _ := hex.DecodeString(version)

	conv, _ := bech32.ConvertBits(witness_scriptHash_bytes, 8, 5, true)
	conv = append(version_bytes, conv...)

	hrp := "bc"
	encodedAddress, _ := bech32.Encode(hrp, conv)
	return []byte(encodedAddress)
}
