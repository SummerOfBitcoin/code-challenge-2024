#![allow(dead_code, unused)]
// use serde::{Serialize, Deserialize}
// use serde_json;
// use ring::digest;

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Tx{
    pub version: u32,
    pub locktime: u32,
    pub vin: Vec<TxInput>,
    pub vout: Vec<TxOutput>,
    // tx_size: u64,
}


impl Tx{
    pub fn new (version: u32, locktime: u32, vin: Vec<TxInput>, vout: Vec<TxOutput>) -> Self {
        let mut tx_size = 32 + 64;

        vout.iter().for_each(|output| tx_size += output.get_tx_output_size_in_bytes());
        vin.iter().for_each(|input| tx_size += input.get_tx_input_size_in_bytes());


        Self {
            version,
            locktime,
            vin,
            vout,
            // tx_size,
        }
    }

    // pub fn get_tx_size(&self) -> u64 {
    //     self.tx_size
    // }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TxInput{
    pub txid: String,
    pub vout: u32,
    pub prevout: TxPrevOut,
    pub scriptsig: String,
    pub scriptsig_asm: String,
    pub witness: Vec<String>,
    pub is_coinbase: bool,
    pub sequence: u64,
}

impl TxInput{

    pub fn new(txid: String,vout: u32,prevout: TxPrevOut,scriptsig: String,scriptsig_asm: String,witness: Vec<String>,is_coinbase: bool,sequence: u64,) -> Self{
        Self{
            txid,
            vout,
            prevout,
            scriptsig,
            scriptsig_asm,
            witness,
            is_coinbase,
            sequence,
        }
    }

    fn get_tx_input_size_in_bytes(&self) -> u64{
        let sigscript_size: u64 = self.scriptsig.len() as u64 * 32;
        let txid_size: u64 = self.txid.len() as u64 * 32;
        return 64 + sigscript_size + txid_size + 1;
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TxPrevOut{
    pub scriptpubkey: String,
    pub scriptpubkey_asm: String,
    pub scriptpubkey_type: String,
    pub scriptpubkey_address: String,
    pub value: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TxOutput {
    pub scriptpubkey: String,
    pub scriptpubkey_asm: String,
    pub scriptpubkey_type: String,
    pub scriptpubkey_address: String,
    pub value: u64,
} 

impl TxOutput{

    pub fn new(scriptpubkey: String, scriptpubkey_asm: String, scriptpubkey_type: String, scriptpubkey_address: String, value: u64,) -> Self {
        Self{
            scriptpubkey,
            scriptpubkey_asm,
            scriptpubkey_type,
            scriptpubkey_address,
            value
        }
    }

    pub fn get_tx_output_size_in_bytes(&self) -> u64{
        let pk_script_size: u64 = self.scriptpubkey.len() as u64 * 32;
        return pk_script_size + 64
    }
}
