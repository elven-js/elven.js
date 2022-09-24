import { ExtensionProvider } from '@elrondnetwork/erdjs-extension-provider';
import { WalletConnectProvider } from '@elrondnetwork/erdjs-wallet-connect-provider';

export interface InitOptions {
  apiUrl: string;
  chainType: string;
  apiTimeout: number;
  onLoginPending?: () => void;
  onLoggedIn?: () => void;
  onLogout?: () => void;
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
  | undefined;

export interface LoginOptions {
  qrCodeContainer?: string | HTMLElement;
  token?: string;
}
