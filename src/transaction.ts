import crypto from "crypto";
import {
  BlockTransaction,
  FormattedWitness,
  TransactionData,
} from "./interface";
import { getVarIntBuffer, hash160, serializeVarInt } from "./utils";
export class Prevout {
  public scriptpubkey: string;
  public scriptpubkey_asm: string;
  public scriptpubkey_type: string;
  public scriptpubkey_address: string;
  public value: number;

  constructor(prevout: Prevout) {
    this.scriptpubkey = prevout.scriptpubkey;
    this.scriptpubkey_asm = prevout.scriptpubkey_asm;
    this.scriptpubkey_type = prevout.scriptpubkey_type;
    this.scriptpubkey_address = prevout.scriptpubkey_address;
    this.value = prevout.value;
  }

  public serialize(): Buffer {
    const buffers: Buffer[] = [];

    buffers.push(
      Buffer.from([
        this.scriptpubkey.length & 0xff,
        (this.scriptpubkey.length >> 8) & 0xff,
        (this.scriptpubkey.length >> 16) & 0xff,
        (this.scriptpubkey.length >> 24) & 0xff,
      ])
    );
    buffers.push(Buffer.from(this.scriptpubkey, "hex"));
    buffers.push(
      Buffer.from([
        this.scriptpubkey_asm.length & 0xff,
        (this.scriptpubkey_asm.length >> 8) & 0xff,
        (this.scriptpubkey_asm.length >> 16) & 0xff,
        (this.scriptpubkey_asm.length >> 24) & 0xff,
      ])
    );
    buffers.push(Buffer.from(this.scriptpubkey_asm, "hex"));
    buffers.push(
      Buffer.from([
        this.scriptpubkey_type.length & 0xff,
        (this.scriptpubkey_type.length >> 8) & 0xff,
        (this.scriptpubkey_type.length >> 16) & 0xff,
        (this.scriptpubkey_type.length >> 24) & 0xff,
      ])
    );
    buffers.push(Buffer.from(this.scriptpubkey_type, "hex"));
    buffers.push(
      Buffer.from([
        this.scriptpubkey_address.length & 0xff,
        (this.scriptpubkey_address.length >> 8) & 0xff,
        (this.scriptpubkey_address.length >> 16) & 0xff,
        (this.scriptpubkey_address.length >> 24) & 0xff,
      ])
    );
    buffers.push(Buffer.from(this.scriptpubkey_address, "hex"));
    buffers.push(
      Buffer.from([
        this.value & 0xff,
        (this.value >> 8) & 0xff,
        (this.value >> 16) & 0xff,
        (this.value >> 24) & 0xff,
        (this.value >> 32) & 0xff,
        (this.value >> 40) & 0xff,
        (this.value >> 48) & 0xff,
        (this.value >> 56) & 0xff,
      ])
    );

    return Buffer.concat(buffers);
  }
}

export class Vout {
  public scriptpubkey: string;
  public scriptpubkey_asm: string;
  public scriptpubkey_type: string;
  public value: number;

  constructor(output: Vout) {
    this.scriptpubkey = output.scriptpubkey;
    this.scriptpubkey_asm = output.scriptpubkey_asm;
    this.scriptpubkey_type = output.scriptpubkey_type;
    this.value = output.value;
  }
  public serialize(): Buffer {
    const buffers: Buffer[] = [];
    const valueBuffer = Buffer.alloc(8);
    valueBuffer.writeBigUInt64LE(BigInt(this.value));
    buffers.push(Buffer.from(valueBuffer));
    const scriptpubkeyLength = this.scriptpubkey.length / 2;
    buffers.push(Buffer.from(getVarIntBuffer(scriptpubkeyLength)));
    buffers.push(Buffer.from(this.scriptpubkey, "hex"));
    return Buffer.concat(buffers);
  }
}

export class Vin {
  public readonly txid: string;
  public vout: number;
  public prevout: Prevout;
  public scriptsig: string;
  public scriptsig_asm: string;
  public witness: string[];
  public is_coinbase: boolean;
  public sequence: number;
  constructor(input: Vin) {
    this.txid = input.txid;
    this.vout = input.vout;
    this.prevout = new Prevout(input.prevout);
    this.scriptsig = input.scriptsig;
    this.scriptsig_asm = input.scriptsig_asm;
    this.witness = input.witness || [];
    this.is_coinbase = input.is_coinbase;
    this.sequence = input.sequence;
  }

