"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitcoinWriter = exports.BitcoinReader = exports.varUintBytes = void 0;
const varUint = __importStar(require("varuint-bitcoin"));
function varUintBytes(n) {
    return varUint.encodingLength(n);
}
exports.varUintBytes = varUintBytes;
class BitcoinReader {
    constructor(buffer, offset = 0) {
        this.buffer = buffer;
        this.offset = offset;
        this.size = buffer.byteLength;
        this.dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    }
    isParsing() {
        return this.offset < this.buffer.byteLength;
    }
    eatByte() {
        return this.buffer[this.offset++];
    }
    eatBuffer(size) {
        this.offset += size;
        return this.buffer.slice(this.offset - size, this.offset);
    }
    eatUInt32() {
        this.offset += 4;
        return this.dataView.getUint32(this.offset - 4, true);
    }
    eatSlice(length) {
        const slice = this.buffer.slice(this.offset, this.offset + length);
        this.offset += length;
        return slice;
    }
    eatVarUint() {
        const v = varUint.decode(this.buffer, this.offset);
        this.offset += varUint.decode.bytes;
        return v;
    }
    eatBigInt64() {
        const n = this.dataView.getBigUint64(this.offset, true);
        this.offset += 8;
        return n;
    }
}
exports.BitcoinReader = BitcoinReader;
class BitcoinWriter {
    constructor(buffer, offset = 0) {
        this.buffer = buffer;
        this.offset = offset;
        this.dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    }
    writeUint32(v) {
        this.dataView.setUint32(this.offset, v, true);
        this.offset += 4;
    }
    writeBuffer(buffer, offset = 0) {
        for (let i = offset; i < buffer.byteLength; i++) {
            this.buffer[this.offset++] = buffer[i];
        }
    }
    writeByte(v) {
        this.buffer[this.offset++] = v;
    }
    writeBigUint(v) {
        this.dataView.setBigUint64(this.offset, v, true);
        this.offset += 8;
    }
    writeVarUint(v) {
        varUint.encode(v, this.buffer, this.offset);
        this.offset += varUint.encode.bytes;
    }
}
exports.BitcoinWriter = BitcoinWriter;
