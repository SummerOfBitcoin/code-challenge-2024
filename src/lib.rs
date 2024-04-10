// use std::env;
use std::{any::{type_name_of_val}, fs, io};
use serde_json;

pub fn read_mempool(path: &str){

    let files = get_files_in_directory(path)
        .expect("Error while reading Dir");
    
    for file in files{
        let path = path.to_string() + &file;
        // println!("{path}");

        let transaction: serde_json::Value= read_tx_from_file(&path);

        is_coinbase(transaction);

    }
    // is_coinbase(tx_in_json);
}

pub fn read_tx_from_file(file_path: &str) -> serde_json::Value {
    let contents = fs::read_to_string(file_path)
            .expect("Error while reading file");
    
    let tx_in_json: serde_json::Value = serde_json::from_str(contents.as_str())
            .expect("Error parsing file content to JSON");
    
    return tx_in_json;
}

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