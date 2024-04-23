"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coinbaseTX = void 0;
const _1 = require(".");
const transaction_1 = require("./transaction");
const coinbaseTX = () => {
    const coinbase = new transaction_1.Transaction({
        version: 1,
        vin: [
            {
                txid: "0".repeat(64),
                vout: 0xffffffff,
                scriptsig: "03233708184d696e656420627920416e74506f6f6c373946205b8160a4256c0000946e0100",
                sequence: 0xffffffff,
                is_coinbase: true,
                prevout: {
                    scriptpubkey: "",
                    scriptpubkey_address: "",
                    scriptpubkey_type: "",
                    scriptpubkey_asm: "",
                    value: 0,
                },
                scriptsig_asm: "",
                witness: [
                    '0000000000000000000000000000000000000000000000000000000000000000'
                ],
            },
        ],
        vout: [
            {
                scriptpubkey: "76a914edf10a7fac6b32e24daa5305c723f3de58db1bc888ac",
                value: _1.BLOCK_SUBSIDY,
                scriptpubkey_address: "",
                scriptpubkey_type: "",
                scriptpubkey_asm: "",
            },
            {
                scriptpubkey: "",
                value: 0,
                scriptpubkey_address: "",
                scriptpubkey_type: "",
                scriptpubkey_asm: "",
            },
        ],
        locktime: 0xffffffff,
    });
    return coinbase;
};
exports.coinbaseTX = coinbaseTX;
