// use std::env;
#![allow(dead_code, unused)]

mod transactions;
// use core::panicking::panic;
use std::io::{self, Read};
use std::fs::{self, File};
use std::path::Path;
use serde_json;
use transactions::tx::{Tx, TxInput, TxOutput};

pub fn read_mempool(path: &str){

    let files = get_files_in_directory(path)
        .expect("Error while reading Dir");
    
    for file in files{
        let file_path = path.to_string() + &file;
        // let file: File = File::create(&file_path).unwrap();
        // let file_size = fs::metadata(&file_path).expect("Falha ao ler o arquivo");
        // file.sync_all();
        // println!("Size: {} File: {}", file);
        let transaction_json: Tx = read_tx_from_file(&file_path);

        // let tx: Tx = convert_json_tx_to_struct(transaction_json);

        println!("{:?}", transaction_json.vin[0].txid);
        // if transaction["vin"][0]["txid"] == "491cd7b98e0eec28eb9a97e061fcd71854ac103bdbc4d8a83b6613394d29489e" {
        //     println!("{:?}", transaction);
        // }
        // is_coinbase(transaction);

    }
    // is_coinbase(tx_in_json);
}

pub fn read_tx_from_file(file_path: &str) -> Tx {
    let mut file_content: String = String::new();
    let path = Path::new(file_path);
    let mut file = File::open(path).expect("Error while loading file");
    file.read_to_string(&mut file_content).expect("File can not be read");

    // let contents = fs::read_to_string(file_path)
            // .expect("Error while reading file");
    
    let tx_in_json: Tx = serde_json::from_str(&file_content).unwrap();
            // .expect("Error parsing file content to JSON");

    return tx_in_json;
}

// TODO: this function is with a problem that all the strings are coming with "\".......\""
// pub fn convert_json_tx_to_struct(tx_json: serde_json::Value) -> Tx {
//     let tx_vin = &tx_json["vin"][0];
//     let tx_vout = &tx_json["vout"][0];
 
//     let mut tx_input_vec: Vec<TxInput> = vec![];
//     let mut tx_output_vec: Vec<TxOutput> = vec![];

//     let tx_input: TxInput = TxInput::new(tx_vin["txid"].to_string(), tx_vin["prevout"]["value"].as_u64().expect("Error while casting tx_in value to u64"), tx_vin["scriptsig"].to_string(), tx_vin["is_coinbase"].as_bool().expect("Error while casting tx_in is_coinbase"));

//     let tx_output: TxOutput = TxOutput::new(tx_vout["value"].as_u64().expect("Error while casting tx_out value to u64"), tx_vout["scriptpubkey"].to_string());

//     tx_input_vec.push(tx_input);
//     tx_output_vec.push(tx_output);

//     Tx::new(tx_json["version"].as_u64().expect("Error while parsing tx version to u64") as u32, tx_input_vec, tx_output_vec)
// }

pub fn is_coinbase(tx: serde_json::Value) -> bool {
    let tx_input = &tx["vin"];
    if tx_input[0]["is_coinbase"].to_string() == "true"{
        println!("{}", tx_input[0]["txid"]);
    }
    // println!("{}", type_name_of_val(&tx_input[0]["is_coinbase"]));
    // println!("{}", tx_input); 
    // println!("{:?}", tx_input[0]["is_coinbase"]);
    // println!("{}", type_name_of_val(&tx));
    // tx.as_array().map(
    //     println!("{}", type_name_of_val(tx_input))
    // );
    return true
}

fn get_files_in_directory(path: &str) -> io::Result<Vec<String>> {
    // Get a list of all entries in the folder
    let entries = fs::read_dir(path)?;

    // Extract the filenames from the directory entries and store them in a vector
    let file_names: Vec<String> = entries
        .filter_map(|entry| {
            let path = entry.ok()?.path();
            if path.is_file() {
                path.file_name()?.to_str().map(|s| s.to_owned())
            } else {
                None
            }
        })
        .collect();

    Ok(file_names)
}

// THIS FUNCTION IS NOT WORKING
// pub fn get_files_in_directory(dir_path: &str) -> io::Result<Vec<String>> {

//     let entries = fs::read_dir(dir_path)
//         .expect("Error while reading directory");

//         let file_names: Vec<String> = entries
//             .filter_map(|entry| {
//                 let path = entry.ok()?.path();
//                 if path.is_file() {
//                     path.file_name()?.to_str().map(|s| s.to_owned())
//                 } else {
//                     None
//                 }
//         })
//         .collect();
    
//         Ok(file_names);
// }