mod block;
use block::block_header::BlockHeader;
use chrono::Utc;
use mining_challenge::read_mempool;
use ring::digest::{Context, Digest, SHA256};
use std::fmt::Write;
// use hex_literal::hex;

fn main() {
    read_mempool("/home/gabriel/projects/bitcoin-mining-challenge/mempool/");

    // let mut hasher = Sha256::new();
    let first_block_header: BlockHeader = BlockHeader::new(String::from("00000000000000000000000000000000"), String::from("00000000000000000000000000000000"), Utc::now(), 128);

    println!("{}", first_block_header);

    let data: &str = "texto 1234";

    let mut nonce: u64 = 0_u64;

    loop{

        let mut context: Context = Context::new(&SHA256);
        
        // let target_hash: String = String::from("0000ffff00000000000000000000000000000000000000000000000000000000");
        let target_hash: String = String::from("00000cff00000000000000000000000000000000000000000000000000000000");

        context.update(data.as_bytes());
        context.update(&nonce.to_be_bytes());
        
        let digest: Digest = context.finish();
        let mut actual_hex: String = String::new();
        
        for &byte in digest.as_ref() {
            write!(&mut actual_hex, "{:02x}", byte).expect("Failed to write hex");
        }
        
        println!("Nonce: {}, Hash: {}", nonce, actual_hex);

        if actual_hex <= target_hash {
            println!("Found the nonce for the target Hash! It is: {} and you can attach this block to the blockchain", nonce);
            break
        }
        nonce += 1;
    }
}


