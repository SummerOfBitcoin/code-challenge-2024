package Utils

import (
	"crypto/sha256"
	"fmt"
	"os"

	"github.com/mr-tron/base58"
	"github.com/pred695/code-challenge-2024-pred695/Structs"
)

func ExtractHexFromScriptpubkeyAsm(str []string) string {
	for i := 0; i < len(str); i++ {
		if str[i] == "OP_PUSHBYTES_20" || str[i] == "OP_PUSHBYTES_32" {
			return str[i+1]
		}
	}
	return ""
}

func Base58Encode(input []byte) []byte {
	var encoded string = base58.Encode(input)
	return []byte(encoded)
}

func To_sha(data []byte) []byte {
	hash := sha256.Sum256(data)
	return hash[:]
}

func JsonData(filename string) (string, error) {
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

func CheckSegWit(tx *Structs.Transaction) bool {
	for _, vin := range tx.Vin {
		if len(vin.Witness) > 0 {
			return true
		}
	}
	return false
}
