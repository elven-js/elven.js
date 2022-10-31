import { WalletConnectProvider } from '@elrondnetwork/erdjs-wallet-connect-provider';
export declare function getBridgeAddressFromNetwork(wcBridgeAddresses: string[]): string;
export declare const initMaiarMobileProvider: (elven: any) => Promise<WalletConnectProvider | undefined>;
