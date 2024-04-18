package Blockchain

import (
	"encoding/hex"
	"fmt"

	"github.com/pred695/code-challenge-2024-pred695/Structs"
	"github.com/pred695/code-challenge-2024-pred695/Utils"
)

const target string = "0000ffff00000000000000000000000000000000000000000000000000000000"

func CompareByteArrays(a, b []byte) int {
	if len(a) != len(b) {
		panic("Arrays must have the same length")
	}

	for i := range a {
		if a[i] < b[i] {
			return -1
		} else if a[i] > b[i] {
			return 1
		}
	}

	return 0
}

func ProofOfWork(bh *Structs.BlockHeader) bool {
	targetBytes, _ := hex.DecodeString(target)
	// fmt.Printf("Target: %v\n", targetBytes)
	for {
		serialized := Utils.SerializeBlockHeader(bh)
		hash := Utils.ReverseBytes(Utils.To_sha(Utils.To_sha(serialized)))

		if CompareByteArrays(hash, targetBytes) == -1 {
			fmt.Println("Block Mined", hex.EncodeToString(hash))
			return true
		}
		if bh.Nonce < 0x0 || bh.Nonce > 0xffffffff {
			fmt.Println("FUCKED")
			return false
		}
		bh.Nonce++
	}
}
