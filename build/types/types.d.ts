import { ExtensionProvider } from '@multiversx/sdk-extension-provider';
import { Transaction } from '@multiversx/sdk-core/out/transaction';
import { WalletConnectProvider } from '@multiversx/sdk-wallet-connect-provider';
import { WalletProvider } from '@multiversx/sdk-web-wallet-provider/out';
export interface InitOptions {
    apiUrl?: string;
    chainType?: string;
    apiTimeout?: number;
    walletConnectBridgeAddresses?: string[];
    onLoginPending?: () => void;
    onLoggedIn?: () => void;
    onLogout?: () => void;
    onTxStarted?: (transaction: Transaction) => void;
    onTxSent?: (transaction: Transaction) => void;
    onTxFinalized?: (transaction: Transaction) => void;
    onTxError?: (transaction: Transaction, error: string) => void;
}
export declare enum LoginMethodsEnum {
    ledger = "ledger",
    mobile = "mobile",
    webWallet = "web-wallet",
    browserExtension = "browser-extension"
}
export type DappProvider = ExtensionProvider | WalletConnectProvider | WalletProvider | undefined;
export interface LoginOptions {
    qrCodeContainer?: string | HTMLElement;
    token?: string;
    callbackRoute?: string;
}
