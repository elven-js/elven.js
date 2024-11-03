import {
  SessionEventTypes,
  WalletConnectV2Provider,
} from './walletconnect-signing';
import { getRandomAddressFromNetwork } from './utils';

export const initMobileProvider = async (
  elven: any,
  logout: any,
  networkConfig: any,
  Message: any,
  Transaction: any,
  TransactionsConverter: any,
  walletConnectV2ProjectId: string,
  walletConnectV2RelayAddresses: string[]
) => {
  if (!walletConnectV2ProjectId || !elven.initOptions.chainType) {
    return undefined;
  }

  const providerHandlers = {
    onClientLogin: () => {},
    onClientLogout: () => logout(elven),
    onClientEvent: (event: SessionEventTypes['event']) => {
      console.log('wc2 session event: ', event);
    },
  };

  const relayAddress = getRandomAddressFromNetwork(
    walletConnectV2RelayAddresses
  );

  const dappProviderInstance = new WalletConnectV2Provider(
    providerHandlers,
    networkConfig[elven.initOptions.chainType].shortId,
    relayAddress,
    walletConnectV2ProjectId,
    Message,
    Transaction,
    TransactionsConverter
  );

  try {
    await dappProviderInstance.init();
    return dappProviderInstance;
  } catch {
    console.warn("Can't initialize the Dapp Provider!");
  }
};
