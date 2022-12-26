import { ls } from '../utils/ls-helpers';
import { EventsStore } from '../events-store';
import { EventStoreEvents } from '../types';

export const logout = async (elven: any) => {
  if (!elven.dappProvider) {
    throw new Error('Error: Logout failed: There is no active session!');
  }

  EventsStore.run(EventStoreEvents.onLoginPending);

  const isLoggedOut = await elven.dappProvider.logout();
  if (isLoggedOut) {
    ls.clear();
    EventsStore.run(EventStoreEvents.onLogout);
  }

  return isLoggedOut;
};
