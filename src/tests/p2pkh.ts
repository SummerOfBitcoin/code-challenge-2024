// import { Transaction } from "../transaction";

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
  
//   const transaction = new Transaction(JSON.parse(transactionJSON));
  
//   function verifyTransactionScript(tx: Transaction): boolean {
//     for (let i = 0; i < tx.vin.length; i++) {
//       const input = tx.vin[i];
//       const prevScriptPubKey = input.prevout.scriptpubkey_asm;
//       const scriptSig = input.scriptsig_asm;
  
//       if (!verifyScriptExecution(prevScriptPubKey, scriptSig, tx, i)) {
//         return false;
//       }
//     }
  
//     return true;
//   }
  
//   function verifyScriptExecution(
//     scriptPubKey: string,
//     scriptSig: string,
//     tx: Transaction,
//     inputIndex: number
//   ): boolean {
//     let stack: Uint8Array[] = [];
  
//     // Execute the unlocking script (scriptSig)
//     const scriptSigOps = scriptSig.split(" ");
//     for (let i = 0; i < scriptSigOps.length; i++) {
//       const op = scriptSigOps[i];
//       if (op.startsWith("OP_")) {
//         switch (op) {
//           case "OP_PUSHBYTES_71":
//           case "OP_PUSHBYTES_72":
//           case "OP_PUSHBYTES_33":
//             stack.push(Uint8Array.from(Buffer.from(scriptSigOps[++i], "hex")));
//             break;
//           default:
//             throw new Error(`Unsupported opcode: ${op}`);
//         }
//       } else {
//         stack.push(Uint8Array.from(Buffer.from(op, "hex")));
//       }
//     }
  
//     const scriptPubKeyOps = scriptPubKey.split(" ");
//     for (let i = 0; i < scriptPubKeyOps.length; i++) {
//       const op = scriptPubKeyOps[i];
//       if (op.startsWith("OP_")) {
//         switch (op) {
//           case "OP_DUP":
//             stack.push(stack[stack.length - 1]);
//             break;
//           case "OP_HASH160":
//             const data = stack.pop();
//             stack.push(sha256ripemd160(data!));
//             break;
//           case "OP_PUSHBYTES_20":
//             stack.push(Uint8Array.from(Buffer.from(scriptPubKeyOps[++i], "hex")));
//             break;
//           case "OP_EQUALVERIFY":
//             const a = stack.pop();
//             const b = stack.pop();
//             if (!isEqual(a!, b!)) {
//               return false;
//             }
//             break;
//           case "OP_CHECKSIG":
//             const publicKey = stack.pop()!;
//             const signature = stack.pop()!;
//             const hashTypeNumber = signature[signature.byteLength - 1];
//             const message = getTransactionHashforSignature(
//               tx,
//               inputIndex,
//               hashTypeNumber
//             );
//             const sigDEC = secp256k1.signatureImport(
//               signature.slice(0, signature.byteLength - 1)
//             );
//             if (!verifySignature(publicKey, sigDEC, message)) {
//               return false;
//             }
//             break;
//           default:
//             throw new Error(`Unsupported opcode: ${op}`);
//         }
//       } else {
//         stack.push(Uint8Array.from(Buffer.from(op, "hex")));
//       }
//     }
//     return stack.length === 0;
//   }
  
//   function isEqual(a: Uint8Array, b: Uint8Array): boolean {
//     if (a.length !== b.length) return false;
//     for (let i = 0; i < a.length; i++) {
//       if (a[i] !== b[i]) return false;
//     }
//     return true;
//   }
  
//   function verifySignature(
//     publicKey: Uint8Array,
//     signature: Uint8Array,
//     message: Uint8Array
//   ): boolean {
//     return secp256k1.ecdsaVerify(signature, message, publicKey);
//   }
  
//   function sha256ripemd160(data: Uint8Array): Uint8Array {
//     const sha256Hash = crypto.createHash("sha256").update(data).digest();
//     const ripemd160Hash = crypto
//       .createHash("ripemd160")
//       .update(sha256Hash)
//       .digest();
//     return Uint8Array.from(ripemd160Hash);
//   }
//   function HextoNumber(hexString: string) {
//     const byteValues = [];
//     for (let i = 0; i < hexString.length; i += 2) {
//       const byte = hexString.substr(i, 2);
//       byteValues.push(parseInt(byte, 16));
//     }
  
//     return byteValues[0];
//   }
//   function getTransactionHashforSignature(
//     tx: Transaction,
//     inputindex: number,
//     hashType: number = 0x01
//   ) {
//     const txclone = tx.clone();
//     const hashTypeBuffer = new Uint8Array([hashType, 0, 0, 0]); //LE
//     const input = txclone.inputs[inputindex];
//     const prevprevTxOutScript =
//       tx.vin[HextoNumber(input.vout)].prevout.scriptpubkey;
//     for (const input of txclone.inputs) {
//       input.scriptsig = "";
//       input.scriptsigsize = getVarIntBuffer(input.scriptsig.length / 2).toString(
//         "hex"
//       );
//     }
//     txclone.inputs[inputindex].scriptsig = prevprevTxOutScript.slice(0);
//     txclone.inputs[inputindex].scriptsigsize = Buffer.from(
//       getVarIntBuffer(txclone.inputs[inputindex].scriptsig.length / 2)
//     ).toString("hex");
  
