"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = exports.Vin = exports.Vout = exports.Prevout = void 0;
const crypto_1 = __importDefault(require("crypto"));
const utils_1 = require("./utils");
class Prevout {
    constructor(prevout) {
        this.scriptpubkey = prevout.scriptpubkey;
        this.scriptpubkey_asm = prevout.scriptpubkey_asm;
        this.scriptpubkey_type = prevout.scriptpubkey_type;
        this.scriptpubkey_address = prevout.scriptpubkey_address;
        this.value = prevout.value;
    }
    serialize() {
        const buffers = [];
        buffers.push(Buffer.from([
            this.scriptpubkey.length & 0xff,
            (this.scriptpubkey.length >> 8) & 0xff,
            (this.scriptpubkey.length >> 16) & 0xff,
            (this.scriptpubkey.length >> 24) & 0xff,
        ]));
        buffers.push(Buffer.from(this.scriptpubkey, "hex"));
        buffers.push(Buffer.from([
            this.scriptpubkey_asm.length & 0xff,
            (this.scriptpubkey_asm.length >> 8) & 0xff,
            (this.scriptpubkey_asm.length >> 16) & 0xff,
            (this.scriptpubkey_asm.length >> 24) & 0xff,
        ]));
        buffers.push(Buffer.from(this.scriptpubkey_asm, "hex"));
        buffers.push(Buffer.from([
            this.scriptpubkey_type.length & 0xff,
            (this.scriptpubkey_type.length >> 8) & 0xff,
            (this.scriptpubkey_type.length >> 16) & 0xff,
            (this.scriptpubkey_type.length >> 24) & 0xff,
        ]));
        buffers.push(Buffer.from(this.scriptpubkey_type, "hex"));
        buffers.push(Buffer.from([
            this.scriptpubkey_address.length & 0xff,
            (this.scriptpubkey_address.length >> 8) & 0xff,
            (this.scriptpubkey_address.length >> 16) & 0xff,
            (this.scriptpubkey_address.length >> 24) & 0xff,
        ]));
        buffers.push(Buffer.from(this.scriptpubkey_address, "hex"));
        buffers.push(Buffer.from([
            this.value & 0xff,
            (this.value >> 8) & 0xff,
            (this.value >> 16) & 0xff,
            (this.value >> 24) & 0xff,
            (this.value >> 32) & 0xff,
            (this.value >> 40) & 0xff,
            (this.value >> 48) & 0xff,
            (this.value >> 56) & 0xff,
        ]));
        return Buffer.concat(buffers);
    }
}
exports.Prevout = Prevout;
class Vout {
    constructor(output) {
        this.scriptpubkey = output.scriptpubkey;
        this.scriptpubkey_asm = output.scriptpubkey_asm;
        this.scriptpubkey_type = output.scriptpubkey_type;
        this.value = output.value;
    }
    serialize() {
        const buffers = [];
        const valueBuffer = Buffer.alloc(8);
        valueBuffer.writeBigUInt64LE(BigInt(this.value));
        buffers.push(Buffer.from(valueBuffer));
        const scriptpubkeyLength = this.scriptpubkey.length / 2;
        buffers.push(Buffer.from((0, utils_1.getVarIntBuffer)(scriptpubkeyLength)));
        buffers.push(Buffer.from(this.scriptpubkey, "hex"));
        return Buffer.concat(buffers);
    }
}
exports.Vout = Vout;
class Vin {
    constructor(input) {
        this.txid = input.txid;
        this.vout = input.vout;
        this.prevout = new Prevout(input.prevout);
        this.scriptsig = input.scriptsig;
        this.scriptsig_asm = input.scriptsig_asm;
        this.witness = input.witness || [];
        this.is_coinbase = input.is_coinbase;
        this.sequence = input.sequence;
    }
    serialize() {
        const buffers = [];
        buffers.push(Buffer.from(this.txid, "hex").reverse());
        buffers.push(Buffer.from([
            this.vout & 0xff,
            (this.vout >> 8) & 0xff,
            (this.vout >> 16) & 0xff,
            (this.vout >> 24) & 0xff,
        ]));
        if (this.scriptsig) {
            const scriptbyte = this.scriptsig.length / 2;
            buffers.push(Buffer.from((0, utils_1.getVarIntBuffer)(scriptbyte)));
            buffers.push(Buffer.from(this.scriptsig, "hex"));
        }
        else {
            buffers.push(Buffer.from([0x00]));
        }
        buffers.push(Buffer.from([
            this.sequence & 0xff,
            (this.sequence >> 8) & 0xff,
            (this.sequence >> 16) & 0xff,
            (this.sequence >> 24) & 0xff,
        ]));
        return Buffer.concat(buffers);
    }
}
exports.Vin = Vin;
class Transaction {
    constructor(tx) {
        this.version = 0;
        this.locktime = 0;
        this.vin = [];
        this.vout = [];
        this.tx_fee = 0;
        this.txid = this.getTxId();
        this.version = tx.version;
        this.locktime = tx.locktime;
        this.vin = tx.vin.map((input) => new Vin(input));
        this.vout = tx.vout.map((output) => new Vout(output));
    }
    serializeVout(vouts) {
        const buffers = [];
        const voutCount = (0, utils_1.serializeVarInt)(vouts.length);
        buffers.push(Buffer.from(voutCount));
        for (const output of vouts) {
            buffers.push(output.serialize());
        }
        return Buffer.concat(buffers);
    }
    serializeWitness(vin) {
        const buffer = [];
        for (const input of vin) {
            if (input.witness.length > 0) {
                buffer.push(Buffer.from([input.witness.length]));
                for (const item of input.witness) {
                    const witnessBytes = item.length / 2;
                    buffer.push(Buffer.from((0, utils_1.getVarIntBuffer)(witnessBytes)));
                    buffer.push(Buffer.from(item, "hex"));
                }
            }
        }
        return Buffer.concat(buffer);
    }
    bufferVerison() {
        return Buffer.from([
            this.version & 0xff,
            (this.version >> 8) & 0xff,
            (this.version >> 16) & 0xff,
            (this.version >> 24) & 0xff,
        ]);
    }
    getTx() {
        const isSegwit = this.hasSegWit(this.vin);
        return Object.assign({ txid: this.getTxId(), wtxid: isSegwit ? this.getWtxid() : this.getTxId(), weight: this.getWeightUnit(), vbytes: this.getVirualBytes(), bytes: this.getbytes(), fee: this.isCoinbase() ? 0 : this.calculatefee() }, this.clone());
    }
    clone() {
        const verison = this.bufferVerison().toString("hex");
        let flag = "";
        let marker = "";
        if (this.hasSegWit(this.vin)) {
            flag = Buffer.from([0x00]).toString("hex");
            marker = Buffer.from([0x01]).toString("hex");
        }
        const inputs = [];
        const inputscount = Buffer.from((0, utils_1.serializeVarInt)(this.vin.length)).toString("hex");
        for (let vin of this.vin) {
            inputs.push({
                txid: Buffer.from(vin.txid, "hex").reverse().toString("hex"),
                vout: Buffer.from([
                    vin.vout & 0xff,
                    (vin.vout >> 8) & 0xff,
                    (vin.vout >> 16) & 0xff,
                    (vin.vout >> 24) & 0xff,
                ]).toString("hex"),
                scriptsigsize: Buffer.from((0, utils_1.getVarIntBuffer)(vin.scriptsig.length / 2)).toString("hex") || Buffer.from([0x00]).toString("hex"),
                scriptsig: Buffer.from(vin.scriptsig, "hex").toString("hex"),
                sequence: Buffer.from([
                    vin.sequence & 0xff,
                    (vin.sequence >> 8) & 0xff,
                    (vin.sequence >> 16) & 0xff,
                    (vin.sequence >> 24) & 0xff,
                ]).toString("hex"),
            });
        }
        const outputs = [];
        const outputscount = Buffer.from((0, utils_1.serializeVarInt)(this.vout.length)).toString("hex");
        for (let output of this.vout) {
            const valueBuffer = Buffer.alloc(8);
            valueBuffer.writeBigUInt64LE(BigInt(output.value));
            outputs.push({
                value: Buffer.from(valueBuffer).toString("hex"),
                scriptpubkeysize: Buffer.from((0, utils_1.getVarIntBuffer)(output.scriptpubkey.length / 2)).toString("hex"),
                scriptpubkey: Buffer.from(output.scriptpubkey, "hex").toString("hex"),
            });
        }
        const witness = [];
        if (this.hasSegWit(this.vin)) {
            this.vin.forEach((input) => {
                const formattedWitness = {
                    stackitems: input.witness.length.toString(),
                };
                input.witness.forEach((item, i) => {
                    formattedWitness[i.toString()] = {
                        size: Buffer.from(item, "hex").length.toString(),
                        item: item,
                    };
                });
                witness.push(formattedWitness);
            });
        }
        const locktime = Buffer.from([
            this.locktime & 0xff,
            (this.locktime >> 8) & 0xff,
            (this.locktime >> 16) & 0xff,
            (this.locktime >> 24) & 0xff,
        ]).toString("hex");
        return this.hasSegWit(this.vin)
            ? {
                verison,
                marker,
                flag,
                inputscount,
                inputs,
                outputscount,
                outputs,
                witness,
                locktime,
            }
            : { verison, inputscount, inputs, outputscount, outputs, locktime };
    }
    isSegwit(input) {
        return input.witness && input.witness.length > 0;
    }
    calculatefee() {
        let inputvalues = 0;
        let outputvalues = 0;
        for (const input of this.vin) {
            inputvalues += input.prevout.value;
        }
        for (const output of this.vout) {
            outputvalues += output.value;
        }
        return inputvalues - outputvalues;
    }
    getbytes() {
        return this.hasSegWit(this.vin)
            ? this.serializeWithWitness().length / 2
            : this.serialize().length / 2;
    }
    getWeightUnit() {
        return this.serialize().length / 2 * 3 + this.serializeWithWitness().length / 2 * 1;
    }
    getVirualBytes() {
        return this.getWeightUnit() / 4;
    }
    hasSegWit(vin) {
        return vin.some((input) => this.isSegwit(input));
    }
    serializeVin(vins) {
        const buffers = [];
        const vinCount = (0, utils_1.serializeVarInt)(vins.length);
        buffers.push(Buffer.from(vinCount));
        for (const input of vins) {
            buffers.push(input.serialize());
        }
        return Buffer.concat(buffers);
    }
    serializeWithWitness() {
        const buffers = [];
        buffers.push(Buffer.from([
            this.version & 0xff,
            (this.version >> 8) & 0xff,
            (this.version >> 16) & 0xff,
            (this.version >> 24) & 0xff,
        ]));
        const hasSegWit = this.hasSegWit(this.vin);
        if (hasSegWit) {
            buffers.push(Buffer.from([0x00, 0x01])); // flag and marker
        }
        buffers.push(this.serializeVin(this.vin));
        buffers.push(this.serializeVout(this.vout));
        if (hasSegWit) {
            buffers.push(this.serializeWitness(this.vin));
        }
        buffers.push(Buffer.from([
            this.locktime & 0xff,
            (this.locktime >> 8) & 0xff,
            (this.locktime >> 16) & 0xff,
            (this.locktime >> 24) & 0xff,
        ]));
        return Buffer.concat(buffers).toString("hex");
    }
    serialize() {
        const buffers = [];
        buffers.push(Buffer.from([
            this.version & 0xff,
            (this.version >> 8) & 0xff,
            (this.version >> 16) & 0xff,
            (this.version >> 24) & 0xff,
        ]));
        buffers.push(this.serializeVin(this.vin));
        buffers.push(this.serializeVout(this.vout));
        buffers.push(Buffer.from([
            this.locktime & 0xff,
            (this.locktime >> 8) & 0xff,
            (this.locktime >> 16) & 0xff,
            (this.locktime >> 24) & 0xff,
        ]));
        return Buffer.concat(buffers).toString("hex");
    }
    doubleSha256(data) {
        return crypto_1.default
            .createHash("sha256")
            .update(crypto_1.default.createHash("sha256").update(data).digest())
            .digest();
    }
    getTxIdReverseByteOrder() {
        return Buffer.from(this.doubleSha256(this.serializebuffer()))
            .reverse()
            .toString("hex");
    }
    serializebuffer() {
        return Buffer.from(this.serialize(), "hex");
    }
    serializebufferwithWitness() {
        return Buffer.from(this.serializeWithWitness(), "hex");
    }
    getTxId() {
        return Buffer.from(this.doubleSha256(this.serializebuffer())).toString("hex");
    }
    getfileName() {
        const reversedHash = Buffer.from(this.doubleSha256(this.serializebuffer())).reverse();
        return crypto_1.default
            .createHash("sha256")
            .update(reversedHash)
            .digest()
            .reverse()
            .reverse()
            .toString("hex");
    }
    getWtxid() {
        return Buffer.from(this.doubleSha256(this.serializebufferwithWitness())).toString("hex");
    }
    isCoinbase() {
        return (this.vin.length === 1 &&
            this.vin[0].txid === "0".repeat(64) &&
            this.vin[0].vout === 0xffffffff);
    }
}
exports.Transaction = Transaction;
Transaction.SIGHASH_ALL = 0x00000001;
Transaction.SIGHASH_NONE = 0x00000002;
Transaction.SIGHASH_SINGLE = 0x00000003;
Transaction.SIGHASH_ANYONECANPAY = 0x00000080;
