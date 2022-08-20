import { WalletConnectProvider } from '@elrondnetwork/erdjs-wallet-connect-provider';
import { networkConfig, chainTypeConfig } from '../utils/constants';
import { logout } from './logout';
import { accountSync } from './account-sync';

export function getBridgeAddressFromNetwork(
  walletConnectBridgeAddresses: string[]
) {
  return walletConnectBridgeAddresses[
    Math.floor(Math.random() * walletConnectBridgeAddresses.length)
  ];
}

export const initMaiarMobileProvider = async (elven: any) => {
  const providerHandlers = {
    onClientLogin: () => accountSync(elven),
    onClientLogout: () => logout(elven),
  };

  const bridgeAddress = getBridgeAddressFromNetwork(
    networkConfig[chainTypeConfig].walletConnectBridgeAddresses
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
