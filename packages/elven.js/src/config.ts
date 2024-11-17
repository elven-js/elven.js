import { ApiNetworkProvider } from './core/network-provider';
import { DappProvider, InitOptions, MobileSigningProvider } from './types';

export interface ElvenConfig {
  initOptions?: InitOptions;
  dappProvider?: DappProvider;
  networkProvider?: ApiNetworkProvider;
  mobileProvider?: MobileSigningProvider;
}

export const config: ElvenConfig = {
  initOptions: undefined,
  dappProvider: undefined,
  networkProvider: undefined,
  mobileProvider: undefined,
};

export const resetConfig = () => {
  config.initOptions = undefined;
  config.dappProvider = undefined;
  config.networkProvider = undefined;
  config.mobileProvider = undefined;
};
