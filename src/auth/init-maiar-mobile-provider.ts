import { WalletConnectProvider } from '@elrondnetwork/erdjs-wallet-connect-provider';
import { Address } from '@elrondnetwork/erdjs/out/address';
import { Account } from '@elrondnetwork/erdjs/out/account';
import { ls } from '../utils/ls-helpers';
import { networkConfig, chainTypeConfig } from '../utils/constants';
import { ApiNetworkProvider } from '../network-provider';
import { logout } from './logout';
import { DappProvider, LoginMethodsEnum } from '../types';
import { errorParse } from '../utils/errorParse';

export function getBridgeAddressFromNetwork(
  walletConnectBridgeAddresses: string[]
) {
  return walletConnectBridgeAddresses[
    Math.floor(Math.random() * walletConnectBridgeAddresses.length)
  ];
}

export const WcOnLogin = async (
  apiNetworkProvider?: ApiNetworkProvider,
  dappProvider?: DappProvider
) => {
  const address = await dappProvider?.getAddress();

  const userAddressInstance = new Address(address);
  const userAccountInstance = new Account(userAddressInstance);

  if (address && apiNetworkProvider) {
    try {
      const userAccountOnNetwork = await apiNetworkProvider.getAccount(
        userAddressInstance
      );
      userAccountInstance.update(userAccountOnNetwork);
      ls.set('address', userAccountInstance.address.bech32());
    } catch (e) {
      const err = errorParse(e);
      console.warn(
        `Something went wrong trying to synchronize the user account: ${err}`
      );
    }
  }

  ls.set('loginMethod', LoginMethodsEnum.maiarMobile);
};

export const initMaiarMobileProvider = async (
  networkProvider: ApiNetworkProvider,
  dappProvider: DappProvider
) => {
  const providerHandlers = {
    onClientLogin: () => WcOnLogin(networkProvider, dappProvider),
    onClientLogout: () => logout(dappProvider),
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
