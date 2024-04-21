export interface PrevOut {
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_type: string;
    scriptpubkey_address: string;
    value: number;
  }
  
  export interface TxIn {
    txid: string;
    vout: number;
    prevout: PrevOut;
    scriptsig: string;
    scriptsig_asm: string;
    witness: string[];
    is_coinbase: boolean;
    sequence: number;
  }
  export interface TxOut {
    scriptpubkey: string;
    scriptpubkey_asm?: string;
    scriptpubkey_type?: string;
    scriptpubkey_address?: string;
    value: number;
  }
  
  export interface TransactionData {
    version: number;
    locktime: number;
    vin: TxIn[];
    vout: TxOut[];
  }

 
 export interface WitnessItem {
    size: string;
    item: string;
  }
 export interface FormattedWitness {
    stackitems: string;
    [index: string]: WitnessItem | string;
  }
  
export interface BlockTransaction{
  txid:string,
  wtxid:string,
  weight:number,
  vbytes:number,
  bytes:number,
  verison:string,
  marker?:string,
  flag?:string,
  fee:number,
  inputscount:string,
  inputs:{
    txid: string;
    vout: string;
    scriptsigsize: string;
    scriptsig: string;
    sequence: string;
  }[],
  outputscount:string,
  outputs:{
    value: string;
    scriptpubkeysize: string;
    scriptpubkey: string;
  }[],
  witness?:FormattedWitness[],
  locktime:string,
}