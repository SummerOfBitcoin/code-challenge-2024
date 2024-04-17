package main

import (
	"encoding/hex"
	"fmt"
	"os"
	"strings"
)

func CreateWitnessMerkle() string {
	_, _, wTxIDs := Prioritize()
	wTxIDs = append([]string{"0000000000000000000000000000000000000000000000000000000000000000"}, wTxIDs...)
	var wtxidsnew []string
	file, _ := os.ReadFile("wtxids.txt")
	for _, line := range strings.Split(string(file), "\n") {
		wtxidsnew = append(wtxidsnew, line)
	}
	for idx := range wtxidsnew {
		byt, _ := hex.DecodeString(wtxidsnew[idx])
		byt = reverseBytes(byt)
		wtxidsnew[idx] = hex.EncodeToString(byt)
	}
	fmt.Println(len(wtxidsnew))
	merkleRoot := NewMerkleTree(wtxidsnew)
	fmt.Println("WMKR: ", hex.EncodeToString(merkleRoot.Data))
	commitment_string := hex.EncodeToString(merkleRoot.Data) + "0000000000000000000000000000000000000000000000000000000000000000"
	WitnessCommitment, _ := hex.DecodeString(commitment_string)
	WitnessCommitment = to_sha(to_sha(WitnessCommitment))
	fmt.Println("Witness Commitment: ", hex.EncodeToString(WitnessCommitment))
	return hex.EncodeToString(WitnessCommitment)
}
