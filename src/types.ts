import { ExtensionProvider } from '@multiversx/sdk-extension-provider/out/extensionProvider';
import { Transaction } from '@multiversx/sdk-core/out/transaction';
import { WalletConnectV2Provider } from '@multiversx/sdk-wallet-connect-provider/out/walletConnectV2Provider';
import { WalletProvider } from '@multiversx/sdk-web-wallet-provider/out/walletProvider';
import { WebviewProvider } from './webview-provider/webview-provider';

export interface InitOptions {
  apiUrl?: string;
  chainType?: string;
  apiTimeout?: number;
  walletConnectV2ProjectId?: string;
  walletConnectV2RelayAddresses?: string[];
  // Login
  onLoginStart?: () => void;
  onLoginEnd?: () => void;
  onLoginSuccess?: () => void;
  onLoginFailure?: () => void;
  // Logout
  onLogoutStart?: () => void;
  onLogoutEnd?: () => void;
  onLogoutSuccess?: () => void;
  onLogoutFailure?: () => void;
  // Qr
  onQrPending?: () => void;
  onQrLoaded?: () => void;
  // Transaction
  onTxStarted?: (transaction: Transaction) => void;
  onTxSent?: (transaction: Transaction) => void;
  onTxFinalized?: (transaction: Transaction) => void;
  onTxError?: (transaction: Transaction, error: string) => void;
  // Signing
  onSignMsgStarted?: (message: string) => void;
  onSignMsgFinalized?: (messageSignature: string) => void;
  onSignMsgError?: (message: string, error: string) => void;
}

export enum EventStoreEvents {
  // Login
  onLoginStart = 'onLoginStart',
  onLoginEnd = 'onLoginEnd',
  onLoginSuccess = 'onLoginSuccess',
  onLoginFailure = 'onLoginFailure',
  // Logout
  onLogoutStart = 'onLogoutStart',
  onLogoutEnd = 'onLogoutEnd',
  onLogoutSuccess = 'onLogoutSuccess',
  onLogoutFailure = 'onLogoutFailure',
  // Qr
  onQrPending = 'onQrPending',
  onQrLoaded = 'onQrLoaded',
  // Transaction
  onTxStarted = 'onTxStarted',
  onTxSent = 'onTxSent',
  onTxFinalized = 'onTxFinalized',
  onTxError = 'onTxError',
  // Signing
  onSignMsgStarted = 'onSignMsgStarted',
  onSignMsgFinalized = 'onSignMsgFinalized',
  onSignMsgError = 'onSignMsgError',
}

export enum LoginMethodsEnum {
  ledger = 'ledger',
  mobile = 'mobile',
  webWallet = 'web-wallet',
  browserExtension = 'browser-extension',
  xAlias = 'x-alias',
  xPortalHub = 'x-portal-hub',
}

export type DappProvider =
  | ExtensionProvider
  | WalletConnectV2Provider
  | WalletProvider
  | WebviewProvider
  | undefined;

export interface LoginOptions {
  qrCodeContainer?: string | HTMLElement;
  callbackRoute?: string;
}

export enum DappCoreWCV2CustomMethodsEnum {
  mvx_cancelAction = 'mvx_cancelAction',
  mvx_signNativeAuthToken = 'mvx_signNativeAuthToken',
}

export enum WebWalletUrlParamsEnum {
  hasWebWalletGuardianSign = 'hasWebWalletGuardianSign',
}
