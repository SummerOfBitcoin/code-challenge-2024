import { createHash } from 'crypto';
function hash256(hex: string): string {
    const hash1 = createHash('sha256').update(Buffer.from(hex, 'hex')).digest();
    const hash2 = createHash('sha256').update(hash1).digest();
    return hash2.toString('hex');
}

export function calualateMerkleRoot(txids: string[]): string {
    if (txids.length === 1) {
        return txids[0];
    }

    const result: string[] = [];

    for (let i = 0; i < txids.length; i += 2) {
        const concat = txids[i] + (txids[i + 1] || txids[i]);

        result.push(hash256(concat));
    }
    return calualateMerkleRoot(result);
}
