import { ExtensionProvider } from '@elrondnetwork/erdjs-extension-provider';
import { WalletConnectProvider } from '@elrondnetwork/erdjs-wallet-connect-provider';
export declare enum LoginMethodsEnum {
    ledger = "ledger",
    maiarMobile = "maiar-mobile",
    webWallet = "web-wallet",
    maiarBrowserExtension = "maiar-browser-extension"
}
export declare type DappProvider = ExtensionProvider | WalletConnectProvider | undefined;
export interface LoginOptions {
    onWalletConnectLogin?: () => void;
    onWalletConnectLogout?: () => void;
    qrCodeContainerId?: string;
    token?: string;
}
