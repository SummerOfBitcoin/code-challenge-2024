import { Transaction } from "../transaction";
import { P2PKH } from "./p2pkh";
import { P2WPKH } from "./p2wpkh";

export class BitcoinScript {
  constructor(public transaction: Transaction) {}
  execute(): boolean {
    for (let i = 0; i < this.transaction.vin.length; i++) {
      const input = this.transaction.vin[i];
      const scripttype = input.prevout.scriptpubkey_type;
      let scriptPubKey, scriptSig, witness, publicKeyHash;
      let isValidInput = false;

      switch (scripttype) {
        case "p2pkh":
          scriptPubKey = input.prevout.scriptpubkey_asm;
          scriptSig = input.scriptsig_asm;
          const p2pkh = new P2PKH(this.transaction);
          isValidInput = p2pkh.execute(scriptPubKey, scriptSig, i);
          break;
          case "v0_p2wpkh":
          scriptPubKey = input.prevout.scriptpubkey_asm;
          publicKeyHash = scriptPubKey.split(" ")[2];
          scriptPubKey = `OP_DUP OP_HASH160 ${publicKeyHash} OP_EQUALVERIFY OP_CHECKSIG`;
          witness = input.witness;
          const p2wpkh = new P2WPKH(this.transaction);
          isValidInput = p2wpkh.execute(scriptPubKey, witness, i);
          break;
        default:
          console.error("Unsupported script type:", scripttype);
          break;
      }

      if (!isValidInput) {
        return false;
      }
    }
    return true;
  }
}
