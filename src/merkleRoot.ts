import { createHash } from "crypto";
function doubleHash(data: Buffer): Buffer {
  return createHash("sha256")
    .update(createHash("sha256").update(data).digest())
    .digest();
}

export function constructMerkleTree(txids: string[]): Buffer {
  let leaves = txids.map((txid) => Buffer.from(txid, "hex"));

  while (leaves.length > 1) {
    const currentLevel: Buffer[] = [];

    for (let i = 0; i < leaves.length; i += 2) {
      const left = leaves[i];
      const right = i + 1 < leaves.length ? leaves[i + 1] : left; // If there's no right element, use left again
      const combined = Buffer.concat([left, right]);
      currentLevel.push(doubleHash(combined));
    }

    leaves = currentLevel;
  }

  return leaves[0]; // The last remaining hash is the Merkle root
}
