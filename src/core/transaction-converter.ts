// Based on Multiversx sdk-core with modifications

import { Transaction } from './transaction';
import { IPlainTransactionObject, ITransaction } from './types';
import {
  bytesFromBase64,
  bytesToHex,
  hexToBytes,
  toBase64fromStringOrBytes,
} from './utils';

export class TransactionsConverter {
  static transactionToPlainObject(
    transaction: ITransaction
  ): IPlainTransactionObject {
    return {
      nonce: Number(transaction.nonce),
      value: transaction.value.toString(),
      receiver: transaction.receiver,
      sender: transaction.sender,
      senderUsername: toBase64fromStringOrBytes(transaction.senderUsername),
      receiverUsername: toBase64fromStringOrBytes(transaction.receiverUsername),
      gasPrice: Number(transaction.gasPrice),
      gasLimit: Number(transaction.gasLimit),
      data: toBase64fromStringOrBytes(transaction.data),
      chainID: transaction.chainID,
      version: transaction.version,
      options: transaction.options == 0 ? undefined : transaction.options,
      guardian: transaction.guardian ? transaction.guardian : undefined,
      signature: bytesToHex(transaction.signature),
      guardianSignature: bytesToHex(transaction.guardianSignature),
      relayer: transaction.relayer ? transaction.relayer : undefined,
      innerTransactions: transaction.innerTransactions.length
        ? transaction.innerTransactions.map((tx) =>
            this.transactionToPlainObject(tx)
          )
        : undefined,
    };
  }

  static plainObjectToTransaction(
    object: IPlainTransactionObject
  ): Transaction {
    const transaction = new Transaction({
      nonce: BigInt(object.nonce),
      value: BigInt(object.value || ''),
      receiver: object.receiver,
      receiverUsername: bytesFromBase64(
        object.receiverUsername || ''
      ).toString(),
      sender: object.sender,
      senderUsername: bytesFromBase64(object.senderUsername || '').toString(),
      guardian: object.guardian,
      gasPrice: BigInt(object.gasPrice),
      gasLimit: BigInt(object.gasLimit),
      data: bytesFromBase64(object.data || ''),
      chainID: String(object.chainID),
      version: Number(object.version),
      options: Number(object.options),
      signature: hexToBytes(object.signature || ''),
      guardianSignature: hexToBytes(object.guardianSignature || ''),
      relayer: object.relayer,
      innerTransactions: object.innerTransactions
        ? object.innerTransactions.map((tx) =>
            this.plainObjectToTransaction(tx)
          )
        : undefined,
    });

    return transaction;
  }
}
