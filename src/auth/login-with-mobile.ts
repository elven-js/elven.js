import { Address } from '@elrondnetwork/erdjs/out/address';
import { Account } from '@elrondnetwork/erdjs/out/account';
import { errorParse } from '../utils/errorParse';
import { qrCodeBuilder } from '../auth/qr-code-builder';
import { networkConfig, chainTypeConfig } from '../utils/constants';
import { ApiNetworkProvider } from '../network-provider';
import {
  getBridgeAddressFromNetwork,
  WcOnLogin,
} from '../auth/init-maiar-mobile-provider';
import { WalletConnectProvider } from '@elrondnetwork/erdjs-wallet-connect-provider';
import { DappProvider } from '../types';
import { ls } from '../utils/ls-helpers';
import { logout } from '../auth/logout';
import { getNewLoginExpiresTimestamp } from '../auth/expires-at';

export const loginWithMobile = async (
  dappProvider: DappProvider,
  networkProvider: ApiNetworkProvider,
  qrCodeContainerId?: string,
  token?: string
) => {
  if (!qrCodeContainerId) {
    throw new Error(
      "You haven't provided the QR code container DOM element id"
    );
  }

  const bridgeAddress = getBridgeAddressFromNetwork(
    networkConfig[chainTypeConfig].walletConnectBridgeAddresses
  );

  if (!bridgeAddress || !networkProvider) {
    throw Error(
      "Something wen't wrong with the initialization (ApiNetworkProvider or Wallet Connect Bridge address), plese try to refresh the page!"
    );
  }

  const providerHandlers = {
    onClientLogin: async () => {
      if (dappProvider instanceof WalletConnectProvider) {
        const address = await dappProvider.getAddress();
        const signature = await dappProvider.getSignature();
        const account = new Account(new Address(address));

        // TODO: sync doesn't work, fix it
        ls.set('address', address);
        ls.set('nonce', account.nonce.valueOf());
        ls.set('balance', account.balance.toString());
        ls.set('expires', getNewLoginExpiresTimestamp().toString());

        if (signature) {
          ls.set('signature', signature);
        }
        if (token) {
          ls.set('loginToken', token);
        }

        WcOnLogin(networkProvider, dappProvider);
      }
    },
    onClientLogout: async () => await logout(dappProvider),
  };

  dappProvider = new WalletConnectProvider(bridgeAddress, providerHandlers);

  try {
    if (dappProvider) {
      const walletConnectUri: string | undefined = await dappProvider.login();

      qrCodeContainerId && qrCodeBuilder(qrCodeContainerId, walletConnectUri);

      const address = await dappProvider.getAddress();

      return {
        dappProvider,
        address,
      };
    }
  } catch (e) {
    const err = errorParse(e);
    console.warn(`Something went wrong trying to login the user: ${err}`);
  }
};
