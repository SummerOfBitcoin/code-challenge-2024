"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.P2PKH = void 0;
const utils_1 = require("../utils");
const secp256k1_1 = __importDefault(require("secp256k1"));
const transaction_1 = require("../transaction");
class P2PKH {
    constructor(transaction) {
        this.transaction = transaction;
    }
    execute(prevScriptPubKey, scriptSig, index) {
        if (!this.verifyScriptExecution(prevScriptPubKey, scriptSig, this.transaction, index)) {
            return false;
        }
        return true;
    }
    verifyScriptExecution(scriptPubKey, scriptSig, transaction, inputIndex) {
        const stack = [];
        const scriptSigOps = scriptSig.split(" ");
        for (let i = 0; i < scriptSigOps.length; i++) {
            const op = scriptSigOps[i];
            if (op.startsWith("OP_")) {
                switch (op) {
                    case "OP_PUSHBYTES_65":
                    case "OP_PUSHBYTES_70":
                    case "OP_PUSHBYTES_71":
                    case "OP_PUSHBYTES_72":
                    case "OP_PUSHBYTES_33":
                        stack.push(Uint8Array.from(Buffer.from(scriptSigOps[++i], "hex")));
                        break;
                    default:
                        throw new Error(`Unsupported opcode: ${op}`);
                }
            }
            else {
                stack.push(this.parseHexString(op));
            }
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
                        const message = this.getmessageHash(transaction, inputIndex, hashTypeNumber);
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
                stack.push(this.parseHexString(op));
            }
        }
        return stack.length === 0;
    }
    verifySignature(publicKey, signature, message) {
        return secp256k1_1.default.ecdsaVerify(signature, message, publicKey);
    }
    parseHexString(hexStr) {
        return Uint8Array.from(Buffer.from(hexStr, "hex"));
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
    HextoNumber(hexString) {
        const byteValues = [];
        for (let i = 0; i < hexString.length; i += 2) {
            const byte = hexString.substr(i, 2);
            byteValues.push(parseInt(byte, 16));
        }
        return byteValues[0];
    }
    getmessageHash(transaction, inputindex, hashType = 0x01) {
        const txclone = transaction.clone();
        const hashTypeBuffer = new Uint8Array([hashType, 0, 0, 0]); //LE
        const input = txclone.inputs[inputindex];
        const prevprevTxOutScript = transaction.vin[inputindex].prevout.scriptpubkey;
        for (const input of txclone.inputs) {
            input.scriptsig = "";
            input.scriptsigsize = (0, utils_1.getVarIntBuffer)(input.scriptsig.length / 2).toString("hex");
        }
        txclone.inputs[inputindex].scriptsig = prevprevTxOutScript.slice(0);
        txclone.inputs[inputindex].scriptsigsize = Buffer.from((0, utils_1.getVarIntBuffer)(txclone.inputs[inputindex].scriptsig.length / 2)).toString("hex");
        if ((hashType & 31) === transaction_1.Transaction.SIGHASH_NONE) {
            txclone.outputscount = "00";
            for (const input of txclone.inputs)
                input.sequence = "0";
        }
        if ((hashType & 31) === transaction_1.Transaction.SIGHASH_SINGLE) {
            txclone.outputs.length = txclone.inputs.length;
            txclone.outputscount = txclone.inputscount;
            for (let i = 0; i < txclone.outputs.length; i++) {
                if (i === inputindex)
                    continue;
                txclone.outputs[i].value = "0";
                txclone.outputs[i].scriptpubkey = "";
            }
            for (let i = 0; i < txclone.inputs.length; i++) {
                if (i === inputindex)
                    continue;
                txclone.inputs[i].sequence = "0";
            }
            if (hashType & transaction_1.Transaction.SIGHASH_ANYONECANPAY) {
                txclone.inputs = [txclone.inputs[inputindex]];
            }
        }
        const txCopyBuffer = Buffer.concat([
            Buffer.from(this.serialize(txclone), "hex"),
            hashTypeBuffer,
        ]);
        return (0, utils_1.doubleSHA256)(txCopyBuffer);
    }
    serialize(tx) {
        let result = tx.verison;
        result += tx.inputscount;
        tx.inputs.forEach((input) => {
            result +=
                input.txid +
                    input.vout +
                    input.scriptsigsize +
                    input.scriptsig +
                    input.sequence;
        });
        result += tx.outputscount;
        tx.outputs.forEach((output) => {
            result += output.value + output.scriptpubkeysize + output.scriptpubkey;
        });
        result += tx.locktime;
        return result;
    }
}
exports.P2PKH = P2PKH;