//     if ((hashType & 31) === Transaction.SIGHASH_NONE) {
//       txclone.outputscount = "00";
//       for (const input of txclone.inputs) input.sequence = "0";
//     }
//     if ((hashType & 31) === Transaction.SIGHASH_SINGLE) {
//       txclone.outputs.length = txclone.inputs.length;
//       txclone.outputscount = txclone.inputscount;
//       for (let i = 0; i < txclone.outputs.length; i++) {
//         if (i === inputindex) continue;
//         txclone.outputs[i].value = "0";
//         txclone.outputs[i].scriptpubkey = "";
//       }
  
//       for (let i = 0; i < txclone.inputs.length; i++) {
//         if (i === inputindex) continue;
//         txclone.inputs[i].sequence = "0";
//       }
  
//       if (hashType & Transaction.SIGHASH_ANYONECANPAY) {
//         txclone.inputs = [txclone.inputs[inputindex]];
//       }
//     }
//     const txCopyBuffer = Buffer.concat([
//       Buffer.from(serialize(txclone), "hex"),
//       hashTypeBuffer,
//     ]);
//     return doubleSHA256(txCopyBuffer);
//   }
  
//   function serialize(tx: any): string {
//     let result = tx.verison;
//     result += tx.inputscount;
//     tx.inputs.forEach((input: any) => {
//       result +=
//         input.txid +
//         input.vout +
//         input.scriptsigsize +
//         input.scriptsig +
//         input.sequence;
//     });
//     result += tx.outputscount;
//     tx.outputs.forEach((output: any) => {
//       result += output.value + output.scriptpubkeysize + output.scriptpubkey;
//     });
//     result += tx.locktime;
//     return result;
//   }
  
//   // getTransactionHashforSignature(transaction,0)
  
//   console.log(verifyTransactionScript(transaction));
  
//   // Function to extract r and s values from a DER-encoded Bitcoin signature
  
//   // Example usage
//   function extractRS(signatureBytes: Uint8Array): { r: bigint; s: bigint } {
//     // Ensure the signature starts with 0x30 (DER sequence tag)
//     if (signatureBytes[0] !== 0x30) {
//       throw new Error(
//         "Invalid signature format. Expected DER sequence tag (0x30)."
//       );
//     }
  
//     // Get the length of the signature
//     const totalLength: number = signatureBytes[1];
  
//     // Locate the r field
//     let rStartIdx: number = 2; // Start after sequence tag and length
//     let rLength: number = signatureBytes[rStartIdx + 1]; // Length of r field
//     let rIdx: number = rStartIdx + 2; // Start of r value
//     while (signatureBytes[rIdx] === 0) {
//       // Skip leading zeroes
//       rLength--;
//       rIdx++;
//     }
//     const rBytes: Uint8Array = signatureBytes.slice(rIdx, rIdx + rLength);
//     const r: bigint = bytesToBigInt(rBytes);
  
//     // Locate the s field
//     let sStartIdx: number = rIdx + rLength; // Start after r field
//     let sLength: number = signatureBytes[sStartIdx + 1]; // Length of s field
//     let sIdx: number = sStartIdx + 2; // Start of s value
//     while (signatureBytes[sIdx] === 0) {
//       // Skip leading zeroes
//       sLength--;
//       sIdx++;
//     }
//     const sBytes: Uint8Array = signatureBytes.slice(sIdx, sIdx + sLength);
//     const s: bigint = bytesToBigInt(sBytes);
  
//     return { r, s };
//   }
  
//   // Helper function to convert bytes to BigInt
//   function bytesToBigInt(bytes: Uint8Array): bigint {
//     let result = BigInt(0);
//     for (let i = 0; i < bytes.length; i++) {
//       result = result * BigInt(256) + BigInt(bytes[i]);
//     }
//     return result;
//   }
  
//   // const signatureBytes: Uint8Array = new Uint8Array([
//   //   48,  69,   2,  33,   0, 218, 147, 179,  93, 127,  43,  49,
//   //   80, 157,  44,  81,  15,  70,  34, 129, 116, 188, 193, 101,
//   //   135,  36, 162, 135, 114, 219, 161, 166, 179,  96,   6, 239,
//   //   58,   2,  32,  25, 148, 150,  40,   2, 152,  28,   7, 182,
//   //   68,   5, 213, 216, 124,  45, 210,   5,  97,  80, 159, 196,
//   //   219, 192,  55, 119, 122, 223,  58,  86,  74,  46, 101,   1
//   // ]);
  
//   // const { r, s } = extractRS(signatureBytes);
//   // const R= r.toString();
//   // const S= s.toString()
//   // console.log(R);
//   // console.log(S)
  