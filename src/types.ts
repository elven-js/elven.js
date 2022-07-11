import { ExtensionProvider } from '@elrondnetwork/erdjs-extension-provider';
import { WalletConnectProvider } from '@elrondnetwork/erdjs-wallet-connect-provider';

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
