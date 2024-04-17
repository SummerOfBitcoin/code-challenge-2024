package main

import (
	"encoding/hex"
	"strings"

	"github.com/btcsuite/btcutil/bech32"
)

/*
		{
	      "scriptpubkey": "	",
	      "scriptpubkey_asm": "OP_0 OP_PUSHBYTES_20 ce0b5aa0dac72397a8aa5a85d90a2cfb46f0f630",
	      "scriptpubkey_type": "v0_p2wpkh",
	      "scriptpubkey_address": "bc1qec944gx6cu3e0292t2zajz3vldr0pa3sh356d9",
	      "value": 546
	    }
*/
func p2wpkh(scriptpubkey_asm string) []byte {

	pubkeyHash := ExtractHexFromScriptpubkeyAsm(strings.Split(scriptpubkey_asm, " ")) //or the witness program
	version := "00"

	pubkeyHashBytes, _ := hex.DecodeString(pubkeyHash)
	versionBytes, err := hex.DecodeString(version)

	conv, err := bech32.ConvertBits(pubkeyHashBytes, 8, 5, true)
	Handle(err)

	versionPubkeyHash := append(versionBytes, conv...)
	address, err := bech32.Encode("bc", versionPubkeyHash)
	Handle(err)
	return []byte(address)

}

