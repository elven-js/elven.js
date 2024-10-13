import { ExtensionProvider } from '@multiversx/sdk-extension-provider/out/extensionProvider';
import { Transaction } from '@multiversx/sdk-core/out/transaction';
import { WalletConnectV2Provider } from '@multiversx/sdk-wallet-connect-provider/out/walletConnectV2Provider';
import { WalletProvider } from '@multiversx/sdk-web-wallet-provider/out/walletProvider';
import { WebviewProvider } from '@multiversx/sdk-webview-provider';
import { QueryArguments } from '@multiversx/sdk-core/out/smartcontracts';
import { ContractQueryResponse } from '@multiversx/sdk-core/out/networkProviders/contractQueryResponse';
export interface InitOptions {
    apiUrl?: string;
    chainType?: string;
    apiTimeout?: number;
    walletConnectV2ProjectId?: string;
    walletConnectV2RelayAddresses?: string[];
    onLoginStart?: () => void;
    onLoginSuccess?: () => void;
    onLoginFailure?: (error: string) => void;
    onLogoutStart?: () => void;
    onLogoutSuccess?: () => void;
    onLogoutFailure?: (error: string) => void;
    onQrPending?: () => void;
    onQrLoaded?: () => void;
    onTxStart?: (transaction: Transaction) => void;
    onTxSent?: (transaction: Transaction) => void;
    onTxFinalized?: (transaction: Transaction) => void;
    onTxFailure?: (transaction: Transaction, error: string) => void;
    onSignMsgStart?: (message: string) => void;
    onSignMsgFinalized?: (messageSignature: string) => void;
    onSignMsgFailure?: (message: string, error: string) => void;
    onQueryStart?: (queryArgs: QueryArguments) => void;
    onQueryFinalized?: (queryResponse: ContractQueryResponse) => void;
    onQueryFailure?: (queryArgs: QueryArguments, error: string) => void;
}
export declare enum EventStoreEvents {
    onLoginStart = "onLoginStart",
    onLoginSuccess = "onLoginSuccess",
    onLoginFailure = "onLoginFailure",
    onLogoutStart = "onLogoutStart",
    onLogoutSuccess = "onLogoutSuccess",
    onLogoutFailure = "onLogoutFailure",
    onQrPending = "onQrPending",
    onQrLoaded = "onQrLoaded",
    onTxStart = "onTxStart",
    onTxSent = "onTxSent",
    onTxFinalized = "onTxFinalized",
    onTxFailure = "onTxFailure",
    onSignMsgStart = "onSignMsgStart",
    onSignMsgFinalized = "onSignMsgFinalized",
    onSignMsgFailure = "onSignMsgFailure",
    onQueryStart = "onQueryStart",
    onQueryFinalized = "onQueryFinalized",
    onQueryFailure = "onQueryFailure"
}
export declare enum LoginMethodsEnum {
    ledger = "ledger",
    mobile = "mobile",
    webWallet = "web-wallet",
    browserExtension = "browser-extension",
    xAlias = "x-alias",
    xPortalHub = "x-portal-hub"
}
export type DappProvider = ExtensionProvider | WalletConnectV2Provider | WalletProvider | WebviewProvider | undefined;
export interface LoginOptions {
    qrCodeContainer?: string | HTMLElement;
    callbackRoute?: string;
}
export declare enum DappCoreWCV2CustomMethodsEnum {
    mvx_cancelAction = "mvx_cancelAction",
    mvx_signNativeAuthToken = "mvx_signNativeAuthToken"
}
export declare enum WebWalletUrlParamsEnum {
    hasWebWalletGuardianSign = "hasWebWalletGuardianSign"
}
