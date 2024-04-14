package main

import (
	"encoding/hex"
	"encoding/json"
	"os"
	"sort"
)

type TxInfo struct {
	TxID   string
	WTxID  string
	Fee    uint64
	Weight uint64
}

func comp(a, b TxInfo) bool {
	return float64(a.Fee)/float64(a.Weight) > float64(b.Fee)/float64(b.Weight)
}
func Prioritize() (uint64, []string, []string) {
	var permittedTxIDs []string
	var permittedWTxIDs []string
	dir := "./mempool"
	files, _ := os.ReadDir(dir)
	var txInfo []TxInfo
	for _, file := range files {
		txData, err := jsonData(dir + "/" + file.Name())
		Handle(err)
		var tx Transaction
		err = json.Unmarshal([]byte(txData), &tx)
		var fee uint64 = 0
		for _, vin := range tx.Vin {
			fee += vin.Prevout.Value
		}
		for _, vout := range tx.Vout {
			fee -= vout.Value
		}
		serialized, _ := serializeTransaction(&tx)
		segserialized, _ := SegWitSerialize(&tx)
		txID := reverseBytes(to_sha(to_sha(serialized)))
		wtxID := reverseBytes(to_sha(to_sha(segserialized)))
		txInfo = append(txInfo, TxInfo{TxID: hex.EncodeToString(txID), WTxID: hex.EncodeToString(wtxID), Fee: fee, Weight: uint64(calculateWitnessSize(&tx) + CalculateBaseSize(&tx)*4)})

	}
	sort.Slice(txInfo, func(i, j int) bool {
		return comp(txInfo[i], txInfo[j])
	})
	var PermissibleTxs []TxInfo
	var PermissibleWeight uint64 = 4000000
	var reward uint64 = 0
	for _, tx := range txInfo {
		if PermissibleWeight >= tx.Weight {
			PermissibleTxs = append(PermissibleTxs, tx)
			PermissibleWeight -= tx.Weight
			permittedTxIDs = append(permittedTxIDs, tx.TxID)
			permittedWTxIDs = append(permittedWTxIDs, tx.WTxID)
			reward += tx.Fee
		}
	}
	return reward, permittedTxIDs, permittedWTxIDs
}
