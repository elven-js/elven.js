import { Transaction } from '@elrondnetwork/erdjs/out/transaction';
import { Account } from '@elrondnetwork/erdjs/out/account';
import { TransactionWatcher } from '@elrondnetwork/erdjs/out/transactionWatcher';
import { ApiNetworkProvider } from '../network-provider';
import { ls } from '../utils/ls-helpers';
import { EventsStore } from '../events-store';

export const postSendTx = async (
  transaction: Transaction,
  networkProvider: ApiNetworkProvider
) => {
  EventsStore.run('onTxSent', transaction);
  const transactionWatcher = new TransactionWatcher(networkProvider);
  await transactionWatcher.awaitCompleted(transaction);
  const sender = transaction.getSender();
  const senderAccount = new Account(sender);
  const userAccountOnNetwork = await networkProvider.getAccount(sender);
  senderAccount.update(userAccountOnNetwork);
  ls.set('address', senderAccount.address.bech32());
  ls.set('nonce', senderAccount.getNonceThenIncrement().valueOf());
  ls.set('balance', senderAccount.balance.toString());
  EventsStore.run('onTxFinalized', transaction);
};
