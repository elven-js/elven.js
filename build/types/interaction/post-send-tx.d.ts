import { Transaction } from '@multiversx/sdk-core/out/transaction';
import { ApiNetworkProvider } from '../network-provider';
export declare const postSendTx: (transaction: Transaction, networkProvider: ApiNetworkProvider) => Promise<void>;
