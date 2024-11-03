import { ExtensionProvider } from './core/browser-extension-signing';
import { Transaction } from './core/transaction';
import { WalletConnectV2Provider } from './core/walletconnect-signing';
import { WalletProvider } from './core/web-wallet-signing';
import { WebviewProvider } from './core/webview-signing';
import {
  SmartContractQueryArgs,
  SmartContractQueryResponse,
} from './core/network-provider';

export interface InitOptions {
  apiUrl?: string;
  chainType?: string;
  apiTimeout?: number;
  walletConnectV2ProjectId?: string;
  walletConnectV2RelayAddresses?: string[];
  // Login
  onLoginStart?: () => void;
  onLoginSuccess?: () => void;
  onLoginFailure?: (error: string) => void;
  // Logout
  onLogoutStart?: () => void;
  onLogoutSuccess?: () => void;
  onLogoutFailure?: (error: string) => void;
  // Qr
  onQrPending?: () => void;
  onQrLoaded?: () => void;
  // Transaction
  onTxStart?: (transaction: Transaction) => void;
  onTxSent?: (transaction: Transaction) => void;
  onTxFinalized?: (transaction: Transaction) => void;
  onTxFailure?: (transaction: Transaction, error: string) => void;
  // Signing
  onSignMsgStart?: (message: string) => void;
  onSignMsgFinalized?: (messageSignature: string) => void;
  onSignMsgFailure?: (message: string, error: string) => void;
  // Query
  onQueryStart?: (queryArgs: SmartContractQueryArgs) => void;
  onQueryFinalized?: (queryResponse: SmartContractQueryResponse) => void;
  onQueryFailure?: (queryArgs: SmartContractQueryArgs, error: string) => void;
}

export enum EventStoreEvents {
  // Login
  onLoginStart = 'onLoginStart',
  onLoginSuccess = 'onLoginSuccess',
  onLoginFailure = 'onLoginFailure',
  // Logout
  onLogoutStart = 'onLogoutStart',
  onLogoutSuccess = 'onLogoutSuccess',
  onLogoutFailure = 'onLogoutFailure',
  // Qr
  onQrPending = 'onQrPending',
  onQrLoaded = 'onQrLoaded',
  // Transaction
  onTxStart = 'onTxStart',
  onTxSent = 'onTxSent',
  onTxFinalized = 'onTxFinalized',
  onTxFailure = 'onTxFailure',
  // Signing
  onSignMsgStart = 'onSignMsgStart',
  onSignMsgFinalized = 'onSignMsgFinalized',
  onSignMsgFailure = 'onSignMsgFailure',
  // Query
  onQueryStart = 'onQueryStart',
  onQueryFinalized = 'onQueryFinalized',
  onQueryFailure = 'onQueryFailure',
}

export enum LoginMethodsEnum {
  ledger = 'ledger',
  mobile = 'mobile',
  webWallet = 'web-wallet',
  browserExtension = 'browser-extension',
  xAlias = 'x-alias',
  webview = 'webview',
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