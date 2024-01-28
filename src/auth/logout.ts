import { ls } from '../utils/ls-helpers';
import { EventsStore } from '../events-store';
import { EventStoreEvents } from '../types';
import { errorParse } from '../utils/error-parse';

export const logout = async (elven: any) => {
  if (!elven.dappProvider) {
    throw new Error('Logout failed: There is no active session!');
  }

  EventsStore.run(EventStoreEvents.onLogoutStart);

  try {
    const isLoggedOut = await elven.dappProvider.logout();
    if (isLoggedOut) {
      ls.clear();
      EventsStore.run(EventStoreEvents.onLogoutSuccess);
    }

    return isLoggedOut;
  } catch (e) {
    const err = errorParse(e);
    console.warn(`Something went wrong trying to logout the user: ${err}`);
    EventsStore.run(EventStoreEvents.onLogoutFailure, err);
  } finally {
    EventsStore.run(EventStoreEvents.onLogoutEnd);
  }
};