  public serialize(): Buffer {
    const buffers: Buffer[] = [];
    buffers.push(Buffer.from(this.txid, "hex").reverse());
    buffers.push(
      Buffer.from([
        this.vout & 0xff,
        (this.vout >> 8) & 0xff,
        (this.vout >> 16) & 0xff,
        (this.vout >> 24) & 0xff,
      ])
    );
    if (this.scriptsig) {
      const scriptbyte = this.scriptsig.length / 2;
      buffers.push(Buffer.from(getVarIntBuffer(scriptbyte)));
      buffers.push(Buffer.from(this.scriptsig, "hex"));
    } else {
      buffers.push(Buffer.from([0x00]));
    }
    buffers.push(
      Buffer.from([
        this.sequence & 0xff,
        (this.sequence >> 8) & 0xff,
        (this.sequence >> 16) & 0xff,
        (this.sequence >> 24) & 0xff,
      ])
    );
    return Buffer.concat(buffers);
  }
}

export class Transaction {
  public txid: string;
  public version: number = 0;
  public locktime: number = 0;
  public vin: Vin[] = [];
  public vout: Vout[] = [];
  public tx_fee: number = 0;
  static SIGHASH_ALL = 0x00000001;
  static SIGHASH_NONE = 0x00000002;
  static SIGHASH_SINGLE = 0x00000003;
  static SIGHASH_ANYONECANPAY = 0x00000080;

  constructor(tx: TransactionData) {
    this.txid = this.getTxId();
    this.version = tx.version;
    this.locktime = tx.locktime;
    this.vin = tx.vin.map((input: any) => new Vin(input));
    this.vout = tx.vout.map((output: any) => new Vout(output));
  }
  private serializeVout(vouts: Vout[]): Buffer {
    const buffers: Buffer[] = [];
    const voutCount = serializeVarInt(vouts.length);
    buffers.push(Buffer.from(voutCount));
    for (const output of vouts) {
      buffers.push(output.serialize());
    }
    return Buffer.concat(buffers);
  }
  private serializeWitness(vin: Vin[]): Buffer {
    const buffer: Buffer[] = [];
    for (const input of vin) {
      if (input.witness.length > 0) {
        buffer.push(Buffer.from([input.witness.length]));
        for (const item of input.witness) {
          const witnessBytes = item.length / 2;
          buffer.push(Buffer.from(getVarIntBuffer(witnessBytes)));
          buffer.push(Buffer.from(item, "hex"));
        }
      }
    }
    return Buffer.concat(buffer);
  }

