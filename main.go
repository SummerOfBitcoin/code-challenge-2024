package main

import (
	"encoding/hex"
	"fmt"
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
	prevBlockHash: "000000000000000000000000000000000000000000000000000000000000ff00",
	merkleRoot:    "",
	time:          time.Now().Unix(),
	bits:          "1f00ffff",
	nonce:         0,
}

func main() {
	netReward, TxIDs, _ := Prioritize()

	cbTx := Coinbase(netReward)
	serializedcbTx, _ := serializeTransaction(cbTx)
	TxIDs = append([]string{hex.EncodeToString(to_sha(to_sha(serializedcbTx)))}, TxIDs...)
	mkr := NewMerkleTree(TxIDs)
	Bh.merkleRoot = hex.EncodeToString(mkr.Data)
	// witnessMerkle := NewMerkleTree(wTxIDs)
	// fmt.Println("Length of the witness merkles: ", len(wTxIDs))
	// fmt.Println("WMKR: ", hex.EncodeToString(witnessMerkle.Data))
	if ProofOfWork(&Bh) {
		file, _ := os.Create("output.txt")
		defer file.Close()
		fmt.Println(Bh.merkleRoot)
		fmt.Println(Bh.nonce)
		serializedBh := SerializeBlockHeader(&Bh)
		file.WriteString(hex.EncodeToString(serializedBh) + "\n")
		file.WriteString(hex.EncodeToString(serializedcbTx) + "\n")
		for _, tx := range TxIDs {
			file.WriteString(tx + "\n")
		}
	}

}
