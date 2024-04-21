import { Buffer } from 'buffer';
import { createHash } from 'crypto';

class Serializer {
    private data: number[];

    constructor() {
        this.data = [];
    }

    writeUint32(value: number): void {
        this.data.push(
            (value & 0xFF000000) >> 24,
            (value & 0x00FF0000) >> 16,
            (value & 0x0000FF00) >> 8,
            (value & 0x000000FF)
        );
    }

    writeVarUint(value: number): void {
        if (value < 0xFD) {
            this.writeUint8(value);
        } else if (value <= 0xFFFF) {
            this.writeUint8(0xFD);
            this.writeUint16(value);
        } else if (value <= 0xFFFFFFFF) {
            this.writeUint8(0xFE);
            this.writeUint32(value);
        } else {
            this.writeUint8(0xFF);
            this.writeUint64(value);
        }
    }

    writeHash(hash: Buffer): void {
        this.data.push(...hash);
    }

    writeUint8(value: number): void {
        this.data.push(value);
    }

    writeUint16(value: number): void {
        this.data.push((value & 0xFF00) >> 8, (value & 0x00FF));
    }

    writeUint64(value: number): void {
        this.writeUint32((value / 0x100000000) | 0);
        this.writeUint32(value & 0xFFFFFFFF);
    }

    writeData(data: Buffer): void {
        this.data.push(...data);
    }

    getBytes(): number[] {
        return this.data;
    }
}

function main(): void {
    const tx = {
        version: 1,
        locktime: 0,
        vin: [
            {
                txid: "3b7dc918e5671037effad7848727da3d3bf302b05f5ded9bec89449460473bbb",
                vout: 16,
                prevout: {
                    scriptpubkey: "0014f8d9f2203c6f0773983392a487d45c0c818f9573",
                    scriptpubkey_asm: "OP_0 OP_PUSHBYTES_20 f8d9f2203c6f0773983392a487d45c0c818f9573",
                    scriptpubkey_type: "v0_p2wpkh",
                    scriptpubkey_address: "bc1qlrvlygpudurh8xpnj2jg04zupjqcl9tnk5np40",
                    value: 37079526
                },
                scriptsig: "",
                scriptsig_asm: "",
                witness: [
                    "30440220780ad409b4d13eb1882aaf2e7a53a206734aa302279d6859e254a7f0a7633556022011fd0cbdf5d4374513ef60f850b7059c6a093ab9e46beb002505b7cba0623cf301",
                    "022bf8c45da789f695d59f93983c813ec205203056e19ec5d3fbefa809af67e2ec"
                ],
                is_coinbase: false,
                sequence: 4294967295
            }
        ],
        vout: [
            {
                scriptpubkey: "76a9146085312a9c500ff9cc35b571b0a1e5efb7fb9f1688ac",
                scriptpubkey_asm: "OP_DUP OP_HASH160 OP_PUSHBYTES_20 6085312a9c500ff9cc35b571b0a1e5efb7fb9f16 OP_EQUALVERIFY OP_CHECKSIG",
                scriptpubkey_type: "p2pkh",
                scriptpubkey_address: "19oMRmCWMYuhnP5W61ABrjjxHc6RphZh11",
                value: 100000
            },
            {
                scriptpubkey: "0014ad4cc1cc859c57477bf90d0f944360d90a3998bf",
                scriptpubkey_asm: "OP_0 OP_PUSHBYTES_20 ad4cc1cc859c57477bf90d0f944360d90a3998bf",
                scriptpubkey_type: "v0_p2wpkh",
                scriptpubkey_address: "bc1q44xvrny9n3t5w7lep58egsmqmy9rnx9lt6u0tc",
                value: 36977942
            }
        ]
    };

    const ss = new Serializer();
    ss.writeUint32(tx.version); // version
    ss.writeVarUint(tx.vin.length); // number of inputs

    // input 0
    ss.writeHash(Buffer.from(tx.vin[0].txid, 'hex')); // prevout hash
    ss.writeUint32(tx.vin[0].vout); // prevout index

    // input script
    const inputScript = Buffer.from(tx.vin[0].witness[0], 'hex');
    ss.writeVarUint(inputScript.length);
    ss.writeData(inputScript);
    ss.writeUint32(tx.vin[0].sequence); // sequence

    // number of outputs
    ss.writeVarUint(tx.vout.length);

    // outputs
    tx.vout.forEach(output => {
        ss.writeUint64(output.value);
        const outputScript = Buffer.from(output.scriptpubkey, 'hex');
        ss.writeVarUint(outputScript.length);
        ss.writeData(outputScript);
    });

    ss.writeUint32(tx.locktime); // locktime
    ss.writeUint32(1); // hash type code (SIGHASH_ALL)

    // Convert bytes to hex string
    const hexString = ss.getBytes().map(byte => byte.toString(16).padStart(2, '0')).join('');
    console.log('Serialized Transaction:', hexString);

    // Calculate transaction hash
    const txHash = createHash('sha256').update(Buffer.from(hexString, 'hex')).digest();
    console.log('Transaction Hash:', txHash.toString('hex'));
    console.log("id",createHash('sha256').update(txHash.toString('hex')).digest('hex'));
    
}

main();

// 0100000000010169c12106097dc2e0526493ef67f21269fe888ef05c7a3a5dacab38e1ac8387f14c1d000000ffffffff01010000000000000000034830450220487fb382c4974de3f7d834c1b617fe15860828c7f96454490edd6d891556dcc9022100baf95feb48f845d5bfc9882eb6aeefa1bc3790e39f59eaa46ff7f15ae626c53e012102a9781d66b61fb5a7ef00ac5ad5bc6ffc78be7b44a566e3c87870e1079368df4c4aad4830450220487fb382c4974de3f7d834c1b617fe15860828c7f96454490edd6d891556dcc9022100baf95feb48f845d5bfc9882eb6aeefa1bc3790e39f59eaa46ff7f15ae626c53e0100000000