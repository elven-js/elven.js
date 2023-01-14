import { WalletConnectProvider } from '@multiversx/sdk-wallet-connect-provider';
import { logout } from './logout';
import { accountSync } from './account-sync';
import { EventsStore } from '../events-store';

export function getBridgeAddressFromNetwork(wcBridgeAddresses: string[]) {
  return wcBridgeAddresses[
    Math.floor(Math.random() * wcBridgeAddresses.length)
  ];
}

export const initMobileProvider = async (elven: any) => {
  const providerHandlers = {
    onClientLogin: () => {
      accountSync(elven), EventsStore.run('onLoggedIn');
    },
    onClientLogout: () => logout(elven),
  };

  const bridgeAddress = getBridgeAddressFromNetwork(
    elven.initOptions.walletConnectBridgeAddresses
  );

  const dappProviderInstance = new WalletConnectProvider(
    bridgeAddress,
    providerHandlers
  );

  try {
    await dappProviderInstance.init();
    return dappProviderInstance;
  } catch {
    console.warn("Can't initialize the Dapp Provider!");
  }
};
