package Structs


type BlockHeader struct {
	Version       uint32
	PrevBlockHash string
	MerkleRoot    string
	Time          int64
	Bits          uint32
	Nonce         uint32
}


type Input struct {
	TxID         string   `json:"txid"`
	Vout         uint32   `json:"vout"`
	Prevout      Prevout  `json:"prevout"`
	Scriptsig    string   `json:"scriptsig"`
	ScriptsigAsm string   `json:"scriptsig_asm"`
	Witness      []string `json:"witness"`
	IsCoinbase   bool     `json:"is_coinbase"`
	Sequence     uint32   `json:"sequence"`
}

type Prevout struct {
	Scriptpubkey        string `json:"scriptpubkey"`
	ScriptpubkeyAsm     string `json:"scriptpubkey_asm"`
	ScriptpubkeyType    string `json:"scriptpubkey_type"`
	ScriptpubkeyAddress string `json:"scriptpubkey_address"`
	Value               uint64 `json:"value"`
}

type Transaction struct {
	Version  uint32    `json:"version"`
	Locktime uint32    `json:"locktime"`
	Vin      []Input   `json:"vin"`
	Vout     []Prevout `json:"vout"`
}

type TxInfo struct {
	TxID   string
	WTxID  string
	Fee    uint64
	Weight uint64
}
type TxWeight struct {
	BaseSize    int `json:"base_size"`    // Size of non-witness data in bytes
	WitnessSize int `json:"witness_size"` // Size of witness data in bytes
	Weight      int `json:"weight"`       // Total weight in weight units
}


type MerkleNode struct {
	Left  *MerkleNode
	Data  []byte
	Right *MerkleNode
}

type MerkleTree struct {
	MerkleRoot *MerkleNode
}
