"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.P2WPKH = void 0;
const secp256k1_1 = __importDefault(require("secp256k1"));
const utils_1 = require("../utils");
class P2WPKH {
    constructor(transaction) {
        this.transaction = transaction;
    }
    execute(scriptPubKey, witness, inputIndex) {
        if (!this.verifyScriptExecution(scriptPubKey, witness, inputIndex, this.transaction)) {
            return false;
        }
        return true;
    }
    verifyScriptExecution(scriptPubKey, witness, inputIndex, transaction) {
        let stack = [];
        for (const sigs of witness) {
            stack.push(Uint8Array.from(Buffer.from(sigs, "hex")));
        }
        const scriptPubKeyOps = scriptPubKey.split(" ");
        for (let i = 0; i < scriptPubKeyOps.length; i++) {
            const op = scriptPubKeyOps[i];
            if (op.startsWith("OP_")) {
                switch (op) {
                    case "OP_DUP":
                        stack.push(stack[stack.length - 1]);
                        break;
                    case "OP_HASH160":
                        const data = stack.pop();
                        stack.push((0, utils_1.sha256ripemd160)(data));
                        break;
                    case "OP_PUSHBYTES_20":
                        stack.push(Uint8Array.from(Buffer.from(scriptPubKeyOps[++i], "hex")));
                        break;
                    case "OP_EQUALVERIFY":
                        const a = stack.pop();
                        const b = stack.pop();
                        if (!this.isEqual(a, b)) {
                            return false;
                        }
                        break;
                    case "OP_CHECKSIG":
                        const publicKey = stack.pop();
                        const signature = stack.pop();
                        const hashTypeNumber = signature[signature.byteLength - 1];
                        const message = this.getMessageHash(transaction, inputIndex, scriptPubKeyOps[2], hashTypeNumber);
                        const sigDEC = secp256k1_1.default.signatureImport(signature.slice(0, signature.byteLength - 1));
                        if (!this.verifySignature(publicKey, sigDEC, message)) {
                            return false;
                        }
                        break;
                    default:
                        throw new Error(`Unsupported opcode: ${op}`);
                }
            }
            else {
                stack.push(Uint8Array.from(Buffer.from(op, "hex")));
            }
        }
        return stack.length === 0;
    }
    verifySignature(publicKey, signature, message) {
        return secp256k1_1.default.ecdsaVerify(signature, message, publicKey);
    }
    getMessageHash(tx, inputIndex, publickeyhash, hashTypeNumber = 0x01) {
        const txclone = tx.clone();
        const hashTypeBuffer = Buffer.alloc(4);
        hashTypeBuffer.writeUInt32LE(hashTypeNumber);
        const txidVoutBuffers = txclone.inputs.map((input) => Buffer.from(input.txid + input.vout, "hex"));
        const txidVouts = Buffer.concat(txidVoutBuffers);
        const sequenceBuffers = txclone.inputs.map((input) => Buffer.from(input.sequence, "hex"));
        const inputsSequence = Buffer.concat(sequenceBuffers);
        const outputBuffers = txclone.outputs.map((output) => Buffer.from(output.value + output.scriptpubkeysize + output.scriptpubkey, "hex"));
        const outputs = Buffer.concat(outputBuffers);
        const outputshash = (0, utils_1.doubleSHA256)(outputs);
        const sequenceshash = (0, utils_1.doubleSHA256)(inputsSequence);
        const inputshash = (0, utils_1.doubleSHA256)(txidVouts);
        const inputAmount = Buffer.alloc(8);
        inputAmount.writeBigUInt64LE(BigInt(tx.vin[inputIndex].prevout.value));
        const inputSequence = Buffer.from(txclone.inputs[inputIndex].sequence, "hex");
        const scriptcode = Buffer.from(`1976a914${publickeyhash}88ac`, "hex");
        const message = Buffer.concat([
            Buffer.from(txclone.verison, "hex"),
            inputshash,
            sequenceshash,
            Buffer.from(txclone.inputs[inputIndex].txid, "hex"),
            Buffer.from(txclone.inputs[inputIndex].vout, "hex"),
            scriptcode,
            inputAmount,
            inputSequence,
            outputshash,
            Buffer.from(txclone.locktime, "hex"),
            hashTypeBuffer,
        ]);
        return (0, utils_1.doubleSHA256)(message);
    }
    isEqual(a, b) {
        if (a.length !== b.length)
            return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i])
                return false;
        }
        return true;
    }
}
exports.P2WPKH = P2WPKH;
