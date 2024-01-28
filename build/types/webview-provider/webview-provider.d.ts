/**
 * Required for xPortal Hub integration
 * Based on sdk-dapp webview provider implementation
 * It will probably be replaced with separate library in the future
 */
import { Transaction } from '@multiversx/sdk-core/out/transaction';
export declare class WebviewProvider {
    constructor();
    logout(): Promise<unknown>;
    signMessage(message: string): Promise<string>;
    signTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
}
