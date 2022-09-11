import { errorParse } from '../utils/errorParse';
import { qrCodeBuilder } from './qr-code-builder';
import { networkConfig, chainTypeConfig } from '../utils/constants';
import { getBridgeAddressFromNetwork } from './init-maiar-mobile-provider';
import { WalletConnectProvider } from '@elrondnetwork/erdjs-wallet-connect-provider';
import { LoginMethodsEnum } from '../types';
import { ls } from '../utils/ls-helpers';
import { logout } from './logout';
import { getNewLoginExpiresTimestamp } from './expires-at';
import { accountSync } from './account-sync';
import { EventsStore } from '../events-store';

export const loginWithMobile = async (
  elven: any,
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

  if (!bridgeAddress || !elven.networkProvider) {
    throw Error(
      "Something wen't wrong with the initialization (ApiNetworkProvider or Wallet Connect Bridge address), plese try to refresh the page!"
    );
  }

  let qrCodeElement: HTMLElement | null;

  const providerHandlers = {
    onClientLogin: async () => {
      if (elven.dappProvider instanceof WalletConnectProvider) {
        EventsStore.run('onLoginPending');
        const address = await elven.dappProvider.getAddress();
        const signature = await elven.dappProvider.getSignature();

        ls.set('address', address);
        ls.set('loginMethod', LoginMethodsEnum.maiarMobile);
        ls.set('expires', getNewLoginExpiresTimestamp());

        await accountSync(elven);

        if (signature) {
          ls.set('signature', signature);
        }
        if (token) {
          ls.set('loginToken', token);
        }

        EventsStore.run('onLoggedIn');
        qrCodeElement?.replaceChildren();
      }
    },
    onClientLogout: async () => {
      if (elven.dappProvider instanceof WalletConnectProvider) {
        await logout(elven);
        EventsStore.run('onLogout');
      }
    },
  };

  const dappProvider = new WalletConnectProvider(
    bridgeAddress,
    providerHandlers
  );

  try {
    if (dappProvider) {
      const walletConnectUri: string | undefined = await dappProvider.login();

      const wCUri = token
        ? `${walletConnectUri}&token=${token}`
        : walletConnectUri;

      if (qrCodeContainerId && walletConnectUri) {
        qrCodeElement = await qrCodeBuilder(qrCodeContainerId, wCUri);
      }

      return dappProvider;
    }
  } catch (e) {
    const err = errorParse(e);
    console.warn(`Something went wrong trying to login the user: ${err}`);
  }
};
