import crypto from "crypto";
function reverseHex(hex: string): string {
  return hex.match(/.{2}/g)?.reverse().join('') ?? '';
}

function hash256(hex: string): string {
  const binary = Buffer.from(hex, 'hex');
  const hash1 = crypto.createHash('sha256').update(binary).digest();
  const hash2 = crypto.createHash('sha256').update(hash1).digest();
  return hash2.toString('hex');
}
export function calualateMerkleRoot(txids: string[]): string {
  // console.log(txids.length,txids)
  if (txids.length === 0) {
    throw new Error('Transaction IDs array cannot be empty');
  }
  const reversedTxids = txids.map(reverseHex);

  let tree: string[] = txids.slice();

  while (tree.length > 1) {
    const newTree: string[] = [];
    for (let i = 0; i < tree.length; i += 2) {
      const left = tree[i];
      const right = i + 1 < tree.length ? tree[i + 1] : left;
      const concat = left + right;
      const hash = hash256(concat);
      newTree.push(hash);
    }
    tree = newTree;
  }
  const merkleRoot = reverseHex(tree[0]);
  return merkleRoot;
}
