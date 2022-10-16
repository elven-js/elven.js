import { DappProvider } from '../types';
import { ApiNetworkProvider } from '../network-provider';
export declare const webWalletTxFinalize: (dappProvider: DappProvider, networkProvider: ApiNetworkProvider, nonce: number) => Promise<void>;
