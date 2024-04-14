package main

import (
	"crypto/sha256"
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"os"
)

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

var strs []byte

func CheckSegWit(tx *Transaction) bool {
	for _, vin := range tx.Vin {
		if len(vin.Witness) > 0 {
			return true
		}
	}
	return false
}
func serializeTransaction(tx *Transaction) ([]byte, error) {

	var serialized []byte
	// Serialize version
	versionBytes := make([]byte, 4)
	binary.LittleEndian.PutUint32(versionBytes, tx.Version)
	serialized = append(serialized, versionBytes...)
	// Serialize vin count
	vinCount := uint64(len(tx.Vin))
	serialized = append(serialized, serializeVarInt(vinCount)...)

	// Serialize vin
	for _, vin := range tx.Vin {
		txidBytes, _ := hex.DecodeString(vin.TxID)
		serialized = append(serialized, reverseBytes(txidBytes)...)

		voutBytes := make([]byte, 4)
		binary.LittleEndian.PutUint32(voutBytes, vin.Vout)
		serialized = append(serialized, voutBytes...)

		Scriptsig_bytes, _ := hex.DecodeString(vin.Scriptsig)
		length_scriptsig := (uint64(len(Scriptsig_bytes)))
		serialized = append(serialized, serializeVarInt(length_scriptsig)...)

		serialized = append(serialized, Scriptsig_bytes...)

		// Serialize sequence
		sequenceBytes := make([]byte, 4)
		binary.LittleEndian.PutUint32(sequenceBytes, vin.Sequence)
		serialized = append(serialized, sequenceBytes...)

	}

	// Serialize vout count
	voutCount := uint64(len(tx.Vout))
	serialized = append(serialized, serializeVarInt(voutCount)...)

	// Serialize vout
	for _, vout := range tx.Vout {
		valueBytes := make([]byte, 8)
		binary.LittleEndian.PutUint64(valueBytes, vout.Value)
		serialized = append(serialized, valueBytes...)

		// Serialize scriptPubKey length
		scriptPubKeyBytes, err := hex.DecodeString(vout.Scriptpubkey)
		scriptPubKeyLen := uint64(len(scriptPubKeyBytes)) // Divide by 2 if appending the length of the non decoded form to get byte length since scriptPubKey is hex encoded
		serialized = append(serialized, serializeVarInt(scriptPubKeyLen)...)

		// Serialize scriptPubKey
		if err != nil {
			return nil, err
		}
		serialized = append(serialized, scriptPubKeyBytes...)
	}
	//Locktime
	locktimeBytes := make([]byte, 4)
	binary.LittleEndian.PutUint32(locktimeBytes, tx.Locktime)
	serialized = append(serialized, locktimeBytes...)

	return serialized, nil
}
func SegWitSerialize(tx *Transaction) ([]byte, error) {

	var serialized []byte
	isSegwit := CheckSegWit(tx)
	// Serialize version
	versionBytes := make([]byte, 4)
	binary.LittleEndian.PutUint32(versionBytes, tx.Version)
	serialized = append(serialized, versionBytes...)
	// Serialize vin count
	if isSegwit {
		serialized = append(serialized, []byte{0x00, 0x01}...)
	}
	vinCount := uint64(len(tx.Vin))
	serialized = append(serialized, serializeVarInt(vinCount)...)

	// Serialize vin
	for _, vin := range tx.Vin {
		txidBytes, _ := hex.DecodeString(vin.TxID)
		serialized = append(serialized, reverseBytes(txidBytes)...)

		voutBytes := make([]byte, 4)
		binary.LittleEndian.PutUint32(voutBytes, vin.Vout)
		serialized = append(serialized, voutBytes...)

		Scriptsig_bytes, _ := hex.DecodeString(vin.Scriptsig)
		length_scriptsig := (uint64(len(Scriptsig_bytes)))
		serialized = append(serialized, serializeVarInt(length_scriptsig)...)

		serialized = append(serialized, Scriptsig_bytes...)

		// Serialize sequence
		sequenceBytes := make([]byte, 4)
		binary.LittleEndian.PutUint32(sequenceBytes, vin.Sequence)
		serialized = append(serialized, sequenceBytes...)

	}

	// Serialize vout count
	voutCount := uint64(len(tx.Vout))
	serialized = append(serialized, serializeVarInt(voutCount)...)

	// Serialize vout
	for _, vout := range tx.Vout {
		valueBytes := make([]byte, 8)
		binary.LittleEndian.PutUint64(valueBytes, vout.Value)
		serialized = append(serialized, valueBytes...)

		// Serialize scriptPubKey length
		scriptPubKeyBytes, err := hex.DecodeString(vout.Scriptpubkey)
		scriptPubKeyLen := uint64(len(scriptPubKeyBytes)) // Divide by 2 if appending the length of the non decoded form to get byte length since scriptPubKey is hex encoded
		serialized = append(serialized, serializeVarInt(scriptPubKeyLen)...)

		// Serialize scriptPubKey
		if err != nil {
			return nil, err
		}
		serialized = append(serialized, scriptPubKeyBytes...)
	}
	//Locktime
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
	locktimeBytes := make([]byte, 4)
	binary.LittleEndian.PutUint32(locktimeBytes, tx.Locktime)
	serialized = append(serialized, locktimeBytes...)
	return serialized, nil
}

func reverseBytes(data []byte) []byte {
	length := len(data)
	for i := 0; i < length/2; i++ {
		data[i], data[length-i-1] = data[length-i-1], data[i]
	}
	return data
}

func serializeVarInt(n uint64) []byte {
	if n < 0xfd {
		return []byte{byte(n)}
	} else if n <= 0xffff {
		return append([]byte{0xfd}, uint16ToBytes(uint16(n))...)
	} else if n <= 0xffffffff {
		return append([]byte{0xfe}, uint32ToBytes(uint32(n))...)
	} else {
		return append([]byte{0xff}, uint64ToBytes(n)...)
	}
}

func uint16ToBytes(n uint16) []byte {
	bytes := make([]byte, 2)
	binary.LittleEndian.PutUint16(bytes, n)
	return bytes
}

func uint32ToBytes(n uint32) []byte {
	bytes := make([]byte, 4)
	binary.LittleEndian.PutUint32(bytes, n)
	return bytes
}

func uint64ToBytes(n uint64) []byte {
	bytes := make([]byte, 8)
	binary.LittleEndian.PutUint64(bytes, n)
	return bytes
}

func to_sha(data []byte) []byte {
	hash := sha256.Sum256(data)
	return hash[:]
}

func jsonData(filename string) (string, error) {
	data, err := os.ReadFile(filename)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func Handle(err error) {
	if err != nil {
		fmt.Println(err)
	}
}
