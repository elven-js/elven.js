import { WalletProvider } from '@multiversx/sdk-web-wallet-provider/out/walletProvider';
import { EventStoreEvents, LoginMethodsEnum } from '../types';
import { DAPP_INIT_ROUTE, networkConfig } from '../utils/constants';
import { errorParse } from '../utils/error-parse';
import { ls } from '../utils/ls-helpers';
import { getNewLoginExpiresTimestamp } from './expires-at';
import { EventsStore } from '../events-store';

export const loginWithWebWallet = async (
  urlAddress: string,
  loginToken: string,
  chainType: string,
  callbackRoute?: string
) => {
  const dappProvider = new WalletProvider(`${urlAddress}${DAPP_INIT_ROUTE}`);

  const callbackUrl: string =
    typeof window !== 'undefined'
      ? encodeURIComponent(`${window.location.origin}${callbackRoute || '/'}`)
      : '/';
  const providerLoginData = {
    callbackUrl,
    token: loginToken,
  };

  try {
    ls.set(
      'loginMethod',
      networkConfig[chainType].xAliasAddress === urlAddress
        ? LoginMethodsEnum.xAlias
        : LoginMethodsEnum.webWallet
    );
    await dappProvider.login(providerLoginData);
    ls.set('expires', getNewLoginExpiresTimestamp());
    ls.set('loginToken', loginToken);
    return dappProvider;
  } catch (e) {
    const err = errorParse(e);
    console.warn(`Something went wrong trying to login the user: ${err}`);
    ls.set('loginMethod', '');
    EventsStore.run(EventStoreEvents.onLoginFailure, err);
  }
};
