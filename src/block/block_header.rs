//This file is responsible for implementing the basic structure for the Block's Header

/*  Directive used to stop rust compiles pointing unused code as warnings, otherwise, 
    it would place a warning in the lines 14-17 because we are not actually using the value of 
    theses items.
*/
#![allow(dead_code)]

// Rust's dependencies used to implement the structure
// core::fmt for implementing the custom Display for this struct, customizing the way it is printed in stdout
use core::fmt;
// chrono::... is being used for the `timestamp` value in the header
use chrono::{DateTime, Utc};

/*  As we use ::fmt, we need the Debug trait in the struct and it can be automatically 
    implemented using derive()
*/
#[derive(Debug)]
pub struct BlockHeader {
    pub block_id: String,
    pub txs_merkle_root: String,
    pub timestamp: DateTime<Utc>,
    pub nonce: u32
}

impl BlockHeader {
    pub fn new(block_id: String, txs_merkle_root: String, timestamp: DateTime<Utc>, nonce: u32) -> BlockHeader {
        // I did not find a better way of representing the block id and merkle root other than
        // String for now, so it uses the following control flows to avoid having "hashes" 
        //different than 32 bytes.
        if block_id.len() != 32 {
            panic!("The block_id parameter needs to be a 32 bytes length string");
        }
        if txs_merkle_root.len() != 32 {
            panic!("The txs_merkle_root parameter needs to be a 32 bytes length string");
        }

        BlockHeader {
            block_id, 
            txs_merkle_root, 
            timestamp,
            nonce
        }
    }
}

impl fmt::Display for BlockHeader {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "Block ID: {}\nMerkle Root: {}\nTimestamp: {}\nNonce: {}",
            self.block_id,
            self.txs_merkle_root,
            self.timestamp,
            self.nonce
        )
    }
}