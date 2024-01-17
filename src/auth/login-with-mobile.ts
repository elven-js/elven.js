import { errorParse } from '../utils/error-parse';
import { qrCodeAndPairingsBuilder } from './qr-code-and-pairings-builder';
import { networkConfig } from '../utils/constants';
import { getRandomAddressFromNetwork } from '../utils/get-random-address-from-network';
import {
  WalletConnectV2Provider,
  SessionEventTypes,
} from '@multiversx/sdk-wallet-connect-provider/out/walletConnectV2Provider';
import { EventStoreEvents, LoginMethodsEnum } from '../types';
import { ls } from '../utils/ls-helpers';
import { logout } from './logout';
import { getNewLoginExpiresTimestamp } from './expires-at';
import { accountSync } from './account-sync';
import { EventsStore } from '../events-store';
import { DappCoreWCV2CustomMethodsEnum } from '../types';
import { NativeAuthClient } from '@multiversx/sdk-native-auth-client/lib/src/native.auth.client';

export const loginWithMobile = async (
  elven: any,
  loginToken: string,
  nativeAuthClient: NativeAuthClient,
  qrCodeContainer?: string | HTMLElement
) => {
  if (!qrCodeContainer) {
    throw new Error(
      "You haven't provided the QR code container DOM element id"
    );
  }

  const relayAddress = getRandomAddressFromNetwork(
    elven.initOptions.walletConnectV2RelayAddresses
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
      if (elven.dappProvider instanceof WalletConnectV2Provider) {
        EventsStore.run(EventStoreEvents.onLoginStart);
        const address = await elven.dappProvider.getAddress();
        const signature = await elven.dappProvider.getSignature();

        ls.set('address', address);
        ls.set('loginMethod', LoginMethodsEnum.mobile);
        ls.set('expires', getNewLoginExpiresTimestamp());

        await accountSync(elven);

        if (signature) {
          ls.set('signature', signature);
        }

        ls.set('loginToken', loginToken);

        const accessToken = nativeAuthClient.getToken(
          address,
          loginToken,
          signature
        );
        ls.set('accessToken', accessToken);

        EventsStore.run(EventStoreEvents.onLoginSuccess);
        qrCodeElement?.replaceChildren();
      }
    },
    onClientLogout: async () => {
      if (elven.dappProvider instanceof WalletConnectV2Provider) {
        await logout(elven);
      }
    },
    onClientEvent: (event: SessionEventTypes['event']) => {
      console.log('wc2 session event: ', event);
    },
  };

  const dappProvider = new WalletConnectV2Provider(
    providerHandlers,
    networkConfig[elven.initOptions.chainType].shortId,
    relayAddress,
    elven.initOptions.walletConnectV2ProjectId
  );

  try {
    if (dappProvider) {
      elven.dappProvider = dappProvider;

      EventsStore.run(EventStoreEvents.onQrPending);

      await dappProvider.init();

      const { uri: walletConnectUri, approval } = await dappProvider.connect({
        methods: [
          DappCoreWCV2CustomMethodsEnum.mvx_cancelAction,
          DappCoreWCV2CustomMethodsEnum.mvx_signNativeAuthToken,
        ],
      });

      const wCUri = loginToken
        ? `${walletConnectUri}&token=${loginToken}`
        : walletConnectUri;

      if (qrCodeContainer && wCUri) {
        qrCodeElement = await qrCodeAndPairingsBuilder(
          qrCodeContainer,
          wCUri,
          dappProvider,
          loginToken
        );

        EventsStore.run(EventStoreEvents.onQrLoaded);
      }

      await dappProvider.login({
        approval,
        token: loginToken,
      });

      return dappProvider;
    }
  } catch (e) {
    const err = errorParse(e);
    console.warn(`Something went wrong trying to login the user: ${err}`);
    EventsStore.run(EventStoreEvents.onLoginFailure);
  }
};
