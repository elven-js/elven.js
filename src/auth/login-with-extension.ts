import { ls } from '../utils/ls-helpers';
import { initExtensionProvider } from './init-extension-provider';
import { errorParse } from '../utils/errorParse';
import { LoginMethodsEnum } from '../types';
import { getNewLoginExpiresTimestamp } from './expires-at';
import { accountSync } from './account-sync';

declare global {
  interface Window {
    ElvenJS: any;
  }
}

export const loginWithExtension = async (token?: string) => {
  const dappProvider = await initExtensionProvider();

  try {
    if (dappProvider) await dappProvider.login();
  } catch (e) {
    const err = errorParse(e);
    console.warn(`Something went wrong trying to login the user: ${err}`);
  }

  if (!dappProvider) {
    throw new Error(
      'Error: There were problems with auth provider initialization!'
    );
  }

  const { signature } = dappProvider.account;

  if (token) {
    ls.set('loginToken', token);
  }

  if (signature) {
    ls.set('signature', signature);
  }

  if (window.ElvenJS.networkProvider) {
    try {
      const address = await dappProvider.getAddress();

      ls.set('address', address);
      ls.set('loginMethod', LoginMethodsEnum.maiarBrowserExtension);
      ls.set('expires', getNewLoginExpiresTimestamp());

      await accountSync();

      return dappProvider;
    } catch (e: any) {
      console.warn(
        `Something went wrong trying to synchronize the user account: ${e?.message}`
      );
    }
  }
};
