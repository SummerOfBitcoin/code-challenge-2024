package Utils

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"sort"

	"github.com/pred695/code-challenge-2024-pred695/Structs"
)

func Comp(a, b Structs.TxInfo) bool {
	return float64(a.Fee)/float64(a.Weight) > float64(b.Fee)/float64(b.Weight)
}
func Prioritize() (uint64, []string, []string) {
	var permittedTxIDs []string
	var permittedWTxIDs []string
	dir := "./mempool"
	files, _ := os.ReadDir(dir)
	var txInfo []Structs.TxInfo
	for _, file := range files {
		txData, err := JsonData(dir + "/" + file.Name())
		Handle(err)
		var tx Structs.Transaction
		err = json.Unmarshal([]byte(txData), &tx)
		var fee uint64 = 0
		for _, vin := range tx.Vin {
			fee += vin.Prevout.Value
		}
		for _, vout := range tx.Vout {
			fee -= vout.Value
		}
		serialized, _ := SerializeTransaction(&tx)
		segserialized, _ := SegWitSerialize(&tx)
		txID := ReverseBytes(To_sha(To_sha(serialized)))
		wtxID := ReverseBytes(To_sha(To_sha(segserialized)))
		txInfo = append(txInfo, Structs.TxInfo{TxID: hex.EncodeToString(txID), WTxID: hex.EncodeToString(wtxID), Fee: fee, Weight: uint64(CalculateWitnessSize(&tx) + CalculateBaseSize(&tx)*4)})

	}
	sort.Slice(txInfo, func(i, j int) bool {
		return Comp(txInfo[i], txInfo[j])
	})
	var PermissibleTxs []Structs.TxInfo
	var PermissibleWeight uint64 = 3999300
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
	fmt.Println("weight: ", PermissibleWeight)
	fmt.Println("reward: ", reward)
	return reward, permittedTxIDs, permittedWTxIDs
}
