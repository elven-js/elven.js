import { ls } from '../utils/ls-helpers';
import { initExtensionProvider } from './init-extension-provider';
import { errorParse } from '../utils/error-parse';
import { EventStoreEvents, LoginMethodsEnum } from '../types';
import { getNewLoginExpiresTimestamp } from './expires-at';
import { accountSync } from './account-sync';
import { EventsStore } from '../events-store';
import { NativeAuthClient } from '@multiversx/sdk-native-auth-client/lib/src/native.auth.client';

export const loginWithExtension = async (
  elven: any,
  loginToken: string,
  nativeAuthClient: NativeAuthClient,
  callbackRoute = '/'
) => {
  const dappProvider = await initExtensionProvider();

  const callbackUrl: string = encodeURIComponent(
    `${window.location.origin}${callbackRoute}`
  );
  const providerLoginData = {
    callbackUrl,
    token: loginToken,
  };

  try {
    if (dappProvider) {
      const address = await dappProvider.login(providerLoginData);
      if (!address) {
        throw new Error('There were problems while logging in!');
      }
    }
  } catch (e) {
    const err = errorParse(e);
    throw new Error(err);
  }

  if (!dappProvider) {
    throw new Error('There were problems with auth provider initialization!');
  }

  const { signature } = dappProvider.account;

  ls.set('loginToken', loginToken);

  if (signature) {
    ls.set('signature', signature);
  }

  if (elven.networkProvider && signature) {
    try {
      const address = await dappProvider.getAddress();

      if (!address) {
        throw new Error('Canceled!');
      }

      ls.set('address', address);
      ls.set('loginMethod', LoginMethodsEnum.browserExtension);
      ls.set('expires', getNewLoginExpiresTimestamp());

      await accountSync(elven);

      const accessToken = nativeAuthClient.getToken(
        address,
        loginToken,
        signature
      );
      ls.set('accessToken', accessToken);

      EventsStore.run(EventStoreEvents.onLoginSuccess);

      return dappProvider;
    } catch (e: any) {
      throw new Error(
        `Something went wrong trying to synchronize the user account: ${e?.message}`
      );
    }
  }
};
