"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blockchain = void 0;
class Blockchain {
    constructor() {
        this.chain = [];
        // public createBlock(): Block {
        //   // const block = new Block(
        //   //   this.getHead().hash,
        //   // );
        //   this.addBlock(block);
        //   return block;
        // }
    }
    getHead() {
        return this.chain[this.chain.length - 1];
    }
    getHeight() {
        return this.chain.length;
    }
    addBlock(block) {
        console.log("Successfully Start Block Mining...");
        this.chain.push(block);
        console.log("new Block Successfully minied");
    }
}
exports.Blockchain = Blockchain;
