package main

func Coinbase(netReward uint64) *Transaction {
	witnessCommitment := CreateWitnessMerkle()
	coinbaseTx := Transaction{
		Version: 1,
		Vin: []Input{
			{
				TxID: "0000000000000000000000000000000000000000000000000000000000000000",
				Vout: 0xffffffff,
				Prevout: Prevout{
					Scriptpubkey:        "0014df4bf9f3621073202be59ae590f55f42879a21a0",
					ScriptpubkeyAsm:     "0014df4bf9f3621073202be59ae590f55f42879a21a0",
					ScriptpubkeyType:    "p2pkh",
					ScriptpubkeyAddress: "bc1qma9lnumzzpejq2l9ntjepa2lg2re5gdqn3nf0c",
					Value:               uint64(netReward),
				},
				IsCoinbase: true,
				Sequence:   0xffffffff,
				Scriptsig:  "03951a0604f15ccf5609013803062b9b5a0100072f425443432f20",
				Witness:    []string{"0000000000000000000000000000000000000000000000000000000000000000"},
			},
		},
		Vout: []Prevout{
			{
				Scriptpubkey:        "0014df4bf9f3621073202be59ae590f55f42879a21a0",
				ScriptpubkeyAsm:     "0014df4bf9f3621073202be59ae590f55f42879a21a0",
				ScriptpubkeyType:    "p2pkh",
				ScriptpubkeyAddress: "bc1qma9lnumzzpejq2l9ntjepa2lg2re5gdqn3nf0c",
				Value:               uint64(netReward),
			},
			{
				Scriptpubkey:        "6a24" + "aa21a9ed" + witnessCommitment, //OPRETURN +OP_PUSHBYTES_36+ commitment header + witnessCommitment
				ScriptpubkeyAsm:     "OP_RETURN" + "OP_PUSHBYTES_36" + "aa21a9ed" + witnessCommitment,
				ScriptpubkeyType:    "op_return",
				ScriptpubkeyAddress: "bc1qma9lnumzzpejq2l9ntjepa2lg2re5gdqn3nf0c",
				Value:               uint64(0),
			},
		},
		Locktime: 0,
	}
	return &coinbaseTx
}
