import { Transaction } from '../core/transaction';
import { Account } from '../core/account';
import { ls } from '../utils/ls-helpers';

export const preSendTx = (tx: Transaction) => {
  const sender = tx.sender;
  const senderAccount = new Account(sender);
  const currentNonce = tx.nonce.valueOf();
  senderAccount.incrementNonce();
  ls.set('nonce', (currentNonce + 1n).toString());
};
