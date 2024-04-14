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
	bits          uint32
	nonce         uint32
}

var Bh BlockHeader = BlockHeader{
	version:       7,
	prevBlockHash: "0000000000000000000000000000000000000000000000000000000000000000",
	merkleRoot:    "",
	time:          time.Now().Unix(),
	bits:          0x1f00ffff,
	nonce:         0,
}

func main() {
	netReward, TxIDs, _ := Prioritize()

	cbTx := Coinbase(netReward)
	serializedcbTx, _ := serializeTransaction(cbTx)
	fmt.Printf("CBTX: %x\n", serializedcbTx)
	TxIDs = append([]string{hex.EncodeToString(reverseBytes(to_sha(to_sha(serializedcbTx))))}, TxIDs...)
	mkr := NewMerkleTree(TxIDs)
	Bh.merkleRoot = hex.EncodeToString(mkr.Data)
	cbtxbase := CalculateBaseSize(cbTx)
	cbtxwitness := calculateWitnessSize(cbTx)
	fmt.Println("Cbtx wt: ", cbtxwitness+(cbtxbase*4))
	// witnessMerkle := NewMerkleTree(wTxIDs)
	// fmt.Println("Length of the witness merkles: ", len(wTxIDs))
	// fmt.Println("WMKR: ", hex.EncodeToString(witnessMerkle.Data))
	if ProofOfWork(&Bh) {
		file, _ := os.Create("output.txt")
		defer file.Close()
		// fmt.Println(Bh.merkleRoot)
		// fmt.Println(Bh.nonce)
		serializedBh := SerializeBlockHeader(&Bh)
		segserialized, _ := SegWitSerialize(cbTx)
		file.WriteString(hex.EncodeToString(serializedBh) + "\n")
		file.WriteString(hex.EncodeToString(segserialized) + "\n")
		for _, tx := range TxIDs {
			file.WriteString(tx + "\n")
		}
	}

}
