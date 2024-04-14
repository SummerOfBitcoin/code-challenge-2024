
#![allow(dead_code)]

use core::fmt;

use chrono::{DateTime, Utc};

#[derive(Debug)]
pub struct BlockHeader {
    header_id: String,
    txs_merkle_root: String,
    timestamp: DateTime<Utc>,
    nonce: u32
}

impl BlockHeader {
    pub fn new(header_id: String, txs_merkle_root: String, timestamp: DateTime<Utc>, nonce: u32) -> BlockHeader {
        if header_id.len() != 32 {
            panic!("The header_id parameter needs to be a 32 bytes length string");
        }

        if txs_merkle_root.len() != 32 {
            panic!("The txs_merkle_root parameter needs to be a 32 bytes length string");
        }

        BlockHeader {
            header_id, 
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
            self.header_id,
            self.txs_merkle_root,
            self.timestamp,
            self.nonce
        )
    }
}