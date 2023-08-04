import {
  WALLET_PROVIDER_CALLBACK_PARAM,
  WALLET_PROVIDER_CALLBACK_PARAM_TX_SIGNED,
  WalletProvider,
} from '@multiversx/sdk-web-wallet-provider/out';
import { Transaction } from '@multiversx/sdk-core/out/transaction';
import { getParamFromUrl } from '../utils/get-param-from-url';
import {
  DappProvider,
  EventStoreEvents,
  LoginMethodsEnum,
  WebWalletUrlParamsEnum,
} from '../types';
import { ApiNetworkProvider } from '../network-provider';
import { postSendTx } from './post-send-tx';
import { errorParse } from '../utils/error-parse';
import { EventsStore } from '../events-store';
import { ls } from '../utils/ls-helpers';
import { PlainSignedTransaction } from '@multiversx/sdk-web-wallet-provider/out/plainSignedTransaction';
import { DAPP_INIT_ROUTE } from '../utils/constants';
import { preSendTx } from './pre-send-tx';

export const webWalletTxFinalize = async (
  dappProvider: DappProvider,
  networkProvider: ApiNetworkProvider,
  walletUrlAddress: string,
  nonce: number
) => {
  const walletProviderStatus = getParamFromUrl(WALLET_PROVIDER_CALLBACK_PARAM);
  if (
    walletProviderStatus === WALLET_PROVIDER_CALLBACK_PARAM_TX_SIGNED &&
    dappProvider &&
    networkProvider
  ) {
    const guardian = ls.get('activeGuardian');
    const loginMethod = ls.get('loginMethod');

    const hasWebWalletGuardianSign = getParamFromUrl(
      WebWalletUrlParamsEnum.hasWebWalletGuardianSign
    );

    let transactionObj: PlainSignedTransaction | undefined;

    if ('getTransactionsFromWalletUrl' in dappProvider) {
      const txs = dappProvider.getTransactionsFromWalletUrl();

      // For now it is prepared for handling one transaction at a time
      transactionObj = txs?.[0];
      if (!transactionObj) return;
      transactionObj.data = Buffer.from(transactionObj.data).toString('base64');
    } else if (
      guardian &&
      loginMethod !== LoginMethodsEnum.webWallet &&
      hasWebWalletGuardianSign
    ) {
      const webWalletProvider = new WalletProvider(
        `${walletUrlAddress}${DAPP_INIT_ROUTE}`
      );
      const txs = webWalletProvider.getTransactionsFromWalletUrl();
      transactionObj = txs?.[0];
    }

    if (transactionObj) {
      const transaction = Transaction.fromPlainObject(transactionObj);

      transaction.setNonce(nonce);

      preSendTx(transaction);

      try {
        EventsStore.run(EventStoreEvents.onTxStarted, transaction);
        await networkProvider.sendTransaction(transaction);
        await postSendTx(transaction, networkProvider);
      } catch (e) {
        const err = errorParse(e);
        EventsStore.run(EventStoreEvents.onTxError, transaction, err);
        throw new Error(`Error: Transaction signing failed! ${err}`);
      } finally {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }

    window.history.replaceState(null, '', window.location.pathname);
  }
};
