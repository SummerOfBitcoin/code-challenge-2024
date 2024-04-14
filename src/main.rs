mod block;
use block::block_header::BlockHeader;
use chrono::Utc;
use mining_challenge::read_mempool;
// use sha2::{Sha256, Digest};
// use hex_literal::hex;

fn main() {
    read_mempool("/home/gabriel/projects/code-challenge-2024-gabrielgusn/mempool/");

    // let mut hasher = Sha256::new();
    let first_block_header: BlockHeader = BlockHeader::new(String::from("00000000000000000000000000000000"), String::from("00000000000000000000000000000000"), Utc::now(), 128);

    println!("{}", first_block_header);
}


