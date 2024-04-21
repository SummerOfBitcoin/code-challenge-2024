import { doubleSHA256, getVarIntBuffer, sha256ripemd160 } from "../utils";

import secp256k1 from "secp256k1";
import { Transaction } from "../transaction";
import { BlockTransaction } from "../interface";

export class P2PKH {
  constructor(public transaction: Transaction) {}
  execute(prevScriptPubKey: string, scriptSig: string, index: number): boolean {
    if (
      !this.verifyScriptExecution(
        prevScriptPubKey,
        scriptSig,
        this.transaction,
        index
      )
    ) {
      return false;
    }

    return true;
  }
  private verifyScriptExecution(
    scriptPubKey: string,
    scriptSig: string,
    transaction: Transaction,
    inputIndex: number
  ): boolean {
    const stack: Uint8Array[] = [];
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
      } else {
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
            stack.push(sha256ripemd160(data!));
            break;
          case "OP_PUSHBYTES_20":
            stack.push(
              Uint8Array.from(Buffer.from(scriptPubKeyOps[++i], "hex"))
            );
            break;
          case "OP_EQUALVERIFY":
            const a = stack.pop();
            const b = stack.pop();
            if (!this.isEqual(a!, b!)) {
              return false;
            }
            break;
          case "OP_CHECKSIG":
            const publicKey = stack.pop()!;
            const signature = stack.pop()!;
            const hashTypeNumber = signature[signature.byteLength - 1];
            const message = this.getmessageHash(
              transaction,
              inputIndex,
              hashTypeNumber
            );
            const sigDEC = secp256k1.signatureImport(
              signature.slice(0, signature.byteLength - 1)
            );
            if (!this.verifySignature(publicKey, sigDEC, message)) {
              return false;
            }
            break;
          default:
            throw new Error(`Unsupported opcode: ${op}`);
        }
      } else {
        stack.push(this.parseHexString(op));
      }
    }

    return stack.length === 0;
  }
  private verifySignature(
    publicKey: Uint8Array,
    signature: Uint8Array,
    message: Uint8Array
  ): boolean {
    return secp256k1.ecdsaVerify(signature, message, publicKey);
  }
  private parseHexString(hexStr: string): Uint8Array {
    return Uint8Array.from(Buffer.from(hexStr, "hex"));
  }
  private isEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  private HextoNumber(hexString: string): number {
    const byteValues = [];
    for (let i = 0; i < hexString.length; i += 2) {
      const byte = hexString.substr(i, 2);
      byteValues.push(parseInt(byte, 16));
    }
    return byteValues[0];
  }
  private getmessageHash(
    transaction: Transaction,
    inputindex: number,
    hashType: number = 0x01
  ) {
    const txclone = transaction.clone();
    const hashTypeBuffer = new Uint8Array([hashType, 0, 0, 0]); //LE
    const input = txclone.inputs[inputindex];
    const prevprevTxOutScript =
      transaction.vin[inputindex].prevout.scriptpubkey;
    for (const input of txclone.inputs) {
      input.scriptsig = "";
      input.scriptsigsize = getVarIntBuffer(
        input.scriptsig.length / 2
      ).toString("hex");
    }
    txclone.inputs[inputindex].scriptsig = prevprevTxOutScript.slice(0);
    txclone.inputs[inputindex].scriptsigsize = Buffer.from(
      getVarIntBuffer(txclone.inputs[inputindex].scriptsig.length / 2)
    ).toString("hex");

    if ((hashType & 31) === Transaction.SIGHASH_NONE) {
      txclone.outputscount = "00";
      for (const input of txclone.inputs) input.sequence = "0";
    }
    if ((hashType & 31) === Transaction.SIGHASH_SINGLE) {
      txclone.outputs.length = txclone.inputs.length;
      txclone.outputscount = txclone.inputscount;
      for (let i = 0; i < txclone.outputs.length; i++) {
        if (i === inputindex) continue;
        txclone.outputs[i].value = "0";
        txclone.outputs[i].scriptpubkey = "";
      }

      for (let i = 0; i < txclone.inputs.length; i++) {
        if (i === inputindex) continue;
        txclone.inputs[i].sequence = "0";
      }

      if (hashType & Transaction.SIGHASH_ANYONECANPAY) {
        txclone.inputs = [txclone.inputs[inputindex]];
      }
    }
    const txCopyBuffer = Buffer.concat([
      Buffer.from(this.serialize(txclone), "hex"),
      hashTypeBuffer,
    ]);
    return doubleSHA256(txCopyBuffer);
  }
  private serialize(tx:any): string {
    let result = tx.verison;
    result += tx.inputscount;
    tx.inputs.forEach((input: any) => {
      result +=
        input.txid +
        input.vout +
        input.scriptsigsize +
        input.scriptsig +
        input.sequence;
    });
    result += tx.outputscount;
    tx.outputs.forEach((output: any) => {
      result += output.value + output.scriptpubkeysize + output.scriptpubkey;
    });
    result += tx.locktime;
    return result;
  }
}

