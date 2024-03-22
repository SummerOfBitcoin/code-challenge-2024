const { constructBlock } = require('./construct_block');
const { mineBlock } = require('./block_miner');

// Function to mine the block
function mineBlock() {
    const block = constructBlock();

    // Mine the block
    const minedBlock = mineBlock(block);

    return minedBlock;
}

module.exports = { mineBlock };


