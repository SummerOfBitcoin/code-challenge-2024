package main

import (
	"encoding/hex"
	"fmt"
)

func CreateWitnessMerkle() string {
	_, _, wTxIDs := Prioritize()
	wTxIDs = append([]string{"0000000000000000000000000000000000000000000000000000000000000000"}, wTxIDs...)
	merkleRoot := NewMerkleTree(wTxIDs)
	fmt.Println("WMKR: ", hex.EncodeToString(merkleRoot.Data))
	commitment_string := hex.EncodeToString(merkleRoot.Data) + "0000000000000000000000000000000000000000000000000000000000000000"
	WitnessCommitment, _ := hex.DecodeString(commitment_string)
	WitnessCommitment = to_sha(to_sha(WitnessCommitment))
	fmt.Println("Witness Commitment: ", hex.EncodeToString(WitnessCommitment))
	return hex.EncodeToString(WitnessCommitment)
}
