import * as EventsStore from '../events-store';
import { EventStoreEvents } from '../types';
import { errorParse } from './error-parse';

export const withLoginEvents = async (
  fn: (onLoginSuccess: () => void) => Promise<void>
) => {
  EventsStore.run(EventStoreEvents.onLoginStart);
  try {
    await fn(() => {
      EventsStore.run(EventStoreEvents.onLoginSuccess);
    });
  } catch (e) {
    const err = errorParse(e);
    console.warn(`Something went wrong trying to login the user: ${err}`);
    EventsStore.run(EventStoreEvents.onLoginFailure, err);
  }
};
