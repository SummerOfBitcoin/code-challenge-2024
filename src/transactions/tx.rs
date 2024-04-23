#![allow(dead_code, unused)]

// use serde_json;
// use ring::digest;

#[derive(Debug)]
pub struct Tx{
    pub version: u32,
    pub tx_input: Vec<TxInput>,
    pub tx_size: u64,
    pub tx_output: Vec<TxOutput>
}

impl Tx{
    pub fn new (version: u32, tx_input: Vec<TxInput>, tx_output: Vec<TxOutput>) -> Self {
        let mut tx_size = 32 + 64;

        tx_output.iter().for_each(|output| tx_size += output.get_tx_output_size_in_bytes());
        tx_input.iter().for_each(|input| tx_size += input.get_tx_input_size_in_bytes());


        Self {
            version,
            tx_input,
            tx_size,
            tx_output,
        }
    }
}

#[derive(Debug)]
pub struct TxInput{
    tx_id: String,
    value: u64,
    signature_script: String,
    is_coinbase: bool,
}

impl TxInput{

    pub fn new(tx_id: String, value: u64, signature_script: String, is_coinbase: bool) -> Self{
        Self{
            tx_id,
            value,
            signature_script,
            is_coinbase
        }
    }

    fn get_tx_input_size_in_bytes(&self) -> u64{
        let sigscript_size: u64 = self.signature_script.len() as u64 * 32;
        let tx_id_size: u64 = self.tx_id.len() as u64 * 32;
        return 64 + sigscript_size + tx_id_size + 1;
    }
}

#[derive(Debug)]
pub struct TxOutput {
    pub value: u64,
    pub pk_script: String,
} 

impl TxOutput{

    pub fn new(value:u64, pk_script: String) -> Self {
        Self{
            value,
            pk_script
        }
    }

    pub fn get_tx_output_size_in_bytes(&self) -> u64{
        let pk_script_size: u64 = self.pk_script.len() as u64 * 32;
        return pk_script_size + 64
    }
}