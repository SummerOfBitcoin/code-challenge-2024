export const OP_CODES = {
  OP_ADD: 0x93,
  OP_CODESEPARATOR: 0xab,
  OP_DUP: 0x76,
  OP_HASH160: 0xa9,
  OP_SHA256: 0xa8,
  OP_EQUAL: 0x87,
  OP_EQUALVERIFY: 0x88,
  OP_VERIFY: 0x69,
  OP_CHECKSIG: 0xac,
  OP_CHECKSIGVERIFY: 0xad,
  OP_FALSE: 0x00,
  OP_TRUE: 0x51,
};

 import * as fs from "fs";
 import * as crypto from "crypto";
 import * as secp256k1 from "secp256k1";

// Define the available opcodes and their corresponding functions
interface Opcode {
  name: string;
  opcode: number;
  function: OpcodeFunction;
}

type OpcodeFunction = (stack: any[], tx: any, inputIndex: number) => any[];

const opcodes: Opcode[] = [
  {
    name: "OP_DUP",
    opcode: OP_CODES.OP_DUP,
    function: (stack) => {
      if (stack.length === 0) throw new Error("OP_DUP: Stack empty");
      const top = stack[stack.length - 1];
      stack.push(top);
      return stack;
    },
  },
  {
    name: "OP_HASH160",
    opcode: OP_CODES.OP_HASH160,
    function: (stack) => {
      if (stack.length === 0) throw new Error("OP_HASH160: Stack empty");
      const top = stack.pop();
      const hash = crypto.createHash("sha256").update(top).digest();
      const ripemd160 = crypto
        .createHash("ripemd160")
        .update(hash)
        .digest("hex");
      stack.push(ripemd160);
      return stack;
    },
  },
  {
    name: "OP_EQUALVERIFY",
    opcode: OP_CODES.OP_EQUALVERIFY,
    function: (stack) => {
      if (stack.length < 2) throw new Error("OP_EQUALVERIFY: Stack too small");
      const a = stack.pop();
      const b = stack.pop();
      if (a !== b) throw new Error("OP_EQUALVERIFY: Verification failed");
      return stack;
    },
  },
  {
    name: "OP_CHECKSIG",
    opcode: OP_CODES.OP_CHECKSIG,
    function: (stack, tx, inputIndex) => {
      if (stack.length < 2) throw new Error("OP_CHECKSIG: Stack too small");
      const publicKey = stack.pop();
      const signature = stack.pop();
      const isValid = verifySignature(tx, inputIndex, publicKey, signature);
      stack.push(isValid ? 1 : 0);
      return stack;
    },
  },
];

// Define a function to execute a script
export function executeScript(script: number[], tx: any, inputIndex: number): boolean {
  let stack: any[] = [];
  for (const opcode of script) {
    const op = opcodes.find((o) => o.opcode === opcode);
    if (!op) {
      throw new Error(`Unsupported opcode: ${opcode.toString(16)}`);
    }
    stack = op.function(stack, tx, inputIndex);
  }
  return stack.length > 0 && stack[stack.length - 1] !== 0;
}

