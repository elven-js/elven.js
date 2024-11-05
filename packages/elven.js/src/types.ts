import { ExtensionProvider } from './core/browser-extension-signing';
import { Transaction } from './core/transaction';
import { WalletProvider } from './core/web-wallet-signing';
import { WebviewProvider } from './core/webview-signing';
import {
  SmartContractQueryArgs,
  SmartContractQueryResponse,
} from './core/network-provider';
import { NativeAuthClient } from './core/native-auth-client';
import { Message } from './core/message';
import { TransactionsConverter } from './core/transaction-converter';
import { NetworkType } from './utils/constants';
import { LocalStorage } from './utils/ls-helpers';
import { EventsStore } from './events-store';

export interface MobileSigningProviderConfig {
  walletConnectV2ProjectId: string;
  walletConnectV2RelayAddresses: string[];
  qrCodeContainer: string | HTMLElement;
  onQrPending: () => void;
  onQrLoaded: () => void;
}

export interface WalletConnectV2Provider
  extends Omit<ExtensionProvider | WalletProvider | WebviewProvider, never> {
  signTransaction(transaction: Transaction): Promise<Transaction>;
}

export interface MobileSigningProvider {
  initMobileProvider: (elvenJS: any) => Promise<any>;
  loginWithMobile: (
    celvenJS: any,
    loginToken: string,
    nativeAuthClient: NativeAuthClient
  ) => Promise<any>;
  WalletConnectV2Provider: {
    new (...args: any[]): WalletConnectV2Provider;
  };
}

export type MobileSigningProviderDeps = {
  networkConfig: Record<string, NetworkType>;
  Message: typeof Message;
  Transaction: typeof Transaction;
  TransactionsConverter: typeof TransactionsConverter;
  ls: LocalStorage;
  logout: (instance: any) => Promise<boolean>;
  getNewLoginExpiresTimestamp: () => number;
  accountSync: (instance: any) => Promise<void>;
  EventsStore: typeof EventsStore;
};

export interface MobileProvider {
  new (
    config: MobileSigningProviderConfig,
    deps: MobileSigningProviderDeps
  ): MobileSigningProvider;
}

export interface InitOptions {
  apiUrl?: string;
  chainType?: string;
  apiTimeout?: number;
  externalSigningProviders?: {
    mobile?: {
      provider: MobileProvider;
      config: MobileSigningProviderConfig;
    };
  };
  // Login
  onLoginStart?: () => void;
  onLoginSuccess?: () => void;
  onLoginFailure?: (error: string) => void;
  // Logout
  onLogoutStart?: () => void;
  onLogoutSuccess?: () => void;
  onLogoutFailure?: (error: string) => void;
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
