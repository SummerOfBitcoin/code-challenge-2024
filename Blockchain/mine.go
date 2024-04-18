package Blockchain

import (
	"encoding/hex"
	"fmt"
	"os"
	"time"

	"github.com/pred695/code-challenge-2024-pred695/Structs"
	"github.com/pred695/code-challenge-2024-pred695/Utils"
)

var Bh Structs.BlockHeader = Structs.BlockHeader{
	Version:       7,
	PrevBlockHash: "0000000000000000000000000000000000000000000000000000000000000000",
	MerkleRoot:    "",
	Time:          time.Now().Unix(),
	Bits:          0x1f00ffff,
	Nonce:         0,
}

func MineBlock() {
	netReward, TxIDs, _ := Utils.Prioritize()

	cbTx := Utils.CreateCoinbase(netReward)
	serializedcbTx, _ := Utils.SerializeTransaction(cbTx)
	fmt.Printf("CBTX: %x\n", serializedcbTx)
	TxIDs = append([]string{hex.EncodeToString(Utils.ReverseBytes(Utils.To_sha(Utils.To_sha(serializedcbTx))))}, TxIDs...)
	mkr := Utils.NewMerkleTree(TxIDs)
	Bh.MerkleRoot = hex.EncodeToString(mkr.Data)
	cbtxbase := Utils.CalculateBaseSize(cbTx)
	cbtxwitness := Utils.CalculateWitnessSize(cbTx)
	fmt.Println("Cbtx wt: ", cbtxwitness+(cbtxbase*4))
	if ProofOfWork(&Bh) {
		file, _ := os.Create("output.txt")
		defer file.Close()
		// fmt.Println(Bh.merkleRoot)
		// fmt.Println(Bh.nonce)
		serializedBh := Utils.SerializeBlockHeader(&Bh)
		segserialized, _ := Utils.SegWitSerialize(cbTx)
		file.WriteString(hex.EncodeToString(serializedBh) + "\n")
		file.WriteString(hex.EncodeToString(segserialized) + "\n")
		for _, tx := range TxIDs {
			file.WriteString(tx + "\n")
		}
	}
}
