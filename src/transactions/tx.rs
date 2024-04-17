#![allow(dead_code)]

use serde_json;
use ring::digest;

// #[derive!(Debug)]
pub struct TxInput{
    script_sig: String,
    tx_id: String,
    vout: u64,
}

pub struct TxPrevOut {
    
}

pub struct Tx{
    vin: TxInput,
    tx_size: u64, 
}