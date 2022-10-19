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

export const defaultApiEndpoint = 'https://devnet-api.elrond.com';

export const DEFAULT_MIN_GAS_LIMIT = 50_000;

export const DAPP_CONFIG_ENDPOINT = '/dapp/config';
export const DAPP_INIT_ROUTE = '/dapp/init';

export const defaultChainTypeConfig = 'devnet';

export const walletConnectDeepLink =
  'https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://maiar.com/';
export const walletConnectBridgeAddresses = [
  'https://bridge.walletconnect.org',
];
export const walletConnectV2RelayAddresses = ['wss://relay.walletconnect.com'];

export const networkConfig: Record<string, NetworkType> = {
  devnet: {
    id: 'devnet',
    shortId: 'D',
    name: 'Devnet',
    egldLabel: 'xEGLD',
    egldDenomination: '18',
    decimals: '4',
    gasPerDataByte: '1500',
    walletAddress: 'https://devnet-wallet.elrond.com',
    apiAddress: 'https://devnet-api.elrond.com',
    explorerAddress: 'https://devnet-explorer.elrond.com',
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
    walletAddress: 'https://testnet-wallet.elrond.com',
    apiAddress: 'https://testnet-api.elrond.com',
    explorerAddress: 'https://testnet-explorer.elrond.com',
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
    walletAddress: 'https://wallet.elrond.com',
    apiAddress: 'https://api.elrond.com',
    explorerAddress: 'https://explorer.elrond.com',
    apiTimeout: 10000,
  },
};
