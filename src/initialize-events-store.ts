import { EventsStore } from './events-store';
import { InitOptions, EventStoreEvents } from './types';

export const initializeEventsStore = (initOptions: InitOptions) => {
  // Logoin initialiation
  if (initOptions.onLoginStart) {
    EventsStore.set(EventStoreEvents.onLoginStart, initOptions.onLoginStart);
  }
  if (initOptions.onLoginSuccess) {
    EventsStore.set(
      EventStoreEvents.onLoginSuccess,
      initOptions.onLoginSuccess
    );
  }
  if (initOptions.onLoginFailure) {
    EventsStore.set(
      EventStoreEvents.onLoginFailure,
      initOptions.onLoginFailure
    );
  }
  if (initOptions.onLoginEnd) {
    EventsStore.set(EventStoreEvents.onLoginEnd, initOptions.onLoginEnd);
  }

  // Logout initialiation
  if (initOptions.onLogoutStart) {
    EventsStore.set(EventStoreEvents.onLogoutStart, initOptions.onLogoutStart);
  }
  if (initOptions.onLogoutSuccess) {
    EventsStore.set(
      EventStoreEvents.onLogoutSuccess,
      initOptions.onLogoutSuccess
    );
  }
  if (initOptions.onLogoutFailure) {
    EventsStore.set(
      EventStoreEvents.onLogoutFailure,
      initOptions.onLogoutFailure
    );
  }
  if (initOptions.onLogoutEnd) {
    EventsStore.set(EventStoreEvents.onLogoutEnd, initOptions.onLogoutEnd);
  }

  // Qr code initialization
  if (initOptions.onQrPending) {
    EventsStore.set(EventStoreEvents.onQrPending, initOptions.onQrPending);
  }
  if (initOptions.onQrLoaded) {
    EventsStore.set(EventStoreEvents.onQrLoaded, initOptions.onQrLoaded);
  }

  // Transactions initialization
  if (initOptions.onTxStarted) {
    EventsStore.set(EventStoreEvents.onTxStarted, initOptions.onTxStarted);
  }
  if (initOptions.onTxSent) {
    EventsStore.set(EventStoreEvents.onTxSent, initOptions.onTxSent);
  }
  if (initOptions.onTxFinalized) {
    EventsStore.set(EventStoreEvents.onTxFinalized, initOptions.onTxFinalized);
  }
  if (initOptions.onTxError) {
    EventsStore.set(EventStoreEvents.onTxError, initOptions.onTxError);
  }

  // Signing initialization
  if (initOptions.onSignMsgStarted) {
    EventsStore.set(
      EventStoreEvents.onSignMsgStarted,
      initOptions.onSignMsgStarted
    );
  }
  if (initOptions.onSignMsgFinalized) {
    EventsStore.set(
      EventStoreEvents.onSignMsgFinalized,
      initOptions.onSignMsgFinalized
    );
  }
  if (initOptions.onSignMsgError) {
    EventsStore.set(
      EventStoreEvents.onSignMsgError,
      initOptions.onSignMsgError
    );
  }
};
