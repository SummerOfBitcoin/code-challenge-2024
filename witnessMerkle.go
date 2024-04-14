package main

import (
	"encoding/hex"
)

func CreateWitnessMerkle() string {
	_, _, wTxIDs := Prioritize()
	wTxIDs = append([]string{"0000000000000000000000000000000000000000000000000000000000000000"}, wTxIDs...)
	merkleRoot := NewMerkleTree(wTxIDs)
	// fmt.Println("Witness Merkle Root: ", hex.EncodeToString(merkleRoot.Data))
	commitment_string := hex.EncodeToString(merkleRoot.Data) + "0000000000000000000000000000000000000000000000000000000000000000"
	WitnessCommitment, _ := hex.DecodeString(commitment_string)
	WitnessCommitment = to_sha(to_sha(WitnessCommitment))
	// file, _ := os.Create("wmkr.txt")
	// defer file.Close()
	// for _, tx := range wTxIDs {
	// 	file.WriteString(tx + "\n")
	// }
	return hex.EncodeToString(WitnessCommitment)
}
