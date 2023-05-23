import { WalletProvider } from '@multiversx/sdk-web-wallet-provider/out/walletProvider';
export declare const loginWithWebWallet: (webWalletAddress: string, loginToken: string, callbackRoute?: string) => Promise<WalletProvider | undefined>;
