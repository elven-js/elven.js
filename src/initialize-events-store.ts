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
  if (initOptions.onTxStart) {
    EventsStore.set(EventStoreEvents.onTxStart, initOptions.onTxStart);
  }
  if (initOptions.onTxSent) {
    EventsStore.set(EventStoreEvents.onTxSent, initOptions.onTxSent);
  }
  if (initOptions.onTxFinalized) {
    EventsStore.set(EventStoreEvents.onTxFinalized, initOptions.onTxFinalized);
  }
  if (initOptions.onTxFailure) {
    EventsStore.set(EventStoreEvents.onTxFailure, initOptions.onTxFailure);
  }

  // Signing initialization
  if (initOptions.onSignMsgStart) {
    EventsStore.set(
      EventStoreEvents.onSignMsgStart,
      initOptions.onSignMsgStart
    );
  }
  if (initOptions.onSignMsgFinalized) {
    EventsStore.set(
      EventStoreEvents.onSignMsgFinalized,
      initOptions.onSignMsgFinalized
    );
  }
  if (initOptions.onSignMsgFailure) {
    EventsStore.set(
      EventStoreEvents.onSignMsgFailure,
      initOptions.onSignMsgFailure
    );
  }

  // Queries initialization
  if (initOptions.onQueryStart) {
    EventsStore.set(EventStoreEvents.onQueryStart, initOptions.onQueryStart);
  }
  if (initOptions.onQueryFinalized) {
    EventsStore.set(
      EventStoreEvents.onQueryFinalized,
      initOptions.onQueryFinalized
    );
  }
  if (initOptions.onQueryFailure) {
    EventsStore.set(
      EventStoreEvents.onQueryFailure,
      initOptions.onQueryFailure
    );
  }
};
