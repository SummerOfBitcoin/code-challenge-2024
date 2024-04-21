"use strict";
// import { Transaction } from "../transaction";
// import secp256k1 from "secp256k1";
// import crypto from "crypto";
// import { doubleSHA256, sha256ripemd160 } from "../utils";
// const transactionJSON = `{
//   "version": 2,
//   "locktime": 0,
//   "vin": [
//     {
//       "txid": "1a67667f2350cf3e2f8d5c0065be1c9fb66c62f3c6a115e95f2dee815fa4e58f",
//       "vout": 3,
//       "prevout": {
//         "scriptpubkey": "00149ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_asm": "OP_0 OP_PUSHBYTES_20 9ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_type": "v0_p2wpkh",
//         "scriptpubkey_address": "bc1qntr428wlm5h3f2uy6ggdcqderqvl4smunt8rx6",
//         "value": 235224
//       },
//       "scriptsig": "",
//       "scriptsig_asm": "",
//       "witness": [
//         "304402203f5ce502fbf448a02cc8ffbfde703e28fe33163c57e33887eef30ba9c670ff4102206094c2030a87342105e1076f1c296a74fb4607d4a9684364fe4ded851eb8b1a101",
//         "0303551edc8f6570bb6d1cac2a1f3275fc2434b3ae5c689b57755b1c4674fc3251"
//       ],
//       "is_coinbase": false,
//       "sequence": 2147483649
//     },
//     {
//       "txid": "00237a29733a5a5d70906098428f99364804971bc49e344378303da413a19304",
//       "vout": 0,
//       "prevout": {
//         "scriptpubkey": "00149ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_asm": "OP_0 OP_PUSHBYTES_20 9ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_type": "v0_p2wpkh",
//         "scriptpubkey_address": "bc1qntr428wlm5h3f2uy6ggdcqderqvl4smunt8rx6",
//         "value": 547
//       },
//       "scriptsig": "",
//       "scriptsig_asm": "",
//       "witness": [
//         "30450221008deef8a29bc68b272f17822026447d79e4fdebbe3ca06e5ce6b66fecac1a60ef02202fccace91fb43494105c293a9b5dd5acab854f1bf15af96253f36e63ecbb1b8001",
//         "0303551edc8f6570bb6d1cac2a1f3275fc2434b3ae5c689b57755b1c4674fc3251"
//       ],
//       "is_coinbase": false,
//       "sequence": 2147483649
//     },
//     {
//       "txid": "5dbcb4d98bc86da84e02825c212ba982dd806a23aa7834ac33957e5dca843da5",
//       "vout": 0,
//       "prevout": {
//         "scriptpubkey": "00149ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_asm": "OP_0 OP_PUSHBYTES_20 9ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_type": "v0_p2wpkh",
//         "scriptpubkey_address": "bc1qntr428wlm5h3f2uy6ggdcqderqvl4smunt8rx6",
//         "value": 547
//       },
//       "scriptsig": "",
//       "scriptsig_asm": "",
//       "witness": [
//         "3045022100978ed4ed5d6e1d97575b146bfabee2c4172f3b0029b356993a28b5c318c75af302203dab4b571bee0b8da970fbb3057866935d0fb2915354669982c1bdaec072a23701",
//         "0303551edc8f6570bb6d1cac2a1f3275fc2434b3ae5c689b57755b1c4674fc3251"
//       ],
//       "is_coinbase": false,
//       "sequence": 2147483649
//     },
//     {
//       "txid": "dfadf34077db356cd66f0e0b74844438e019351ddc009a83969a339f7e81526e",
//       "vout": 0,
//       "prevout": {
//         "scriptpubkey": "00149ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_asm": "OP_0 OP_PUSHBYTES_20 9ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_type": "v0_p2wpkh",
//         "scriptpubkey_address": "bc1qntr428wlm5h3f2uy6ggdcqderqvl4smunt8rx6",
//         "value": 547
//       },
//       "scriptsig": "",
//       "scriptsig_asm": "",
//       "witness": [
//         "30440220434ed2c3004ebda9cb27125c3e5034b16ee7be5afbe66e0294b49d2a779dcb8e0220426c52432e3bc9a8fc9887c848060cde8f8a6f16ec4a140040cea30d23783d7801",
//         "0303551edc8f6570bb6d1cac2a1f3275fc2434b3ae5c689b57755b1c4674fc3251"
//       ],
//       "is_coinbase": false,
//       "sequence": 2147483649
//     },
//     {
//       "txid": "225125e81d7452d9e930030b7c3d3b8da3c7453ae4d7c0eab81d8813471b7623",
//       "vout": 0,
//       "prevout": {
//         "scriptpubkey": "00149ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_asm": "OP_0 OP_PUSHBYTES_20 9ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_type": "v0_p2wpkh",
//         "scriptpubkey_address": "bc1qntr428wlm5h3f2uy6ggdcqderqvl4smunt8rx6",
//         "value": 547
//       },
//       "scriptsig": "",
//       "scriptsig_asm": "",
//       "witness": [
//         "3045022100b22a6f0cad8af968e60b3b40acb144151718a9cd22b7491389934157ce026cc3022009d9f40ab30330bb46ca5c1ea8835b665d94a9884b815bf972061a9c12b6fc2a01",
//         "0303551edc8f6570bb6d1cac2a1f3275fc2434b3ae5c689b57755b1c4674fc3251"
//       ],
//       "is_coinbase": false,
//       "sequence": 2147483649
//     },
//     {
//       "txid": "53adab4972f8e714e2b72d97b41902158d8e41c9f4ce01161e47d1c1faa47bf7",
//       "vout": 0,
//       "prevout": {
//         "scriptpubkey": "00149ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_asm": "OP_0 OP_PUSHBYTES_20 9ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_type": "v0_p2wpkh",
//         "scriptpubkey_address": "bc1qntr428wlm5h3f2uy6ggdcqderqvl4smunt8rx6",
//         "value": 547
//       },
//       "scriptsig": "",
//       "scriptsig_asm": "",
//       "witness": [
//         "30440220708c87c614801c814c49ca674567c7d6a6d273dd9c6a1d1b46c90c6ffcb594e702204bbffface1124829c31bc5aab5138113ed66fe19d9a6ec5d257ad66bb6ced67501",
//         "0303551edc8f6570bb6d1cac2a1f3275fc2434b3ae5c689b57755b1c4674fc3251"
//       ],
//       "is_coinbase": false,
//       "sequence": 2147483649
//     },
//     {
//       "txid": "c0b08cf0f845f47df8441ee9e006c5c800cd685830cdf9f67caf6f46acc8ecf6",
//       "vout": 0,
//       "prevout": {
//         "scriptpubkey": "00149ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_asm": "OP_0 OP_PUSHBYTES_20 9ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_type": "v0_p2wpkh",
//         "scriptpubkey_address": "bc1qntr428wlm5h3f2uy6ggdcqderqvl4smunt8rx6",
//         "value": 547
//       },
//       "scriptsig": "",
//       "scriptsig_asm": "",
//       "witness": [
//         "304402203f9629f956e4122d62f03421a8782ba7967ff1ffecc024f179dfaedbebf2467502202118f6d93326fe84b25ee7d972c80114c84fc878f04abfda0abaf5be454254e101",
//         "0303551edc8f6570bb6d1cac2a1f3275fc2434b3ae5c689b57755b1c4674fc3251"
//       ],
//       "is_coinbase": false,
//       "sequence": 2147483649
//     },
//     {
//       "txid": "caf5fe07f474c52d81f3baea9a725db4981f11c2e28501f477c0b72f7dad5586",
//       "vout": 0,
//       "prevout": {
//         "scriptpubkey": "00149ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_asm": "OP_0 OP_PUSHBYTES_20 9ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_type": "v0_p2wpkh",
//         "scriptpubkey_address": "bc1qntr428wlm5h3f2uy6ggdcqderqvl4smunt8rx6",
//         "value": 547
//       },
//       "scriptsig": "",
//       "scriptsig_asm": "",
//       "witness": [
//         "3045022100d71fe18f4b76eb9937854bc5666f1fd30e83200f5fd5968f4f1bb00f9072d6dd02206d60d14cebefed8b8562799548343811e28c65fe7d488a00a376fd32e2a35a0101",
//         "0303551edc8f6570bb6d1cac2a1f3275fc2434b3ae5c689b57755b1c4674fc3251"
//       ],
//       "is_coinbase": false,
//       "sequence": 2147483649
//     },
//     {
//       "txid": "84428d72bf5986df2c26fe4d2b86b968313e66f93646c39b91d1c1e715aa31fc",
//       "vout": 0,
//       "prevout": {
//         "scriptpubkey": "00149ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_asm": "OP_0 OP_PUSHBYTES_20 9ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_type": "v0_p2wpkh",
//         "scriptpubkey_address": "bc1qntr428wlm5h3f2uy6ggdcqderqvl4smunt8rx6",
//         "value": 547
//       },
//       "scriptsig": "",
//       "scriptsig_asm": "",
//       "witness": [
//         "30440220484f7ee00e23a0a94a8daa67f6e1d943e82b006056c126cc497e38ec2f0298e1022056e2150138911d106f517eb013e76abcc55980da1cd2fa08b8fbca67a899f82f01",
//         "0303551edc8f6570bb6d1cac2a1f3275fc2434b3ae5c689b57755b1c4674fc3251"
//       ],
//       "is_coinbase": false,
//       "sequence": 2147483649
//     },
//     {
//       "txid": "0841c4cd591969045a05d043047af7e9d0e52cfc6cff039489ad2531dcb7bf86",
//       "vout": 0,
//       "prevout": {
//         "scriptpubkey": "00149ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_asm": "OP_0 OP_PUSHBYTES_20 9ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_type": "v0_p2wpkh",
//         "scriptpubkey_address": "bc1qntr428wlm5h3f2uy6ggdcqderqvl4smunt8rx6",
//         "value": 547
//       },
//       "scriptsig": "",
//       "scriptsig_asm": "",
//       "witness": [
//         "304402204889f5b744f4f70645e5deccfe67557cb723024d3aef2292346f4dc8810ad480022007137b37ca7c35f5c2375cd7865fad8678e6c021460b0543642ba0c227adab4001",
//         "0303551edc8f6570bb6d1cac2a1f3275fc2434b3ae5c689b57755b1c4674fc3251"
//       ],
//       "is_coinbase": false,
//       "sequence": 2147483649
//     },
//     {
//       "txid": "12ed064fac90e756be8bcf609b357488beb34ba9b1d6dd632693afa8b471c79e",
//       "vout": 0,
//       "prevout": {
//         "scriptpubkey": "00149ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_asm": "OP_0 OP_PUSHBYTES_20 9ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_type": "v0_p2wpkh",
//         "scriptpubkey_address": "bc1qntr428wlm5h3f2uy6ggdcqderqvl4smunt8rx6",
//         "value": 547
//       },
//       "scriptsig": "",
//       "scriptsig_asm": "",
//       "witness": [
//         "3045022100e3c087ba93e90221a9057bfcf988ddf2da96ed485a62b185671ea7db6e17b3a4022067d456a5c6e784aad31d93850d26a382a975cdf83d6ba3ec8a5d7c1607d2e58801",
//         "0303551edc8f6570bb6d1cac2a1f3275fc2434b3ae5c689b57755b1c4674fc3251"
//       ],
//       "is_coinbase": false,
//       "sequence": 2147483649
//     },
//     {
//       "txid": "fcd9ab8328fbd4df33aef589a855b1784f1f4b27d8a789807a08fae84aafeb84",
//       "vout": 0,
//       "prevout": {
//         "scriptpubkey": "00149ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_asm": "OP_0 OP_PUSHBYTES_20 9ac7551ddfdd2f14ab84d210dc01b91819fac37c",
//         "scriptpubkey_type": "v0_p2wpkh",
//         "scriptpubkey_address": "bc1qntr428wlm5h3f2uy6ggdcqderqvl4smunt8rx6",
//         "value": 547
//       },
//       "scriptsig": "",
//       "scriptsig_asm": "",
//       "witness": [
//         "3045022100c510e67062ba5ed751774f9728e4407ad392e8e51da7e1d831d58810338b2b7e022073f5d249dac89706f98c7d3dc24cc5d320705a2208ab5498a080b763e8506fc701",
//         "0303551edc8f6570bb6d1cac2a1f3275fc2434b3ae5c689b57755b1c4674fc3251"
//       ],
//       "is_coinbase": false,
//       "sequence": 2147483649
//     }
//   ],
//   "vout": [
//     {
//       "scriptpubkey": "0014f7fe66067d430d49c194f79d3f1961c1e0bdcb4f",
//       "scriptpubkey_asm": "OP_0 OP_PUSHBYTES_20 f7fe66067d430d49c194f79d3f1961c1e0bdcb4f",
//       "scriptpubkey_type": "v0_p2wpkh",
//       "scriptpubkey_address": "bc1q7llxvpnagvx5nsv577wn7xtpc8stmj603rqmvk",
//       "value": 226689
//     }
//   ]
// }`;
// const transaction = new Transaction(JSON.parse(transactionJSON));
// function verifyTransactionScript(tx: Transaction): boolean {
//   for (let i = 0; i < tx.vin.length; i++) {
//     const input = tx.vin[i];
//     const prevScriptPubKey = input.prevout.scriptpubkey_asm;
//     const publicKeyHash = prevScriptPubKey.split(" ")[2];
//     const scriptpubkey = `OP_DUP OP_HASH160 ${publicKeyHash} OP_EQUALVERIFY OP_CHECKSIG`;
//     const witness = input.witness;
//     if (!verifyScriptExecution(scriptpubkey, witness, tx, i)) {
//       return false;
//     }
//   }
//   return true;
// }
// function verifyScriptExecution(
//   scriptPubKey: string,
//   witness: string[],
//   tx: Transaction,
//   inputIndex: number
// ) {
//   let stack: Uint8Array[] = [];
//   for (const sigs of witness) {
//     stack.push(Uint8Array.from(Buffer.from(sigs, "hex")));
//   }
//   const scriptPubKeyOps = scriptPubKey.split(" ");
//   for (let i = 0; i < scriptPubKeyOps.length; i++) {
//     const op = scriptPubKeyOps[i];
//     if (op.startsWith("OP_")) {
//       switch (op) {
//         case "OP_DUP":
//           stack.push(stack[stack.length - 1]);
//           break;
//         case "OP_HASH160":
//           const data = stack.pop();
//           stack.push(sha256ripemd160(data!));
//           break;
//         case "OP_PUSHBYTES_20":
//           stack.push(Uint8Array.from(Buffer.from(scriptPubKeyOps[++i], "hex")));
//           break;
//         case "OP_EQUALVERIFY":
//           const a = stack.pop();
//           const b = stack.pop();
//           if (!isEqual(a!, b!)) {
//             return false;
//           }
//           break;
//         case "OP_CHECKSIG":
//           const publicKey = stack.pop()!;
//           const signature = stack.pop()!;
//           const hashTypeNumber = signature[signature.byteLength - 1];
//           const message = getTransactionMessageHash(
//             tx,
//             inputIndex,
//             scriptPubKeyOps[2],
//             hashTypeNumber
//           );
//           const sigDEC = secp256k1.signatureImport(
//             signature.slice(0, signature.byteLength - 1)
//           );
//           if (!verifySignature(publicKey, sigDEC, message)) {
//             return false;
//           }
//           break;
//         default:
//           throw new Error(`Unsupported opcode: ${op}`);
//       }
//     } else {
//       stack.push(Uint8Array.from(Buffer.from(op, "hex")));
//     }
//   }
//   return stack.length === 0;
// }
// function verifySignature(
//   publicKey: Uint8Array,
//   signature: Uint8Array,
//   message: Uint8Array
// ): boolean {
//   return secp256k1.ecdsaVerify(signature, message, publicKey);
// }
// function getTransactionMessageHash(
//   tx: Transaction,
//   inputIndex: number,
//   publickeyhash: string,
//   hashTypeNumber: number = 0x01
// ) {
//   const txclone = tx.clone();
//   const hashTypeBuffer = Buffer.alloc(4);
//   hashTypeBuffer.writeUInt32LE(hashTypeNumber);
//   const txidVoutBuffers = txclone.inputs.map((input) =>
//     Buffer.from(input.txid + input.vout, "hex")
//   );
//   const txidVouts = Buffer.concat(txidVoutBuffers);
//   const sequenceBuffers = txclone.inputs.map((input) =>
//     Buffer.from(input.sequence, "hex")
//   );
//   const inputsSequence = Buffer.concat(sequenceBuffers);
//   const outputBuffers = txclone.outputs.map((output) =>
//     Buffer.from(
//       output.value + output.scriptpubkeysize + output.scriptpubkey,
//       "hex"
//     )
//   );
//   const outputs = Buffer.concat(outputBuffers);
//   const outputshash = doubleSHA256(outputs);
//   const sequenceshash = doubleSHA256(inputsSequence);
//   const inputshash = doubleSHA256(txidVouts);
//   const inputAmount = Buffer.alloc(8);
//   inputAmount.writeBigUInt64LE(BigInt(tx.vin[inputIndex].prevout.value));
//   const inputSequence = Buffer.from(txclone.inputs[inputIndex].sequence, "hex");
//   const scriptcode = Buffer.from(`1976a914${publickeyhash}88ac`, "hex");
//   const message = Buffer.concat([
//     Buffer.from(txclone.verison, "hex"),
//     inputshash,
//     sequenceshash,
//     Buffer.from(txclone.inputs[inputIndex].txid, "hex"),
//     Buffer.from(txclone.inputs[inputIndex].vout, "hex"),
//     scriptcode,
//     inputAmount,
//     inputSequence,
//     outputshash,
//     Buffer.from(txclone.locktime, "hex"),
//     hashTypeBuffer,
//   ]);
//   return doubleSHA256(message);
// }
// console.log(verifyTransactionScript(transaction));
// export class P2WPKH {
//   constructor(public transaction: Transaction) {}
//   execute(
//     scriptPubKey: string,
//     witness: string[],
//     inputIndex: number
//   ): boolean {
//     if (
//       !this.verifyScriptExecution(
//         scriptPubKey,
//         witness,
//         inputIndex,
//         this.transaction
//       )
//     ) {
//       return false;
//     }
//     return true;
//   }
//   private verifyScriptExecution(
//     scriptPubKey: string,
//     witness: string[],
//     inputIndex: number,
//     transaction: Transaction
//   ): boolean {
//     let stack: Uint8Array[] = [];
//     for (const sigs of witness) {
//       stack.push(Uint8Array.from(Buffer.from(sigs, "hex")));
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
//             stack.push(
//               Uint8Array.from(Buffer.from(scriptPubKeyOps[++i], "hex"))
//             );
//             break;
//           case "OP_EQUALVERIFY":
//             const a = stack.pop();
//             const b = stack.pop();
//             if (!this.isEqual(a!, b!)) {
//               return false;
//             }
//             break;
//           case "OP_CHECKSIG":
//             const publicKey = stack.pop()!;
//             const signature = stack.pop()!;
//             const hashTypeNumber = signature[signature.byteLength - 1];
//             const message = this.getMessageHash(
//               this.transaction,
//               inputIndex,
//               scriptPubKeyOps[2],
//               hashTypeNumber
//             );
//             const sigDEC = secp256k1.signatureImport(
//               signature.slice(0, signature.byteLength - 1)
//             );
//             if (!this.verifySignature(publicKey, sigDEC, message)) {
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
//   private verifySignature(
//     publicKey: Uint8Array,
//     signature: Uint8Array,
//     message: Uint8Array
//   ): boolean {
//     return secp256k1.ecdsaVerify(signature, message, publicKey);
//   }
//   private getMessageHash(
//     tx: Transaction,
//     inputIndex: number,
//     publickeyhash: string,
//     hashTypeNumber: number = 0x01
//   ) {
//     const txclone = tx.clone();
//     const hashTypeBuffer = Buffer.alloc(4);
//     hashTypeBuffer.writeUInt32LE(hashTypeNumber);
//     const txidVoutBuffers = txclone.inputs.map((input) =>
//       Buffer.from(input.txid + input.vout, "hex")
//     );
//     const txidVouts = Buffer.concat(txidVoutBuffers);
//     const sequenceBuffers = txclone.inputs.map((input) =>
//       Buffer.from(input.sequence, "hex")
//     );
//     const inputsSequence = Buffer.concat(sequenceBuffers);
//     const outputBuffers = txclone.outputs.map((output) =>
//       Buffer.from(
//         output.value + output.scriptpubkeysize + output.scriptpubkey,
//         "hex"
//       )
//     );
//     const outputs = Buffer.concat(outputBuffers);
//     const outputshash = doubleSHA256(outputs);
//     const sequenceshash = doubleSHA256(inputsSequence);
//     const inputshash = doubleSHA256(txidVouts);
//     const inputAmount = Buffer.alloc(8);
//     inputAmount.writeBigUInt64LE(BigInt(tx.vin[inputIndex].prevout.value));
//     const inputSequence = Buffer.from(
//       txclone.inputs[inputIndex].sequence,
//       "hex"
//     );
//     const scriptcode = Buffer.from(`1976a914${publickeyhash}88ac`, "hex");
//     const message = Buffer.concat([
//       Buffer.from(txclone.verison, "hex"),
//       inputshash,
//       sequenceshash,
//       Buffer.from(txclone.inputs[inputIndex].txid, "hex"),
//       Buffer.from(txclone.inputs[inputIndex].vout, "hex"),
//       scriptcode,
//       inputAmount,
//       inputSequence,
//       outputshash,
//       Buffer.from(txclone.locktime, "hex"),
//       hashTypeBuffer,
//     ]);
//     return doubleSHA256(message);
//   }
//   private isEqual(a: Uint8Array, b: Uint8Array) {
//     if (a.length !== b.length) return false;
//     for (let i = 0; i < a.length; i++) {
//       if (a[i] !== b[i]) return false;
//     }
//     return true;
//   }
// }
