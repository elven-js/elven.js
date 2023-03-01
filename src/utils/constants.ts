interface NetworkType {
  id: string;
  shortId: string;
  name: string;
  egldLabel: string;
  egldDenomination: string;
  decimals: string;
  gasPerDataByte: string;
  walletAddress: string;
  apiAddress: string;
  explorerAddress: string;
  apiTimeout: number;
}

export const LOCAL_STORAGE_KEY = 'elvenjs_state';

export const defaultApiEndpoint = 'https://devnet-api.multiversx.com';

export const DEFAULT_MIN_GAS_LIMIT = 50_000;

export const DAPP_CONFIG_ENDPOINT = '/dapp/config';
export const DAPP_INIT_ROUTE = '/dapp/init';

export const defaultChainTypeConfig = 'devnet';

export const walletConnectDeepLink =
  'https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://xportal.com/';

export const defaultWalletConnectV2RelayAddresses = [
  'wss://relay.walletconnect.com',
];

export const networkConfig: Record<string, NetworkType> = {
  devnet: {
    id: 'devnet',
    shortId: 'D',
    name: 'Devnet',
    egldLabel: 'xEGLD',
    egldDenomination: '18',
    decimals: '4',
    gasPerDataByte: '1500',
    walletAddress: 'https://devnet-wallet.multiversx.com',
    apiAddress: 'https://devnet-api.multiversx.com',
    explorerAddress: 'https://devnet-explorer.multiversx.com',
    apiTimeout: 10000,
  },
  testnet: {
    id: 'testnet',
    shortId: 'T',
    name: 'Testnet',
    egldLabel: 'xEGLD',
    egldDenomination: '18',
    decimals: '4',
    gasPerDataByte: '1500',
    walletAddress: 'https://testnet-wallet.multiversx.com',
    apiAddress: 'https://testnet-api.multiversx.com',
    explorerAddress: 'https://testnet-explorer.multiversx.com',
    apiTimeout: 10000,
  },
  mainnet: {
    id: 'mainnet',
    shortId: '1',
    name: 'Mainnet',
    egldLabel: 'EGLD',
    egldDenomination: '18',
    decimals: '4',
    gasPerDataByte: '1500',
    walletAddress: 'https://wallet.multiversx.com',
    apiAddress: 'https://api.multiversx.com',
    explorerAddress: 'https://explorer.multiversx.com',
    apiTimeout: 10000,
  },
};
