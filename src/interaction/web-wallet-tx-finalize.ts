import {
  WALLET_PROVIDER_CALLBACK_PARAM,
  WALLET_PROVIDER_CALLBACK_PARAM_TX_SIGNED,
} from '@multiversx/sdk-web-wallet-provider/out';
import { Transaction } from '@multiversx/sdk-core/out/transaction';
import { getParamFromUrl } from '../utils/get-param-from-url';
import { DappProvider, EventStoreEvents } from '../types';
import { ApiNetworkProvider } from '../network-provider';
import { postSendTx } from './post-send-tx';
import { errorParse } from '../utils/error-parse';
import { EventsStore } from '../events-store';

export const webWalletTxFinalize = async (
  dappProvider: DappProvider,
  networkProvider: ApiNetworkProvider,
  nonce: number
) => {
  const walletProviderStatus = getParamFromUrl(WALLET_PROVIDER_CALLBACK_PARAM);
  if (
    walletProviderStatus === WALLET_PROVIDER_CALLBACK_PARAM_TX_SIGNED &&
    dappProvider &&
    networkProvider &&
    'getTransactionsFromWalletUrl' in dappProvider
  ) {
    const txs = dappProvider.getTransactionsFromWalletUrl();
    window.history.replaceState(null, '', window.location.pathname);
    // For now it is prepared for handling one transaction at a time
    const transactionObj = txs?.[0];
    if (transactionObj) {
      transactionObj.data = Buffer.from(transactionObj.data).toString('base64');
      const transaction = Transaction.fromPlainObject(transactionObj);

      transaction.setNonce(nonce);
      try {
        EventsStore.run(EventStoreEvents.onTxStarted, transaction);
        await networkProvider.sendTransaction(transaction);
        await postSendTx(transaction, networkProvider);
      } catch (e) {
        const err = errorParse(e);
        EventsStore.run(EventStoreEvents.onTxError, transaction, err);
        throw new Error(`Error: Transaction signing failed! ${err}`);
      }
    }
  }
};
