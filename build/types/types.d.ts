import { ExtensionProvider } from '@elrondnetwork/erdjs-extension-provider/out/extensionProvider';
import { Transaction } from '@elrondnetwork/erdjs/out/transaction';
import { WalletConnectV2Provider } from '@elrondnetwork/erdjs-wallet-connect-provider/out/walletConnectV2Provider';
import { WalletProvider } from '@elrondnetwork/erdjs-web-wallet-provider/out/walletProvider';
export interface InitOptions {
    apiUrl: string;
    chainType: string;
    apiTimeout: number;
    walletConnectV2ProjectId?: string;
    onLoginPending?: () => void;
    onLoggedIn?: () => void;
    onLogout?: () => void;
    onTxStarted?: (transaction: Transaction) => void;
    onTxFinalized?: (transaction: Transaction) => void;
}
export declare enum LoginMethodsEnum {
    ledger = "ledger",
    maiarMobile = "maiar-mobile",
    webWallet = "web-wallet",
    maiarBrowserExtension = "maiar-browser-extension"
}
export declare type DappProvider = ExtensionProvider | WalletConnectV2Provider | WalletProvider | undefined;
export interface LoginOptions {
    qrCodeContainer?: string | HTMLElement;
    token?: string;
    callbackRoute?: string;
}
export declare enum DappCoreWCV2CustomMethodsEnum {
    erd_cancelAction = "erd_cancelAction"
}
