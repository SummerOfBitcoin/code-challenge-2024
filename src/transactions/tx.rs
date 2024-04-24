#![allow(dead_code, unused)]
// use serde::{Serialize, Deserialize}
// use serde_json;
// use ring::digest;

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Tx{
    pub version: u32,
    pub locktime: u32,
    #[serde(rename="vin")]
    pub tx_input: Vec<TxInput>,
    #[serde(rename="vout")]
    pub tx_output: Vec<TxOutput>,
}

impl Tx{
    pub fn new (version: u32, locktime: u32, vin: Vec<TxInput>, vout: Vec<TxOutput>) -> Self {
        let mut tx_size = 32 + 64;

        vout.iter().for_each(|output| tx_size += output.get_tx_output_size_in_bits());
        vin.iter().for_each(|input| tx_size += input.get_tx_input_size_in_bits());


        Self {
            version,
            locktime,
            tx_input: vin,
            tx_output: vout,
        }
    }

    pub fn get_tx_size_in_bits(&self) -> u64 {
        // initial value for tx_size because every transaction will have at least 64 bits
        let mut tx_size: u64 = 32 + 32;

        tx_size += self.get_tx_input_vec_size_in_bits() + self.get_tx_output_vec_size_in_bits();

        return tx_size;
    }

    pub fn get_tx_input_vec_size_in_bits(&self) -> u64 {
        let mut input_size: u64 = 0;
        
        for input in &self.tx_input {
            input_size += input.get_tx_input_size_in_bits();
        }
        return input_size;
    }
    pub fn get_tx_output_vec_size_in_bits(&self) -> u64 {
        let mut output_size: u64 = 0;
        
        for output in &self.tx_output {
            output_size += output.get_tx_output_size_in_bits();
        }

        return output_size;
    }
    
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TxInput{
    pub txid: String,
    pub vout: u32,
    pub prevout: TxPrevOut,
    pub scriptsig: String,
    pub scriptsig_asm: String,
    pub witness: Option<Vec<String>>,
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
            witness: Some(witness),
            is_coinbase,
            sequence,
        }
    }

    pub fn get_tx_input_size_in_bits(&self) -> u64{
        let mut tx_input_size: u64 = 32 + 64 + 1;

        let txid_size: u64 = self.txid.len() as u64 * 32;
        let prevout_size: u64 = self.prevout.get_prevout_size_in_bytes();
        let scriptsig_size: u64 = self.scriptsig.len() as u64 * 32;
        let scriptsig_asm_size: u64 = self.scriptsig_asm.len() as u64 * 32;

        let mut witness_size: u64 = match self.witness.clone() {
            Some(witness_vec) => {
                let mut witness_vec_strings_size: u64 = 0;
                for witness_item in witness_vec {
                    witness_vec_strings_size += witness_item.len() as u64 * 32;
                }
                witness_vec_strings_size
            },
            None => 0
        };

        tx_input_size += txid_size + prevout_size + scriptsig_size + scriptsig_asm_size + witness_size;

        return tx_input_size;
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

impl TxPrevOut{
    pub fn get_prevout_size_in_bytes(&self) -> u64{
        let mut prevout_size: u64 = 64;

        let scriptpubkey_size: u64 = self.scriptpubkey.len() as u64 * 32;
        let scriptpubkey_asm_size: u64 = self.scriptpubkey_asm.len() as u64 * 32;
        let scriptpubkey_type_size: u64 = self.scriptpubkey_type.len() as u64 * 32;
        let scriptpubkey_address_size: u64 = self.scriptpubkey_address.len() as u64 * 32;

        prevout_size += scriptpubkey_size + scriptpubkey_asm_size + scriptpubkey_type_size + scriptpubkey_address_size;

        return prevout_size;
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TxOutput {
    pub scriptpubkey: String,
    pub scriptpubkey_asm: String,
    pub scriptpubkey_type: String,
    pub scriptpubkey_address: Option<String>,
    pub value: u64,
} 

impl TxOutput{

    pub fn new(scriptpubkey: String, scriptpubkey_asm: String, scriptpubkey_type: String, scriptpubkey_address: String, value: u64,) -> Self {
        Self{
            scriptpubkey,
            scriptpubkey_asm,
            scriptpubkey_type,
            scriptpubkey_address: Some(scriptpubkey_address),
            value
        }
    }

    pub fn get_tx_output_size_in_bits(&self) -> u64{
        let mut tx_output_size: u64 = 64;
        let scriptpubkey_size: u64 = self.scriptpubkey.len() as u64 * 32;
        let scriptpubkey_asm_size: u64 = self.scriptpubkey_asm.len() as u64 * 32;
        let scriptpubkey_type_size: u64 = self.scriptpubkey_type.len() as u64 * 32;
        let scriptpubkey_address_size: u64 = match &self.scriptpubkey_address {
            Some(scriptpubkey_address) => scriptpubkey_address.len() as u64 * 32,
            None => 0
        };
        
        tx_output_size += scriptpubkey_size + scriptpubkey_asm_size + scriptpubkey_type_size + scriptpubkey_address_size;
        return tx_output_size;
    }
}
