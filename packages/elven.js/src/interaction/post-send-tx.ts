import { Account } from '../core/account';
import { TransactionWatcher } from '../core/transaction-watcher';
import { ApiNetworkProvider } from '../core/network-provider';
import { ls } from '../utils/ls-helpers';
import * as EventsStore from '../events-store';
import { EventStoreEvents } from '../types';
import { ISentTransactionResponse } from '../core/types';

export const postSendTx = async (
  txSendResponse: ISentTransactionResponse,
  networkProvider: ApiNetworkProvider
) => {
  EventsStore.run(EventStoreEvents.onTxSent, txSendResponse);
  const transactionWatcher = new TransactionWatcher(networkProvider);
  const transactionOnNetwork = await transactionWatcher.awaitCompleted(
    txSendResponse.txHash
  );
  const sender = transactionOnNetwork.sender;
  const senderAccount = new Account(sender);
  const userAccountOnNetwork = await networkProvider.getAccount(sender);
  senderAccount.update(userAccountOnNetwork);
  ls.set('address', senderAccount.bech32());
  ls.set('balance', senderAccount.balance);
  EventsStore.run(EventStoreEvents.onTxFinalized, transactionOnNetwork);
};
