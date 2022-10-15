import { ExtensionProvider } from '@elrondnetwork/erdjs-extension-provider';
import { WalletConnectProvider } from '@elrondnetwork/erdjs-wallet-connect-provider';
import { WalletProvider } from '@elrondnetwork/erdjs-web-wallet-provider/out';
export interface InitOptions {
    apiUrl: string;
    chainType: string;
    apiTimeout: number;
    onLoginPending?: () => void;
    onLoggedIn?: () => void;
    onLogout?: () => void;
}
export declare enum LoginMethodsEnum {
    ledger = "ledger",
    maiarMobile = "maiar-mobile",
    webWallet = "web-wallet",
    maiarBrowserExtension = "maiar-browser-extension"
}
export declare type DappProvider = ExtensionProvider | WalletConnectProvider | WalletProvider | undefined;
export interface LoginOptions {
    qrCodeContainer?: string | HTMLElement;
    token?: string;
    callbackRoute?: string;
}
