/**
 * Required for xPortal Hub integration
 * Based on sdk-dapp webview provider implementation
 * It will probably be replaced with separate library in the future
 */

import { Transaction } from '@multiversx/sdk-core';
import { PlatformsEnum, WebViewProviderResponseEnums } from './types';
import { detectCurrentPlatform, getTargetOrigin } from './utils';
import { requestMethods } from './request-methods';

const currentPlatform = detectCurrentPlatform();

const messageType = 'message';

const handleWaitForMessage = (cb: (eventData: any) => void) => {
  const handleMessageReceived = (event: any) => {
    let eventData = event.data;
    if (
      event.target.origin != getTargetOrigin() &&
      currentPlatform != PlatformsEnum.reactNative
    ) {
      return;
    }
    try {
      eventData = JSON.parse(eventData);
      cb(eventData);
    } catch (err) {
      console.error('error parsing response');
    }
  };
  if (document) {
    document.addEventListener(messageType, handleMessageReceived);
  }
  if (window) {
    window.addEventListener(messageType, handleMessageReceived);
  }
};

export class WebviewProvider {
  constructor() {}
  async logout() {
    requestMethods.logout[currentPlatform]();
    return new Promise((resolve) => {
      resolve(true);
    });
  }
  async signMessage(message: string) {
    try {
      requestMethods.signMessage[currentPlatform](message);
      const waitForSignedMessageResponse: Promise<string> = new Promise(
        (resolve, reject) => {
          (window as any).signMessageResponse = (
            signedMessage: string,
            error: string
          ) => {
            if (error) {
              reject(error);
              (window as any).signMessageResponse = null;
              return;
            }
            resolve(signedMessage);
            (window as any).signMessageResponse = null;
          };

          function handleSignMessageResponse(eventData: any) {
            const { message, type } = eventData;
            if (
              type === WebViewProviderResponseEnums.signMessageResponse &&
              message != null
            ) {
              const { signedMessage, error } = message;

              if (!error) {
                resolve(signedMessage);
              } else {
                reject(error);
              }
            }
            document?.removeEventListener(
              messageType,
              handleSignMessageResponse
            );
          }
          handleWaitForMessage(handleSignMessageResponse);
        }
      );
      return await waitForSignedMessageResponse;
    } catch (err) {
      console.error('error sending transaction', err);
      throw err;
    }
  }
  async signTransactions(transactions: Transaction[]) {
    try {
      const plainTransactions = transactions.map((tx) => tx.toPlainObject());
      requestMethods.signTransactions[currentPlatform](plainTransactions);
      const waitForSignedTransactionsResponse: Promise<Transaction[]> =
        new Promise((resolve, reject) => {
          (window as any).transactionsSigned = (txs: any, error: string) => {
            txs = JSON.parse(txs);
            if (error) {
              reject(error);
              (window as any).transactionsSigned = null;
              return;
            }
            resolve(txs.map((tx: any) => Transaction.fromPlainObject(tx)));
            (window as any).transactionsSigned = null;
          };

          function handleSignTransactionResponse(eventData: any) {
            const { message, type } = eventData;
            if (
              type === WebViewProviderResponseEnums.signTransactionsResponse
            ) {
              const { transactions, error } = message;

              try {
                if (!error) {
                  resolve(
                    transactions.map((tx: any) =>
                      Transaction.fromPlainObject(tx)
                    )
                  );
                } else {
                  reject(error);
                }
              } catch (err) {
                reject('Unable to sign');
              }
            }
            if (document) {
              document.removeEventListener(
                messageType,
                handleSignTransactionResponse
              );
            }
          }
          handleWaitForMessage(handleSignTransactionResponse);
        });
      return await waitForSignedTransactionsResponse;
    } catch (err) {
      console.error('error sending transaction', err);
      throw err;
    }
  }
  async signTransaction(transaction: Transaction) {
    const response = await this.signTransactions([transaction]);
    return response[0];
  }
}
