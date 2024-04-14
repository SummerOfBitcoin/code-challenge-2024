package main

import (
	"encoding/binary"
	"encoding/hex"
	"time"
)

const target string = "0000ffff00000000000000000000000000000000000000000000000000000000"

func SerializeBlockHeader(bh *BlockHeader) []byte {
	var serialized []byte

	versionBytes := make([]byte, 4)
	binary.LittleEndian.PutUint32(versionBytes, bh.version)
	serialized = append(serialized, versionBytes...)

	prevBlockHashbytes, _ := hex.DecodeString(bh.prevBlockHash)
	serialized = append(serialized, prevBlockHashbytes...)

	merkleRootbytes, _ := hex.DecodeString(bh.merkleRoot)
	serialized = append(serialized, merkleRootbytes...)

	bh.time = time.Now().Unix()
	timeBytes := make([]byte, 4)
	binary.LittleEndian.PutUint32(timeBytes, uint32(bh.time))
	serialized = append(serialized, timeBytes...)

	bitsBytes, _ := hex.DecodeString(bh.bits)
	serialized = append(serialized, bitsBytes...)

	nonceBytes := make([]byte, 4)
	binary.LittleEndian.PutUint32(nonceBytes, bh.nonce)
	serialized = append(serialized, nonceBytes...)

	return serialized
}
func compareByteArrays(a, b []byte) int {
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
func ProofOfWork(bh *BlockHeader) bool {
	targetBytes, _ := hex.DecodeString(target)
	for {
		serialized := SerializeBlockHeader(bh)
		hash := to_sha(to_sha(serialized))

		if compareByteArrays(hash, targetBytes) == -1 {
			return true
		}
		bh.nonce++
	}
}
