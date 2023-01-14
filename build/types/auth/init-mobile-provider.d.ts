import { WalletConnectProvider } from '@multiversx/sdk-wallet-connect-provider';
export declare function getBridgeAddressFromNetwork(wcBridgeAddresses: string[]): string;
export declare const initMobileProvider: (elven: any) => Promise<WalletConnectProvider | undefined>;
