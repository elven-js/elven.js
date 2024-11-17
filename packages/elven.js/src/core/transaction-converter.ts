// Based on Multiversx sdk-core with modifications

import { Transaction } from './transaction';
import { IPlainTransactionObject, ITransaction } from './types';
import {
  bytesFromBase64,
  bytesToHex,
  hexToBytes,
  stringFromBase64,
  toBase64FromStringOrBytes,
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
      senderUsername: transaction.senderUsername
        ? toBase64FromStringOrBytes(transaction.senderUsername)
        : undefined,
      receiverUsername: transaction.receiverUsername
        ? toBase64FromStringOrBytes(transaction.receiverUsername)
        : undefined,
      gasPrice: Number(transaction.gasPrice),
      gasLimit: Number(transaction.gasLimit),
      data:
        transaction.data && transaction.data.length
          ? toBase64FromStringOrBytes(transaction.data)
          : undefined,
      chainID: transaction.chainID,
      version: transaction.version,
      options: transaction.options == 0 ? undefined : transaction.options,
      guardian: transaction.guardian ? transaction.guardian : undefined,
      signature:
        transaction.signature && transaction.signature.length
          ? bytesToHex(transaction.signature)
          : undefined,
      guardianSignature:
        transaction.guardianSignature && transaction.guardianSignature.length
          ? bytesToHex(transaction.guardianSignature)
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
      receiverUsername: stringFromBase64(object.receiverUsername || ''),
      sender: object.sender,
      senderUsername: stringFromBase64(object.senderUsername || ''),
      guardian: object.guardian,
      gasPrice: BigInt(object.gasPrice),
      gasLimit: BigInt(object.gasLimit),
      data: object.data ? bytesFromBase64(object.data) : undefined,
      chainID: object.chainID,
      version: Number(object.version),
      options: Number(object.options),
      signature: object.signature ? hexToBytes(object.signature) : undefined,
      guardianSignature: object.guardianSignature
        ? hexToBytes(object.guardianSignature)
        : undefined,
    });

    return transaction;
  }
}
