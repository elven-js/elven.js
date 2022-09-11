import { ls } from '../utils/ls-helpers';
import { EventsStore } from '../events-store';

export const logout = async (elven: any) => {
  if (!elven.dappProvider) {
    throw new Error('Error: Logout failed: There is no active session!');
  }

  EventsStore.run('onLoginPending');

  const isLoggedOut = await elven.dappProvider.logout();
  if (isLoggedOut) {
    ls.clear();
    EventsStore.run('onLogout');
  }

  return isLoggedOut;
};
