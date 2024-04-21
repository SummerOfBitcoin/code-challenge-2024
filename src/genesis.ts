// import { Block, BTC } from "./block";
// import { Transaction, Vin, Vout } from "./transaction";

// export const genesisText = Buffer.from(
//   "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks",
//   "utf8"
// );
// export const coinbaseInput: Vin = {
//   txid: "0".repeat(64),
//   vout: 0xffffffff,
//   prevout: {
//     scriptpubkey: "",
//     scriptpubkey_asm: "",
//     scriptpubkey_type: "",
//     scriptpubkey_address: "",
//     value: 0,
//     serialize: function (): Buffer {
//       throw new Error("Function not implemented.");
//     },
//   },
//   scriptsig: "",
//   scriptsig_asm: "",
//   witness: [],
//   is_coinbase: true,
//   sequence: 0xffffffff,
//   serialize: function (): Buffer {
//     throw new Error("Function not implemented.");
//   },
// };

// export const coinbaseOutput = {
//   value: 50 * BTC,
//   scriptpubkey: genesisText.toString("hex"),
//   scriptpubkey_asm: "",
//   scriptpubkey_type: "",
//   scriptpubkey_address: "",
//   serialize: function (): Buffer {
//     throw new Error("Function not implemented.");
//   },
// };
// const tx = new Transaction({
//   version: 1,
//   locktime: 0,
//   vin: [coinbaseInput],
//   vout: [coinbaseOutput],
// });
// export const genesisBlock = new Block("0".repeat(64), [tx.getTx()]);
