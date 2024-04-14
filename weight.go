package main

import (
	"encoding/hex"
)

const (
	WUPerByteNonWitness = 4
	WUPerByteWitness    = 1
)

type TxWeight struct {
	BaseSize    int `json:"base_size"`    // Size of non-witness data in bytes
	WitnessSize int `json:"witness_size"` // Size of witness data in bytes
	Weight      int `json:"weight"`       // Total weight in weight units
}

// Function to calculate transaction weight
// Function to calculate base size
func CalculateBaseSize(tx *Transaction) int {
	serialised, _ := serializeTransaction(tx)
	return len(serialised)
}

// Function to calculate witness size
func calculateWitnessSize(tx *Transaction) int {
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
			serialized = append(serialized, serializeVarInt(witnessCount)...)
			for _, witness := range vin.Witness {
				witnessBytes, _ := hex.DecodeString(witness)
				witnessLen := uint64(len(witnessBytes))
				serialized = append(serialized, serializeVarInt(witnessLen)...)
				serialized = append(serialized, witnessBytes...)
			}
		}
	}
	return len(serialized)
}