  private bufferVerison(): Buffer {
    return Buffer.from([
      this.version & 0xff,
      (this.version >> 8) & 0xff,
      (this.version >> 16) & 0xff,
      (this.version >> 24) & 0xff,
    ]);
  }
  public getTx(): BlockTransaction {
    const isSegwit = this.hasSegWit(this.vin);
    return {
      txid: this.getTxId(),
      wtxid: isSegwit ? this.getWtxid() : this.getTxId(),
      weight: this.getWeightUnit(),
      vbytes: this.getVirualBytes(),
      bytes: this.getbytes(),
      fee:this.isCoinbase()? 0 : this.calculatefee(),
      ...this.clone(),
    };
  }
  public clone() {
    const verison = this.bufferVerison().toString("hex");
    let flag = "";
    let marker = "";
    if (this.hasSegWit(this.vin)) {
      flag = Buffer.from([0x00]).toString("hex");
      marker = Buffer.from([0x01]).toString("hex");
    }
    const inputs = [];
    const inputscount = Buffer.from(serializeVarInt(this.vin.length)).toString(
      "hex"
    );
    for (let vin of this.vin) {
      inputs.push({
        txid: Buffer.from(vin.txid, "hex").reverse().toString("hex"),
        vout: Buffer.from([
          vin.vout & 0xff,
          (vin.vout >> 8) & 0xff,
          (vin.vout >> 16) & 0xff,
          (vin.vout >> 24) & 0xff,
        ]).toString("hex"),
        scriptsigsize:
          Buffer.from(getVarIntBuffer(vin.scriptsig.length / 2)).toString(
            "hex"
          ) || Buffer.from([0x00]).toString("hex"),
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
    const outputscount = Buffer.from(
      serializeVarInt(this.vout.length)
    ).toString("hex");

    for (let output of this.vout) {
      const valueBuffer = Buffer.alloc(8);
      valueBuffer.writeBigUInt64LE(BigInt(output.value));
      outputs.push({
        value: Buffer.from(valueBuffer).toString("hex"),
        scriptpubkeysize: Buffer.from(
          getVarIntBuffer(output.scriptpubkey.length / 2)
        ).toString("hex"),
        scriptpubkey: Buffer.from(output.scriptpubkey, "hex").toString("hex"),
      });
    }
    const witness: FormattedWitness[] = [];
    if (this.hasSegWit(this.vin)) {
      this.vin.forEach((input) => {
        const formattedWitness: FormattedWitness = {
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

  private isSegwit(input: Vin): boolean {
    return input.witness && input.witness.length > 0;
  }
  public calculatefee() {
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
  public getbytes() {
    return this.hasSegWit(this.vin)
      ? this.serializeWithWitness().length / 2
      : this.serialize().length / 2;
  }
  public getWeightUnit() {
    return this.serialize().length * 3 + this.getbytes();
  }
  public getVirualBytes() {
    return this.getWeightUnit() / 4;
  }

  private hasSegWit(vin: Vin[]): boolean {
    return vin.some((input) => this.isSegwit(input));
  }

  private serializeVin(vins: Vin[]): Buffer {
    const buffers: Buffer[] = [];
    const vinCount = serializeVarInt(vins.length);
    buffers.push(Buffer.from(vinCount));
    for (const input of vins) {
      buffers.push(input.serialize());
    }
    return Buffer.concat(buffers);
  }
  public serializeWithWitness(): string {
    const buffers: Buffer[] = [];
    buffers.push(
      Buffer.from([
        this.version & 0xff,
        (this.version >> 8) & 0xff,
        (this.version >> 16) & 0xff,
        (this.version >> 24) & 0xff,
      ])
    );
    const hasSegWit = this.hasSegWit(this.vin);
    if (hasSegWit) {
      buffers.push(Buffer.from([0x00, 0x01])); // flag and marker
    }
    buffers.push(this.serializeVin(this.vin));
    buffers.push(this.serializeVout(this.vout));
    if (hasSegWit) {
      buffers.push(this.serializeWitness(this.vin));
    }
    buffers.push(
      Buffer.from([
        this.locktime & 0xff,
        (this.locktime >> 8) & 0xff,
        (this.locktime >> 16) & 0xff,
        (this.locktime >> 24) & 0xff,
      ])
    );
    return Buffer.concat(buffers).toString("hex");
  }
  public serialize(): string {
    const buffers: Buffer[] = [];
    buffers.push(
      Buffer.from([
        this.version & 0xff,
        (this.version >> 8) & 0xff,
        (this.version >> 16) & 0xff,
        (this.version >> 24) & 0xff,
      ])
    );

    buffers.push(this.serializeVin(this.vin));
    buffers.push(this.serializeVout(this.vout));
    buffers.push(
      Buffer.from([
        this.locktime & 0xff,
        (this.locktime >> 8) & 0xff,
        (this.locktime >> 16) & 0xff,
        (this.locktime >> 24) & 0xff,
      ])
    );
    return Buffer.concat(buffers).toString("hex");
  }

  private doubleSha256(data: Buffer): Buffer {
    return crypto
      .createHash("sha256")
      .update(crypto.createHash("sha256").update(data).digest())
      .digest();
  }
  public getTxIdReverseByteOrder() {
    return Buffer.from(this.doubleSha256(this.serializebuffer()))
      .reverse()
      .toString("hex");
  }
  private serializebuffer(): Buffer {
    return Buffer.from(this.serialize(), "hex");
  }
  private serializebufferwithWitness(): Buffer {
    return Buffer.from(this.serializeWithWitness(), "hex");
  }
  public getTxId(): string {
    return Buffer.from(this.doubleSha256(this.serializebuffer())).toString(
      "hex"
    );
  }
  public getfileName(): string {
    const reversedHash = Buffer.from(
      this.doubleSha256(this.serializebuffer())
    ).reverse();
    return crypto
      .createHash("sha256")
      .update(reversedHash)
      .digest()
      .reverse()
      .reverse()
      .toString("hex");
  }
  public getWtxid() {
    return Buffer.from(
      this.doubleSha256(this.serializebufferwithWitness())
    ).toString("hex");
  }
  public isCoinbase(): boolean {
    return (
      this.vin.length === 1 &&
      this.vin[0].txid === "0".repeat(64) &&
      this.vin[0].vout === 0xffffffff
    );
  }
}
