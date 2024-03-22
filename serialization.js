const { mineBlock } = require('./mine_block');

// Function to serialize the block
function serializeBlock() {
    const minedBlock = mineBlock();

    // Serialize the mined block
    const serializedBlock = JSON.stringify(minedBlock);

    return serializedBlock;
}

// Output the serialized block
console.log(serializeBlock());

