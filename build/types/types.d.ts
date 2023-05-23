import { ExtensionProvider } from '@multiversx/sdk-extension-provider/out/extensionProvider';
import { Transaction } from '@multiversx/sdk-core/out/transaction';
import { WalletConnectV2Provider } from '@multiversx/sdk-wallet-connect-provider/out/walletConnectV2Provider';
import { WalletProvider } from '@multiversx/sdk-web-wallet-provider/out/walletProvider';
export interface InitOptions {
    apiUrl?: string;
    chainType?: string;
    apiTimeout?: number;
    walletConnectV2ProjectId?: string;
    walletConnectV2RelayAddresses?: string[];
    onLoginPending?: () => void;
    onLoggedIn?: () => void;
    onLogout?: () => void;
    onQrPending?: () => void;
    onQrLoaded?: () => void;
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
export type DappProvider = ExtensionProvider | WalletConnectV2Provider | WalletProvider | undefined;
export interface LoginOptions {
    qrCodeContainer?: string | HTMLElement;
    callbackRoute?: string;
}
export declare enum DappCoreWCV2CustomMethodsEnum {
    mvx_cancelAction = "mvx_cancelAction"
}
export declare enum EventStoreEvents {
    onLoginPending = "onLoginPending",
    onLoggedIn = "onLoggedIn",
    onQrPending = "onQrPending",
    onQrLoaded = "onQrLoaded",
    onLogout = "onLogout",
    onTxStarted = "onTxStarted",
    onTxSent = "onTxSent",
    onTxFinalized = "onTxFinalized",
    onTxError = "onTxError"
}
