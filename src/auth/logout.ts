import { ls } from '../utils/ls-helpers';
import { DappProvider } from '../types';

export const logout = async (dappProvider: DappProvider) => {
  if (!dappProvider) {
    throw new Error('Error: Logout failed: There is no active session!');
  }

  const isLoggedOut = await dappProvider.logout();
  if (isLoggedOut) {
    ls.clear();
  }

  return isLoggedOut;
};
