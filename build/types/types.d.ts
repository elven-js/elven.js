import { ExtensionProvider } from '@elrondnetwork/erdjs-extension-provider/out/extensionProvider';
import { Transaction } from '@elrondnetwork/erdjs/out/transaction';
import { WalletConnectV2Provider } from '@elrondnetwork/erdjs-wallet-connect-provider/out/walletConnectV2Provider';
import { WalletProvider } from '@elrondnetwork/erdjs-web-wallet-provider/out/walletProvider';
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
    maiarMobile = "maiar-mobile",
    webWallet = "web-wallet",
    maiarBrowserExtension = "maiar-browser-extension"
}
export type DappProvider = ExtensionProvider | WalletConnectV2Provider | WalletProvider | undefined;
export interface LoginOptions {
    qrCodeContainer?: string | HTMLElement;
    token?: string;
    callbackRoute?: string;
}
export declare enum DappCoreWCV2CustomMethodsEnum {
    erd_cancelAction = "erd_cancelAction"
}
export declare enum EventStoreEvents {
    onLoginPending = 0,
    onLoggedIn = 1,
    onQrPending = 2,
    onQrLoaded = 3,
    onLogout = 4,
    onTxStarted = 5,
    onTxSent = 6,
    onTxFinalized = 7,
    onTxError = 8
}