// Verify the signature of a transaction input
function verifySignature(
  tx: any,
  inputIndex: number,
  publicKey: string,
  signature: string
): boolean {
  const txData = tx.vin[inputIndex];
  const message = getTxInputMessage(tx, inputIndex);
  const publicKeyBuffer = Buffer.from(publicKey, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");

  return secp256k1.ecdsaVerify(
    signatureBuffer,
    crypto.createHash("sha256").update(message).digest(),
    publicKeyBuffer
  );
}

// Construct the message to be signed for a transaction input
function getTxInputMessage(tx: any, inputIndex: number): Buffer {
  const txData = tx.vin[inputIndex];
  const prevTxId = Buffer.from(txData.txid, "hex").reverse();
  const prevTxOutIndex = Buffer.alloc(4);
  prevTxOutIndex.writeUInt32LE(txData.vout);
  const scriptLength = Buffer.alloc(
    varIntBytes(txData.prevout.scriptpubkey.length / 2)
  );
  varIntEncode(scriptLength, txData.prevout.scriptpubkey.length / 2);
  const script = Buffer.from(txData.prevout.scriptpubkey, "hex");
  const sequence = Buffer.alloc(4);
  sequence.writeUInt32LE(txData.sequence);
  const amount = Buffer.alloc(8);
  amount.writeBigInt64LE(BigInt(txData.prevout.value));

  return Buffer.concat([
    prevTxId,
    prevTxOutIndex,
    scriptLength,
    script,
    sequence,
    amount,
  ]);
}

// Validate transactions in the mempool folder
function validateMempoolTransactions(mempoolFolder: string) {
  const validTransactions: string[] = [];
  const invalidTransactions: string[] = [];
  // fs.readdirSync(mempoolFolder).forEach((file) => {
  //     const data = fs.readFileSync(`${mempoolFolder}/${file}`, 'utf-8');
  //     const transactionData = JSON.parse(data);

  //     try {
  //       const isValid = validateTransaction(transactionData);
  //       if (isValid) {
  //         validTransactions.push(file);
  //       } else {
  //         invalidTransactions.push(file);
  //       }
  //     } catch (error) {
  //       invalidTransactions.push(file);
  //       console.error(`Error validating transaction in file ${file}: ${error}`);
  //     }
  //   });
  const transactionData = JSON.parse(transactionJSON[0]);
  try {
    const isValid = validateTransaction(transactionData);
    if (isValid) {
      validTransactions.push(transactionData[0]);
    } else {
      invalidTransactions.push(transactionData[0]);
    }
  } catch (error) {
    invalidTransactions.push(transactionData[0]);
    console.error(`Error validating transaction in file ${transactionData}: ${error}`);
  }

  console.log("Valid transactions:", validTransactions);
  console.log("Invalid transactions:", invalidTransactions);
}

function validateTransaction(transactionData: any): boolean {
  // Validate transaction inputs
  console.log(transactionData);
  for (let i = 0; i < transactionData.vin.length; i++) {
    const input = transactionData.vin[i];
    const script = input.scriptsig || input.witness.join(" ").split(" ").map((item: string) => parseInt(item, 16));
    console.log("Input Script:", script);
    if (!executeScript(script, transactionData, i)) {
      return false;
    }
  }

  // Validate transaction outputs
  for (const output of transactionData.vout) {
    const script = output.scriptpubkey
      .split(" ")
      .map((item: string) => parseInt(item, 16));
      console.log(script);
    if (!executeScript(script, transactionData, 0)) {
      return false;
    }
  }

  return true;
}

// Helper functions for variable-length integer encoding/decoding
function varIntBytes(n: number): number {
  if (n < 0xfd) {
    return 1;
  } else if (n <= 0xffff) {
    return 3;
  } else if (n <= 0xffffffff) {
    return 5;
  } else {
    return 9;
  }
}

function varIntEncode(buffer: Buffer, value: number, offset = 0): number {
  if (value < 0xfd) {
    buffer[offset] = value;
    return 1;
  } else if (value <= 0xffff) {
    buffer[offset] = 0xfd;
    buffer.writeUInt16LE(value, offset + 1);
    return 3;
  } else if (value <= 0xffffffff) {
    buffer[offset] = 0xfe;
    buffer.writeUInt32LE(value, offset + 1);
    return 5;
  } else {
    buffer[offset] = 0xff;
    buffer.writeBigUInt64LE(BigInt(value), offset + 1);
    return 9;
  }
}

// // Example usage
// validateMempoolTransactions("./mempool");

const transactionJSON = [
  `{
  "version": 1,
  "locktime": 0,
  "vin": [
    {
      "txid": "3b7dc918e5671037effad7848727da3d3bf302b05f5ded9bec89449460473bbb",
      "vout": 16,
      "prevout": {
        "scriptpubkey": "0014f8d9f2203c6f0773983392a487d45c0c818f9573",
        "scriptpubkey_asm": "OP_0 OP_PUSHBYTES_20 f8d9f2203c6f0773983392a487d45c0c818f9573",
        "scriptpubkey_type": "v0_p2wpkh",
        "scriptpubkey_address": "bc1qlrvlygpudurh8xpnj2jg04zupjqcl9tnk5np40",
        "value": 37079526
      },
      "scriptsig": "",
      "scriptsig_asm": "",
      "witness": [
        "30440220780ad409b4d13eb1882aaf2e7a53a206734aa302279d6859e254a7f0a7633556022011fd0cbdf5d4374513ef60f850b7059c6a093ab9e46beb002505b7cba0623cf301",
        "022bf8c45da78  9f695d59f93983c813ec205203056e19ec5d3fbefa809af67e2ec"
      ],
      "is_coinbase": false,
      "sequence": 4294967295
    }
  ],
  "vout": [
    {
      "scriptpubkey": "76a9146085312a9c500ff9cc35b571b0a1e5efb7fb9f1688ac",
      "scriptpubkey_asm": "OP_DUP OP_HASH160 OP_PUSHBYTES_20 6085312a9c500ff9cc35b571b0a1e5efb7fb9f16 OP_EQUALVERIFY OP_CHECKSIG",
      "scriptpubkey_type": "p2pkh",
      "scriptpubkey_address": "19oMRmCWMYuhnP5W61ABrjjxHc6RphZh11",
      "value": 100000
    },
    {
      "scriptpubkey": "0014ad4cc1cc859c57477bf90d0f944360d90a3998bf",
      "scriptpubkey_asm": "OP_0 OP_PUSHBYTES_20 ad4cc1cc859c57477bf90d0f944360d90a3998bf",
      "scriptpubkey_type": "v0_p2wpkh",
      "scriptpubkey_address": "bc1q44xvrny9n3t5w7lep58egsmqmy9rnx9lt6u0tc",
      "value": 36977942
    }
  ]
}`,
];

class Stack {
  private stack: Buffer[];

  constructor() {
    this.stack = [];
  }

  public pushToStack(data: Buffer): void {
    this.stack.push(data);
  }

  public popFromStack(): Buffer | undefined {
    return this.stack.pop();
  }

  public getTopStackItem(): Buffer | undefined {
    return this.stack.length > 0 ? this.stack[this.stack.length - 1] : undefined;
  }
}

// class ScriptInterpreter {
//   private stack: Stack;

//   constructor() {
//     this.stack = new Stack();
//   }

//   public executeScript(script: string[], tx: any, inputIndex: number): boolean {
//     for (const opcode of script) {
//       console.log(opcode);
//       if (opcode === 'OP_DUP') {
//         const topItem = this.stack.getTopStackItem();
//         if (topItem) {
//           this.stack.pushToStack(topItem);
//         } else {
//           return false; // Stack underflow
//         }
//       } else if (opcode === 'OP_HASH160') {
//         const data = this.stack.popFromStack();
//         if (data) {
//           const ripemd160 = crypto
//             .createHash('ripemd160')
//             .update(data)
//             .digest();
//           this.stack.pushToStack(ripemd160);
//         } else {
//           return false; // Stack underflow
//         }
//       } else if (opcode === 'OP_EQUALVERIFY') {
//         const topItem1 = this.stack.popFromStack();
//         const topItem2 = this.stack.popFromStack();
//         if (topItem1 && topItem2 && Buffer.compare(topItem1, topItem2) === 0) {
//           // Items are equal
//         } else {
//           return false; // Verification failed
//         }
//       } else if (opcode === 'OP_CHECKSIG') {
//         console.log(this.stack)
//         const publicKey = this.stack.popFromStack()?.toString('hex');
//         const signature = this.stack.popFromStack()?.toString('hex');
//         if (!publicKey || !signature) {
//           return false; // Invalid public key or signature
//         }
//         const isValidSignature = verifySignature(tx, inputIndex, publicKey, signature);
//         if (!isValidSignature) {
//           return false; // Signature verification failed
//         }
//       }
//       // Add support for other opcodes as needed
//     }
//     return true; //
//   }
// }

// function verifySignature(
//   tx: any,
//   inputIndex: number,
//   publicKey: string,
//   signature: string
// ): boolean {
//   const message = getTxInputMessage(tx, inputIndex);
//   const publicKeyBuffer = Buffer.from(publicKey, "hex");
//   const signatureBuffer = Buffer.from(signature, "hex");

//   return secp256k1.ecdsaVerify(
//     signatureBuffer,
//     crypto.createHash("sha256").update(message).digest(),
//     publicKeyBuffer
//   );
// }

// function getTxInputMessage(tx: any, inputIndex: number): Buffer {
//   const txData = tx.vin[inputIndex];
//   const prevTxId = Buffer.from(txData.txid, "hex").reverse();
//   const prevTxOutIndex = Buffer.alloc(4);
//   prevTxOutIndex.writeUInt32LE(txData.vout);
//   const scriptLength = Buffer.alloc(
//     varIntBytes(txData.prevout.scriptpubkey.length / 2)
//   );
//   varIntEncode(scriptLength, txData.prevout.scriptpubkey.length / 2);
//   const script = Buffer.from(txData.prevout.scriptpubkey, "hex");
//   const sequence = Buffer.alloc(4);
//   sequence.writeUInt32LE(txData.sequence);
//   const amount = Buffer.alloc(8);
//   amount.writeBigInt64LE(BigInt(txData.prevout.value));

//   return Buffer.concat([
//     prevTxId,
//     prevTxOutIndex,
//     scriptLength,
//     script,
//     sequence,
//     amount,
//   ]);
// }

// function varIntBytes(n: number): number {
//   if (n < 0xfd) {
//     return 1;
//   } else if (n <= 0xffff) {
//     return 3;
//   } else if (n <= 0xffffffff) {
//     return 5;
//   } else {
//     return 9;
//   }
// }

// function varIntEncode(buffer: Buffer, value: number, offset = 0): number {
//   if (value < 0xfd) {
//     buffer[offset] = value;
//     return 1;
//   } else if (value <= 0xffff) {
//     buffer[offset] = 0xfd;
//     buffer.writeUInt16LE(value, offset + 1);
//     return 3;
//   } else if (value <= 0xffffffff) {
//     buffer[offset] = 0xfe;
//     buffer.writeUInt32LE(value, offset + 1);
//     return 5;
//   } else {
//     buffer[offset] = 0xff;
//     buffer.writeBigUInt64LE(BigInt(value), offset + 1);
//     return 9;
//   }
// }

// // Define your transaction data
// const transactionData = JSON.parse(transactionJSON[0]);

// // Extract the ScriptSig and ScriptPubKey from the transaction data
// const scriptSig = transactionData.vin[0].witness; // Example: ['<Signature>', '<Public Key>']
// const scriptPubKey = transactionData.vout[0].scriptpubkey_asm.split(' '); // Example: ['OP_DUP', 'OP_HASH160', '<Bob\'s Public Key Hash>', 'OP_EQUALVERIFY', 'OP_CHECKSIG']

// // Create a new ScriptInterpreter instance
// const interpreter = new ScriptInterpreter();

// // Execute ScriptSig followed by ScriptPubKey
// const isScriptSigValid = interpreter.executeScript(scriptSig, transactionData, 0); // Assuming only one input in vin array
// const isTransactionValid =interpreter.executeScript(scriptPubKey, transactionData, 0); // Assuming only one input in vin array

// console.log('Is transaction valid:', isTransactionValid);
