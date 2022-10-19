import { ExtensionProvider } from '@elrondnetwork/erdjs-extension-provider';
import { Transaction } from '@elrondnetwork/erdjs/out/transaction';
import { WalletConnectProviderV2 } from '@elrondnetwork/erdjs-wallet-connect-provider';
import { WalletProvider } from '@elrondnetwork/erdjs-web-wallet-provider/out';

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

export enum LoginMethodsEnum {
  ledger = 'ledger',
  maiarMobile = 'maiar-mobile',
  webWallet = 'web-wallet',
  maiarBrowserExtension = 'maiar-browser-extension',
}

export type DappProvider =
  | ExtensionProvider
  | WalletConnectProviderV2
  | WalletProvider
  | undefined;

export interface LoginOptions {
  qrCodeContainer?: string | HTMLElement;
  token?: string;
  callbackRoute?: string;
}

export enum DappCoreWCV2CustomMethodsEnum {
  erd_cancelAction = 'erd_cancelAction',
}
