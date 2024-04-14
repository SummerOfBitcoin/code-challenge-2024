package main

import (
	"encoding/hex"
	"os"
	"time"
)

type BlockHeader struct {
	version       uint32
	prevBlockHash string
	merkleRoot    string
	time          int64
	bits          string
	nonce         uint32
}

var Bh BlockHeader = BlockHeader{
	version:       7,
	prevBlockHash: "",
	merkleRoot:    "",
	time:          time.Now().Unix(),
	bits:          "1d00ffff",
	nonce:         0,
}

func main() {
	netReward, TxIDs, _ := Prioritize()

	cbTx := Coinbase(netReward)
	serializedcbTx, _ := serializeTransaction(cbTx)
	TxIDs = append([]string{hex.EncodeToString(to_sha(to_sha(serializedcbTx)))}, TxIDs...)
	mkr := NewMerkleTree(TxIDs)
	Bh.merkleRoot = hex.EncodeToString(mkr.Data)

	if ProofOfWork(&Bh) {
		file, _ := os.Create("output.txt")
		defer file.Close()

		serializedBh := SerializeBlockHeader(&Bh)
		file.WriteString(hex.EncodeToString(serializedBh) + "\n")
		file.WriteString(hex.EncodeToString(serializedcbTx) + "\n")
		for _, tx := range TxIDs {
			file.WriteString(tx + "\n")
		}
	}

}
