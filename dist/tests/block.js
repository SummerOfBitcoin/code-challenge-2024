"use strict";
// import { SHA256 } from "../utils";
// class Block{
//  public height:number;
//  public timestamp:number;
//  public data:any;
//  public previousHash:string;
//  public hash:string;
//  public nonce:number;
//   constructor(height:number,timestamp:number,data:any,prevoiusHash:string=''){
//    this.height=height;
//    this.timestamp=timestamp;
//    this.data=data;
//    this.previousHash=prevoiusHash;
//    this.hash=this.calculateHash();
//    this.nonce=0;
//   }  
//   calculateHash(){
//     return SHA256(String(this.height)+this.previousHash+String(this.timestamp)+JSON.stringify(this.data)+this.nonce).toString()
//   }
//   mineBlock(difficulty:any){
//    while(BigInt("0x" + this.hash) >= difficulty){
//     this.nonce++;
//     this.hash=this.calculateHash();
//     console.log(this.hash)
//    }
//    console.log("block mined",this.hash);
//   }
// }
// class Blockchain{
//     private chain:Block[];
//     private difficulty:bigint;
//     constructor(){
//         this.chain=[this.createGenesisBlock()];
//         this.difficulty = BigInt("0x0000ffff00000000000000000000000000000000000000000000000000000000");
//     }
//     createGenesisBlock(){
//         return new Block(0,Date.now(),"Genesis Block",'0'.repeat(64));
//     }
//     getLastestBlock(){
//         return this.chain[this.chain.length-1];
//     }
//     addBlock(newBlock:Block){
//         newBlock.previousHash=this.getLastestBlock().hash;
//         newBlock.mineBlock(this.difficulty)
//         this.chain.push(newBlock)
//     }
// }
// const blockchain=new Blockchain();
// console.log(blockchain);
// console.log("mining block 1")
// blockchain.addBlock(new Block(1,Date.now(),{amount:4}));
// console.log(blockchain);