// const transactionJSON = `{
//     "version": 2,
//     "locktime": 0,
//     "vin": [
//       {
//         "txid": "f90c6250721ab434261896f8060a3d1c975ba22d87b497181638ee6378d043f8",
//         "vout": 0,
//         "prevout": {
//           "scriptpubkey": "76a9146ba861153db87d2b9e43e543cd90f3041f4de9ad88ac",
//           "scriptpubkey_asm": "OP_DUP OP_HASH160 OP_PUSHBYTES_20 6ba861153db87d2b9e43e543cd90f3041f4de9ad OP_EQUALVERIFY OP_CHECKSIG",
//           "scriptpubkey_type": "p2pkh",
//           "scriptpubkey_address": "1ApF1ikgTiKqsddud48Aa7r9fV5EaV7RDX",
//           "value": 7342
//         },
//         "scriptsig": "47304402203d5403c42d4dc2974c291564b990d7277035a3395dca9d1496a5ae3b879baf29022043e41538be9077d68dd30c520cd778754b3286578ac5473d21bc27393def9b5d01210272d0e5b8014fa64da18c31c0cc7a89bedaaf5d933a2ef2d7926d7ebe21ed31dd",
//         "scriptsig_asm": "OP_PUSHBYTES_71 304402203d5403c42d4dc2974c291564b990d7277035a3395dca9d1496a5ae3b879baf29022043e41538be9077d68dd30c520cd778754b3286578ac5473d21bc27393def9b5d01 OP_PUSHBYTES_33 0272d0e5b8014fa64da18c31c0cc7a89bedaaf5d933a2ef2d7926d7ebe21ed31dd",
//         "is_coinbase": false,
//         "sequence": 4294967295
//       },
//       {
//         "txid": "f90c6250721ab434261896f8060a3d1c975ba22d87b497181638ee6378d043f8",
//         "vout": 1,
//         "prevout": {
//           "scriptpubkey": "76a9145da5b1289a806300bcae16f2747dc072965e987e88ac",
//           "scriptpubkey_asm": "OP_DUP OP_HASH160 OP_PUSHBYTES_20 5da5b1289a806300bcae16f2747dc072965e987e OP_EQUALVERIFY OP_CHECKSIG",
//           "scriptpubkey_type": "p2pkh",
//           "scriptpubkey_address": "19YALKnyBxYSsCm93aEAEYTvucJgDCmyM1",
//           "value": 59655
//         },
//         "scriptsig": "483045022100b7d10c38d6c19a6f4d7e1ebf6c070ad015fe14cfe4b38be96abb8928a23b396d0220620f1b7484e5cfd9d5ab7f4cc9a7b0e024bf4327f81234255d06b9b5420235fa01210382b9fb8038bbcaab4011f2674291a81678f3233b39a326de37e9a6b4e7503b1b",
//         "scriptsig_asm": "OP_PUSHBYTES_72 3045022100b7d10c38d6c19a6f4d7e1ebf6c070ad015fe14cfe4b38be96abb8928a23b396d0220620f1b7484e5cfd9d5ab7f4cc9a7b0e024bf4327f81234255d06b9b5420235fa01 OP_PUSHBYTES_33 0382b9fb8038bbcaab4011f2674291a81678f3233b39a326de37e9a6b4e7503b1b",
//         "is_coinbase": false,
//         "sequence": 4294967295
//       }
//     ],
//     "vout": [
//       {
//         "scriptpubkey": "a914a30c50e0923d4e9ef2955f88bd0874f625a68f8e87",
//         "scriptpubkey_asm": "OP_HASH160 OP_PUSHBYTES_20 a30c50e0923d4e9ef2955f88bd0874f625a68f8e OP_EQUAL",
//         "scriptpubkey_type": "p2sh",
//         "scriptpubkey_address": "3GZ8pY95R45c6CcXEjfnRBkvdEUZsnrE1q",
//         "value": 13683
//       },
//       {
//         "scriptpubkey": "76a914a37109bcd5c8d6589c81b83401469ba0f9e491fd88ac",
//         "scriptpubkey_asm": "OP_DUP OP_HASH160 OP_PUSHBYTES_20 a37109bcd5c8d6589c81b83401469ba0f9e491fd OP_EQUALVERIFY OP_CHECKSIG",
//         "scriptpubkey_type": "p2pkh",
//         "scriptpubkey_address": "1FuCZHksgC9bX4q7M8GDNhDeoE2WznRhzc",
//         "value": 40856
//       }
//     ]
//   }`;

// const transaction = new Transaction(JSON.parse(transactionJSON));

// function verifyTransactionScript(tx: Transaction): boolean {
//   for (let i = 0; i < tx.vin.length; i++) {
//     const input = tx.vin[i];
//     const prevScriptPubKey = input.prevout.scriptpubkey_asm;
//     const scriptSig = input.scriptsig_asm;
//     const scripttype = input.prevout.scriptpubkey_type;

//     if (scripttype === "p2pkh") {
//       const p2pkh = new P2PKH(tx);
//       console.log(
//         "Done------------------",
//         p2pkh.execute(prevScriptPubKey, scriptSig, i)
//       );
//       return p2pkh.execute(prevScriptPubKey, scriptSig, i);
//     }
//     // if (!(prevScriptPubKey, scriptSig, tx, i)) {
//     //   return false;
//     // }
//   }

//   return true;
// }

// console.log(verifyTransactionScript(transaction));
