import { ls } from '../utils/ls-helpers';

export const logout = async (elven: any) => {
  if (!elven.dappProvider) {
    throw new Error('Error: Logout failed: There is no active session!');
  }

  const isLoggedOut = await elven.dappProvider.logout();
  if (isLoggedOut) {
    ls.clear();
  }

  return isLoggedOut;
};
