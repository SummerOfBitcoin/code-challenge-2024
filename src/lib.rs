// use std::env;
use std::fs;
use serde_json;

pub fn read_mempool(file_path: &str){
    println!("In file {}", file_path);

    let contents = fs::read_to_string(file_path)
        .expect("Error while reading file");

    let tx_in_json: serde_json::Value = serde_json::from_str(contents.as_str())
        .expect("Error parsing file content to JSON");
    
    // println!("Content: \n {}", json["locktime"]);
    is_coinbase(tx_in_json)
}

pub fn is_coinbase(tx: serde_json::Value){
    let tx_input = &tx["vin"];
    println!("{:?}", tx_input[1]);
    // for tx_input in tx {

    // }
}