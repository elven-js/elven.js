import { WalletProvider } from '@multiversx/sdk-web-wallet-provider/out/walletProvider';
export declare const loginWithWebWallet: (urlAddress: string, loginToken: string, chainType: string, callbackRoute?: string) => Promise<WalletProvider | undefined>;
