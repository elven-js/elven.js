import { errorParse } from '../utils/error-parse';
import { qrCodeBuilder } from './qr-code-builder';
import {
  walletConnectV2RelayAddresses,
  networkConfig,
} from '../utils/constants';
import { getRandomAddressFromNetwork } from '../utils/get-random-address-from-network';
import {
  WalletConnectProviderV2,
  SessionEventTypes,
} from '@elrondnetwork/erdjs-wallet-connect-provider';
import { LoginMethodsEnum } from '../types';
import { ls } from '../utils/ls-helpers';
import { logout } from './logout';
import { getNewLoginExpiresTimestamp } from './expires-at';
import { accountSync } from './account-sync';
import { EventsStore } from '../events-store';
import { DappCoreWCV2CustomMethodsEnum } from '../types';

export const loginWithMobile = async (
  elven: any,
  qrCodeContainer?: string | HTMLElement,
  token?: string
) => {
  if (!qrCodeContainer) {
    throw new Error(
      "You haven't provided the QR code container DOM element id"
    );
  }

  const relayAddress = getRandomAddressFromNetwork(
    walletConnectV2RelayAddresses
  );

  if (!relayAddress || !elven.networkProvider) {
    throw new Error(
      "Something wen't wrong with the initialization (ApiNetworkProvider or Wallet Connect Bridge address), plese try to refresh the page!"
    );
  }

  if (!elven.initOptions.walletConnectV2ProjectId) {
    throw new Error(
      'Please provide your WalletConnect project id. You can get it here: https://cloud.walletconnect.com)'
    );
  }

  if (!elven.initOptions.chainType) {
    throw new Error('Please provide the chain type in ElvenJS.init function!');
  }

  let qrCodeElement: HTMLElement | null;

  const providerHandlers = {
    onClientLogin: async () => {
      if (elven.dappProvider instanceof WalletConnectProviderV2) {
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
      if (elven.dappProvider instanceof WalletConnectProviderV2) {
        await logout(elven);
        EventsStore.run('onLogout');
      }
    },
    onClientEvent: (event: SessionEventTypes['event']) => {
      console.log('wc2 session event: ', event);
    },
  };

  const dappProvider = new WalletConnectProviderV2(
    providerHandlers,
    networkConfig[elven.initOptions.chainType].shortId,
    relayAddress,
    elven.initOptions.walletConnectV2ProjectId
  );

  try {
    if (dappProvider) {
      elven.dappProvider = dappProvider;

      const { uri: walletConnectUri, approval } = await dappProvider.connect({
        methods: [DappCoreWCV2CustomMethodsEnum.erd_cancelAction],
      });

      const wCUri = token
        ? `${walletConnectUri}&token=${token}`
        : walletConnectUri;

      if (qrCodeContainer && walletConnectUri && wCUri) {
        qrCodeElement = await qrCodeBuilder(qrCodeContainer, wCUri);
      }

      await dappProvider.login({
        approval,
        token,
      });

      return dappProvider;
    }
  } catch (e) {
    const err = errorParse(e);
    console.warn(`Something went wrong trying to login the user: ${err}`);
  }
};
