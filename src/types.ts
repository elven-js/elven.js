import { ExtensionProvider } from '@elrondnetwork/erdjs-extension-provider';
import { Transaction } from '@elrondnetwork/erdjs/out/transaction';
import { WalletConnectProvider } from '@elrondnetwork/erdjs-wallet-connect-provider';
import { WalletProvider } from '@elrondnetwork/erdjs-web-wallet-provider/out';

export interface InitOptions {
  apiUrl?: string;
  chainType?: string;
  apiTimeout?: number;
  walletConnectBridgeAddresses?: string[];
  onLoginPending?: () => void;
  onLoggedIn?: () => void;
  onLogout?: () => void;
  onTxStarted?: (transaction: Transaction) => void;
  onTxSent?: (transaction: Transaction) => void;
  onTxFinalized?: (transaction: Transaction) => void;
  onTxError?: (transaction: Transaction, error: string) => void;
}

export enum LoginMethodsEnum {
  ledger = 'ledger',
  maiarMobile = 'maiar-mobile',
  webWallet = 'web-wallet',
  maiarBrowserExtension = 'maiar-browser-extension',
}

export type DappProvider =
  | ExtensionProvider
  | WalletConnectProvider
  | WalletProvider
  | undefined;

export interface LoginOptions {
  qrCodeContainer?: string | HTMLElement;
  token?: string;
  callbackRoute?: string;
}
