import * as EventsStore from '../events-store';
import { EventStoreEvents } from '../types';
import { getParamFromUrl } from '../utils/get-param-from-url';

export const webWalletSignMessageFinalize = () => {
  const isNotTransaction = !getParamFromUrl('walletProviderStatus');
  const isSigned = getParamFromUrl('status') === 'signed';
  const message = getParamFromUrl('message');
  const signature = getParamFromUrl('signature');

  if (isNotTransaction && isSigned && message && signature) {
    EventsStore.run(EventStoreEvents.onSignMsgFinalized, message, signature);
    window.history.replaceState(null, '', window.location.pathname);
  }
};
