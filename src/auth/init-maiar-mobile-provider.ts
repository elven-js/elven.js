import { WalletConnectProvider } from '@elrondnetwork/erdjs-wallet-connect-provider';
import { walletConnectBridgeAddresses } from '../utils/constants';
import { logout } from './logout';
import { accountSync } from './account-sync';
import { EventsStore } from '../events-store';

export function getBridgeAddressFromNetwork(
  walletConnectBridgeAddresses: string[]
) {
  return walletConnectBridgeAddresses[
    Math.floor(Math.random() * walletConnectBridgeAddresses.length)
  ];
}

export const initMaiarMobileProvider = async (elven: any) => {
  const providerHandlers = {
    onClientLogin: () => {
      accountSync(elven), EventsStore.run('onLoggedIn');
    },
    onClientLogout: () => logout(elven),
  };

  const bridgeAddress = getBridgeAddressFromNetwork(
    walletConnectBridgeAddresses
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
