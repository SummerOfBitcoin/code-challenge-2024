package Utils

import (
	"encoding/hex"
	"fmt"

	"github.com/pred695/code-challenge-2024-pred695/Structs"
)

func NewMerkleNode(lnode *Structs.MerkleNode, rnode *Structs.MerkleNode, data []byte) *Structs.MerkleNode {
	var mNode Structs.MerkleNode = Structs.MerkleNode{}
	if lnode == nil && rnode == nil {
		//hash256 of the data
		mNode.Data = ReverseBytes(data)
	} else {
		var prevHash []byte = append(lnode.Data, rnode.Data...)
		mNode.Data = To_sha(To_sha(prevHash))
	}
	mNode.Left = lnode
	mNode.Right = rnode
	return &mNode
}

func NewMerkleTree(leaves []string) *Structs.MerkleNode {
	var nodes []Structs.MerkleNode

	for _, leaf := range leaves {
		data, _ := hex.DecodeString(leaf)
		var node Structs.MerkleNode = *NewMerkleNode(nil, nil, data)
		nodes = append(nodes, node)
	}

	for len(nodes) > 1 {
		var newLevel []Structs.MerkleNode
		for i := 0; i < len(nodes); i += 2 {
			// Handle case where the total number of nodes is odd.
			if len(nodes)%2 != 0 {
				nodes = append(nodes, nodes[len(nodes)-1])
			}
			node := *NewMerkleNode(&nodes[i], &nodes[i+1], nil)
			newLevel = append(newLevel, node)
		}
		nodes = newLevel
	}
	return &nodes[0]

}

func CreateWitnessMerkle() string {
	_, _, wTxIDs := Prioritize()
	wTxIDs = append([]string{"0000000000000000000000000000000000000000000000000000000000000000"}, wTxIDs...)
	merkleRoot := NewMerkleTree(wTxIDs)
	fmt.Println("WMKR: ", hex.EncodeToString(merkleRoot.Data))
	commitment_string := hex.EncodeToString(merkleRoot.Data) + "0000000000000000000000000000000000000000000000000000000000000000"
	WitnessCommitment, _ := hex.DecodeString(commitment_string)
	WitnessCommitment = To_sha(To_sha(WitnessCommitment))
	fmt.Println("Witness Commitment: ", hex.EncodeToString(WitnessCommitment))
	return hex.EncodeToString(WitnessCommitment)
}
