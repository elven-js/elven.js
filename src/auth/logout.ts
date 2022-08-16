import { ls } from '../utils/ls-helpers';

declare global {
  interface Window {
    ElvenJS: any;
  }
}

export const logout = async () => {
  if (!window.ElvenJS.dappProvider) {
    throw new Error('Error: Logout failed: There is no active session!');
  }

  const isLoggedOut = await window.ElvenJS.dappProvider.logout();
  if (isLoggedOut) {
    ls.clear();
  }

  return isLoggedOut;
};
