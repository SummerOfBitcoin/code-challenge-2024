package main

import (
	"encoding/hex"
)

type MerkleNode struct {
	Left  *MerkleNode
	Data  []byte
	Right *MerkleNode
}

type MerkleTree struct {
	MerkleRoot *MerkleNode
}

func NewMerkleNode(lnode *MerkleNode, rnode *MerkleNode, data []byte) *MerkleNode {
	var mNode MerkleNode = MerkleNode{}
	if lnode == nil && rnode == nil {
		//hash256 of the data
		mNode.Data = reverseBytes(data)
	} else {
		var prevHash []byte = append(lnode.Data, rnode.Data...)
		mNode.Data = (to_sha(to_sha(prevHash)))
	}
	mNode.Left = lnode
	mNode.Right = rnode
	return &mNode
}

func NewMerkleTree(leaves []string) *MerkleNode {
	var nodes []MerkleNode

	for _, leaf := range leaves {
		data, _ := hex.DecodeString(leaf)
		var node MerkleNode = *NewMerkleNode(nil, nil, data)
		nodes = append(nodes, node)
	}

	for len(nodes) > 1 {
		var newLevel []MerkleNode
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