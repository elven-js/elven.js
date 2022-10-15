import { WalletProvider } from '@elrondnetwork/erdjs-web-wallet-provider';
export declare const loginWithWebWallet: (webWalletAddress: string, callbackRoute?: string, token?: string) => Promise<WalletProvider | undefined>;
