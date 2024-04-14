package main

import (
	"encoding/binary"
	"encoding/json"
	"fmt"
)

func Signature() {
	txData, err := jsonData("./mempool/0ac528562a1626863c0cb912eb725530c54e786e6485380c16633e4b9bce1720.json")
	Handle(err)
	var tx Transaction
	err = json.Unmarshal([]byte(txData), &tx)
	for idx := range tx.Vin {
		// fmt.Println(vin.Scriptsig)
		tx.Vin[idx].Scriptsig = tx.Vin[idx].Prevout.Scriptpubkey
		// fmt.Println(vin.Scriptsig)
	}
	serialized, _ := serializeTransaction(&tx)
	fmt.Printf("%x\n", serialized)
	scriptsigHash_type := make([]byte, 4)
	binary.LittleEndian.PutUint32(scriptsigHash_type, 1)
	serialized = append(serialized, scriptsigHash_type...)
	fmt.Printf("%x\n", serialized)

	hash256_serialized := to_sha(to_sha(serialized))
	fmt.Printf("%x\n", hash256_serialized)
	//Now we need to sign the transaction hash: Now we can just sign this message hash just like we would sign any message in ECDSA. All we need is our private key, and a randomly generated nonce.
	//The private key is the one that was used to create the public key that the output has been locked to.
	//derive the r and s values of the signature:

}
