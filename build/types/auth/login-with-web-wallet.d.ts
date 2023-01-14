import { WalletProvider } from '@multiversx/sdk-web-wallet-provider/out';
export declare const loginWithWebWallet: (webWalletAddress: string, callbackRoute?: string, token?: string) => Promise<WalletProvider | undefined>;
