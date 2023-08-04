import { Transaction } from '@multiversx/sdk-core/out/transaction';
import { Account } from '@multiversx/sdk-core/out/account';
import { ls } from '../utils/ls-helpers';

export const preSendTx = (tx: Transaction) => {
  const sender = tx.getSender();
  const senderAccount = new Account(sender);
  const currentNonce = tx.getNonce().valueOf();
  senderAccount.incrementNonce();
  ls.set('nonce', currentNonce + 1);
};
