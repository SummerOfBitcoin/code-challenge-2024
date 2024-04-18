package Utils

import (
	"encoding/hex"

	"github.com/pred695/code-challenge-2024-pred695/Structs"
)

// Function to calculate transaction weight
// Function to calculate base size
func CalculateBaseSize(tx *Structs.Transaction) int {
	serialised, _ := SerializeTransaction(tx)
	return len(serialised)
}

// Function to calculate witness size
func CalculateWitnessSize(tx *Structs.Transaction) int {
	if !CheckSegWit(tx) {
		return 0

	}
	// Inputs (witness)
	var serialized []byte
	isSegwit := CheckSegWit(tx)
	if isSegwit {
		serialized = append(serialized, []byte{0x00, 0x01}...)
	}
	if isSegwit {
		for _, vin := range tx.Vin {
			witnessCount := uint64(len(vin.Witness))
			serialized = append(serialized, SerializeVarInt(witnessCount)...)
			for _, witness := range vin.Witness {
				witnessBytes, _ := hex.DecodeString(witness)
				witnessLen := uint64(len(witnessBytes))
				serialized = append(serialized, SerializeVarInt(witnessLen)...)
				serialized = append(serialized, witnessBytes...)
			}
		}
	}
	return len(serialized)
}
