import { WalletProvider } from '@elrondnetwork/erdjs-web-wallet-provider/out/walletProvider';
import { LoginMethodsEnum } from '../types';
import { DAPP_INIT_ROUTE } from '../utils/constants';
import { errorParse } from '../utils/error-parse';
import { ls } from '../utils/ls-helpers';
import { getNewLoginExpiresTimestamp } from './expires-at';
import { EventsStore } from '../events-store';

export const loginWithWebWallet = async (
  webWalletAddress: string,
  callbackRoute?: string,
  token?: string
) => {
  const dappProvider = new WalletProvider(
    `${webWalletAddress}${DAPP_INIT_ROUTE}`
  );

  const callbackUrl: string =
    typeof window !== 'undefined'
      ? encodeURIComponent(`${window.location.origin}${callbackRoute || '/'}`)
      : '/';
  const providerLoginData = {
    callbackUrl,
    ...(token ? { token } : {}),
  };

  try {
    EventsStore.run('onLoginPending');
    ls.set('loginMethod', LoginMethodsEnum.webWallet);
    await dappProvider.login(providerLoginData);
    ls.set('expires', getNewLoginExpiresTimestamp());
    if (token) {
      ls.set('loginToken', token);
    }
    return dappProvider;
  } catch (e) {
    const err = errorParse(e);
    console.warn(`Something went wrong trying to login the user: ${err}`);
    ls.set('loginMethod', '');
  }
};
