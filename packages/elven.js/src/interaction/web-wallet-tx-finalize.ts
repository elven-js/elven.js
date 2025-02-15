import {
  WalletProvider,
  PlainSignedTransaction,
} from '../core/web-wallet-signing';
import {
  WALLET_PROVIDER_CALLBACK_PARAM,
  WALLET_PROVIDER_CALLBACK_PARAM_TX_SIGNED,
} from '../core/constants';
import { getParamFromUrl } from '../utils/get-param-from-url';
import {
  DappProvider,
  EventStoreEvents,
  LoginMethodsEnum,
  WebWalletUrlParamsEnum,
} from '../types';
import { ApiNetworkProvider } from '../core/network-provider';
import { postSendTx } from './post-send-tx';
import { errorParse } from '../utils/error-parse';
import * as EventsStore from '../events-store';
import { ls } from '../utils/ls-helpers';
import { DAPP_INIT_ROUTE } from '../utils/constants';
import { preSendTx } from './pre-send-tx';
import { TransactionsConverter } from '../core/transaction-converter';
import { IPlainTransactionObject } from '../core/types';
import { toBase64FromStringOrBytes } from '../core/utils';

export const webWalletTxFinalize = async (
  dappProvider: DappProvider,
  networkProvider: ApiNetworkProvider,
  urlAddress: string,
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
      // Something is broken here, the line below is required for web wallet but not for xAlias
      // getTransactionsFromWalletUrl should return the same data for both cases
      // and then it should be consumed in the same way on the web wallet and xAlias sides
      if (loginMethod === LoginMethodsEnum.webWallet) {
        transactionObj.data = toBase64FromStringOrBytes(transactionObj.data)!;
      }
    } else if (
      guardian &&
      loginMethod !== LoginMethodsEnum.webWallet &&
      loginMethod !== LoginMethodsEnum.xAlias &&
      hasWebWalletGuardianSign
    ) {
      const webWalletProvider = new WalletProvider(
        `${urlAddress}${DAPP_INIT_ROUTE}`
      );
      const txs = webWalletProvider.getTransactionsFromWalletUrl();
      transactionObj = txs?.[0];
    }

    if (transactionObj) {
      const transaction = TransactionsConverter.plainObjectToTransaction(
        transactionObj as IPlainTransactionObject
      );

      transaction.nonce = BigInt(nonce);

      preSendTx(transaction);

      try {
        EventsStore.run(EventStoreEvents.onTxStart, transaction);
        const response = await networkProvider.sendTransaction(transaction);
        await postSendTx(response, networkProvider);
      } catch (e) {
        const err = errorParse(e);
        const errMsg = `Getting transaction information failed! ${err}`;
        EventsStore.run(EventStoreEvents.onTxFailure, transaction, errMsg);
        throw new Error(errMsg);
      } finally {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }

    window.history.replaceState(null, '', window.location.pathname);
  }
};
