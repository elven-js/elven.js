import { Transaction } from '@multiversx/sdk-core/out/transaction';
export declare const guardianPreSignTxOperations: (tx: Transaction) => Transaction;
export declare const sendTxToGuardian: (signedTx: Transaction, walletAddress?: string) => Promise<void>;
export declare const checkNeedsGuardianSigning: (signedTx: Transaction) => boolean;
