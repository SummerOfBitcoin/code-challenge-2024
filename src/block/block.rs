#![allow(dead_code, unused)]

use super::block_header::BlockHeader;


#[derive(Debug)]
struct Block{
    block_header: BlockHeader,
    // TO DO: still need to define how we will represent the transactions in the block
    transactions: String
}

impl Block {
     fn get_block_header_hash() -> String {
        String::from("Hello World!")
     }
}