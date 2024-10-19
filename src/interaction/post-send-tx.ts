import { Transaction } from '../core/transaction';
import { Account } from '../core/account';
import { TransactionWatcher } from '../core/transaction-watcher';
import { ApiNetworkProvider } from '../core/network-provider';
import { ls } from '../utils/ls-helpers';
import { EventsStore } from '../events-store';
import { EventStoreEvents } from '../types';

export const postSendTx = async (
  transaction: Transaction,
  txHash: string,
  networkProvider: ApiNetworkProvider
) => {
  EventsStore.run(EventStoreEvents.onTxSent, transaction);
  const transactionWatcher = new TransactionWatcher(networkProvider);
  const transactionOnNetwork = await transactionWatcher.awaitCompleted(txHash);
  const sender = transactionOnNetwork.sender;
  const senderAccount = new Account(sender);
  const userAccountOnNetwork = await networkProvider.getAccount(sender); // TODO: make it take address in string
  senderAccount.update(userAccountOnNetwork); // TODO: return string balance?
  ls.set('address', senderAccount.bech32());
  ls.set('balance', senderAccount.balance);
  EventsStore.run(EventStoreEvents.onTxFinalized, transactionOnNetwork);
};
