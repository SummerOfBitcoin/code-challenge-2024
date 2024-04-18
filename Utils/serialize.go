package Utils

import (
	"encoding/binary"
	"encoding/hex"
	"time"

	"github.com/pred695/code-challenge-2024-pred695/Structs"
)

func Uint16ToBytes(n uint16) []byte {
	bytes := make([]byte, 2)
	binary.LittleEndian.PutUint16(bytes, n)
	return bytes
}
func Uint32ToBytes(n uint32) []byte {
	bytes := make([]byte, 4)
	binary.LittleEndian.PutUint32(bytes, n)
	return bytes
}

func Uint64ToBytes(n uint64) []byte {
	bytes := make([]byte, 8)
	binary.LittleEndian.PutUint64(bytes, n)
	return bytes
}

func ReverseBytes(data []byte) []byte {
	length := len(data)
	for i := 0; i < length/2; i++ {
		data[i], data[length-i-1] = data[length-i-1], data[i]
	}
	return data
}

func SerializeVarInt(n uint64) []byte {
	if n < 0xfd {
		return []byte{byte(n)}
	} else if n <= 0xffff {
		return append([]byte{0xfd}, Uint16ToBytes(uint16(n))...)
	} else if n <= 0xffffffff {
		return append([]byte{0xfe}, Uint32ToBytes(uint32(n))...)
	} else {
		return append([]byte{0xff}, Uint64ToBytes(n)...)
	}
}

func SerializeTransaction(tx *Structs.Transaction) ([]byte, error) {

	var serialized []byte
	// Serialize version
	versionBytes := make([]byte, 4)
	binary.LittleEndian.PutUint32(versionBytes, tx.Version)
	serialized = append(serialized, versionBytes...)
	// Serialize vin count
	vinCount := uint64(len(tx.Vin))
	serialized = append(serialized, SerializeVarInt(vinCount)...)

	// Serialize vin
	for _, vin := range tx.Vin {
		txidBytes, _ := hex.DecodeString(vin.TxID)
		serialized = append(serialized, ReverseBytes(txidBytes)...)

		voutBytes := make([]byte, 4)
		binary.LittleEndian.PutUint32(voutBytes, vin.Vout)
		serialized = append(serialized, voutBytes...)

		Scriptsig_bytes, _ := hex.DecodeString(vin.Scriptsig)
		length_scriptsig := (uint64(len(Scriptsig_bytes)))
		serialized = append(serialized, SerializeVarInt(length_scriptsig)...)

		serialized = append(serialized, Scriptsig_bytes...)

		// Serialize sequence
		sequenceBytes := make([]byte, 4)
		binary.LittleEndian.PutUint32(sequenceBytes, vin.Sequence)
		serialized = append(serialized, sequenceBytes...)

	}

	// Serialize vout count
	voutCount := uint64(len(tx.Vout))
	serialized = append(serialized, SerializeVarInt(voutCount)...)

	// Serialize vout
	for _, vout := range tx.Vout {
		valueBytes := make([]byte, 8)
		binary.LittleEndian.PutUint64(valueBytes, vout.Value)
		serialized = append(serialized, valueBytes...)

		// Serialize scriptPubKey length
		scriptPubKeyBytes, err := hex.DecodeString(vout.Scriptpubkey)
		scriptPubKeyLen := uint64(len(scriptPubKeyBytes)) // Divide by 2 if appending the length of the non decoded form to get byte length since scriptPubKey is hex encoded
		serialized = append(serialized, SerializeVarInt(scriptPubKeyLen)...)

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
func SegWitSerialize(tx *Structs.Transaction) ([]byte, error) {

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
	serialized = append(serialized, SerializeVarInt(vinCount)...)

	// Serialize vin
	for _, vin := range tx.Vin {
		txidBytes, _ := hex.DecodeString(vin.TxID)
		serialized = append(serialized, ReverseBytes(txidBytes)...)

		voutBytes := make([]byte, 4)
		binary.LittleEndian.PutUint32(voutBytes, vin.Vout)
		serialized = append(serialized, voutBytes...)

		Scriptsig_bytes, _ := hex.DecodeString(vin.Scriptsig)
		length_scriptsig := (uint64(len(Scriptsig_bytes)))
		serialized = append(serialized, SerializeVarInt(length_scriptsig)...)

		serialized = append(serialized, Scriptsig_bytes...)

		// Serialize sequence
		sequenceBytes := make([]byte, 4)
		binary.LittleEndian.PutUint32(sequenceBytes, vin.Sequence)
		serialized = append(serialized, sequenceBytes...)

	}

	// Serialize vout count
	voutCount := uint64(len(tx.Vout))
	serialized = append(serialized, SerializeVarInt(voutCount)...)

	// Serialize vout
	for _, vout := range tx.Vout {
		valueBytes := make([]byte, 8)
		binary.LittleEndian.PutUint64(valueBytes, vout.Value)
		serialized = append(serialized, valueBytes...)

		// Serialize scriptPubKey length
		scriptPubKeyBytes, err := hex.DecodeString(vout.Scriptpubkey)
		scriptPubKeyLen := uint64(len(scriptPubKeyBytes)) // Divide by 2 if appending the length of the non decoded form to get byte length since scriptPubKey is hex encoded
		serialized = append(serialized, SerializeVarInt(scriptPubKeyLen)...)

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
			serialized = append(serialized, SerializeVarInt(witnessCount)...)
			for _, witness := range vin.Witness {
				witnessBytes, _ := hex.DecodeString(witness)
				witnessLen := uint64(len(witnessBytes))
				serialized = append(serialized, SerializeVarInt(witnessLen)...)
				serialized = append(serialized, witnessBytes...)
			}
		}
	}
	locktimeBytes := make([]byte, 4)
	binary.LittleEndian.PutUint32(locktimeBytes, tx.Locktime)
	serialized = append(serialized, locktimeBytes...)
	return serialized, nil
}

func SerializeBlockHeader(bh *Structs.BlockHeader) []byte {
	var serialized []byte

	versionBytes := make([]byte, 4)
	binary.LittleEndian.PutUint32(versionBytes, bh.Version)
	serialized = append(serialized, versionBytes...)

	prevBlockHashbytes, _ := hex.DecodeString(bh.PrevBlockHash)
	serialized = append(serialized, prevBlockHashbytes...)

	merkleRootbytes, _ := hex.DecodeString(bh.MerkleRoot)
	serialized = append(serialized, merkleRootbytes...)

	bh.Time = time.Now().Unix()
	timeBytes := make([]byte, 4)
	binary.LittleEndian.PutUint32(timeBytes, uint32(bh.Time))
	serialized = append(serialized, timeBytes...)

	bitsBytes := make([]byte, 4)
	binary.LittleEndian.PutUint32(bitsBytes, bh.Bits)
	serialized = append(serialized, bitsBytes...)

	NonceBytes := make([]byte, 4)
	binary.LittleEndian.PutUint32(NonceBytes, bh.Nonce)
	serialized = append(serialized, NonceBytes...)

	return serialized
}
