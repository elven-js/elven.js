import { Transaction } from './transaction';
import { TransactionsConverter } from './transaction-converter';
import { webviewProviderEventHandler } from './webview-event-handler';
import {
  WindowProviderRequestEnums,
  WindowProviderResponseEnums,
  SignMessageStatusEnum,
  PostMessageParamsType,
  PostMessageReturnType,
  ReplyWithPostMessagePayloadType,
} from './types';
import { responseTypeMap } from './constants';
import { Message } from './message';
import { getTargetOrigin, bytesToString, hexToBytes } from './utils';

interface IWebviewProviderOptions {
  resetStateCallback?: () => void;
}

export interface IProviderAccount {
  address: string;
  signature?: string;
}

export class WebviewProvider {
  // eslint-disable-next-line no-use-before-define
  private static _instance: WebviewProvider;
  private initialized = false;
  private account: IProviderAccount = { address: '' };

  static getInstance(options?: IWebviewProviderOptions) {
    if (!WebviewProvider._instance) {
      WebviewProvider._instance = new WebviewProvider(options);
    }
    return WebviewProvider._instance;
  }

  constructor(options?: IWebviewProviderOptions) {
    if (options?.resetStateCallback) {
      this.resetState(options.resetStateCallback);
    }
  }

  private resetState = (resetStateCallback?: () => void) => {
    if (typeof window !== 'undefined') {
      window.addEventListener(
        'message',
        webviewProviderEventHandler(
          WindowProviderResponseEnums.resetStateResponse,
          (data: { type: string }) => {
            if (data.type === WindowProviderResponseEnums.resetStateResponse) {
              resetStateCallback?.();

              setTimeout(() => {
                this.finalizeResetState();
              }, 500);
            }
          }
        )
      );
    }
  };

  private disconnect() {
    this.account = { address: '' };
  }

  init = async () => {
    await this.sendPostMessage({
      type: WindowProviderRequestEnums.finalizeHandshakeRequest,
      payload: undefined,
    });

    this.initialized = true;
    return this.initialized;
  };

  login = async () => {
    if (!this.initialized) {
      throw new Error('Provider not initialized');
    }

    const response = await this.sendPostMessage({
      type: WindowProviderRequestEnums.loginRequest,
      payload: undefined,
    });

    if (response.type == WindowProviderResponseEnums.cancelResponse) {
      console.warn('Cancelled the login action');
      await this.cancelAction();
      return null;
    }

    if (!response.payload.data) {
      console.error(
        'Error logging in',
        response.payload.error ?? 'No data received'
      );
      return null;
    }

    this.account = response.payload.data;
    return this.account;
  };

  logout = async () => {
    const response = await this.sendPostMessage({
      type: WindowProviderRequestEnums.logoutRequest,
      payload: undefined,
    });

    this.initialized = false;
    this.disconnect();

    return Boolean(response.payload.data);
  };

  relogin = async () => {
    const response = await this.sendPostMessage({
      type: WindowProviderRequestEnums.loginRequest,
      payload: undefined,
    });

    if (response.type == WindowProviderResponseEnums.cancelResponse) {
      console.warn('Cancelled the re-login action');
      await this.cancelAction();
      return null;
    }

    if (!response.payload.data) {
      console.error(
        'Re-login Error',
        response.payload.error ?? 'No data received'
      );
      return null;
    }

    const { data, error } = response.payload;

    if (error || !data) {
      throw new Error('Unable to re-login');
    }

    const { accessToken } = data;

    if (!accessToken) {
      console.error('Unable to re-login. Missing accessToken.');
      return null;
    }

    this.account = data;
    return accessToken;
  };

  signTransactions = async (
    transactionsToSign: Transaction[]
  ): Promise<Transaction[]> => {
    const response = await this.sendPostMessage({
      type: WindowProviderRequestEnums.signTransactionsRequest,
      payload: transactionsToSign.map((tx) =>
        TransactionsConverter.transactionToPlainObject(tx)
      ),
    });

    const { data: signedTransactions, error } = response.payload;

    if (error || !signedTransactions) {
      throw new Error('Unable to sign transactions');
    }

    if (response.type == WindowProviderResponseEnums.cancelResponse) {
      this.cancelAction();
      throw new Error('Cancelled the transactions signing action');
    }

    return signedTransactions.map((tx) =>
      TransactionsConverter.plainObjectToTransaction(tx)
    );
  };

  signTransaction = async (transaction: Transaction) => {
    const response = await this.signTransactions([transaction]);
    return response[0];
  };

  signMessage = async (messageToSign: Message): Promise<Message | null> => {
    const response = await this.sendPostMessage({
      type: WindowProviderRequestEnums.signMessageRequest,
      payload: { message: bytesToString(messageToSign.data) },
    });

    const { data, error } = response.payload;

    if (error || !data) {
      console.error('Unable to sign message');
      return null;
    }

    if (response.type == WindowProviderResponseEnums.cancelResponse) {
      console.warn('Cancelled the message signing action');
      this.cancelAction();
      return null;
    }

    if (data.status !== SignMessageStatusEnum.signed) {
      console.error('Could not sign message');
      return null;
    }

    return new Message({
      data: messageToSign.data,
      address: messageToSign.address ?? this.account.address,
      signer: 'webview',
      version: messageToSign.version,
      signature: hexToBytes(data.signature || ''),
    });
  };

  cancelAction = async () => {
    return this.sendPostMessage({
      type: WindowProviderRequestEnums.cancelAction,
      payload: undefined,
    });
  };

  finalizeResetState = async () => {
    return this.sendPostMessage({
      type: WindowProviderRequestEnums.finalizeResetStateRequest,
      payload: undefined,
    });
  };

  isInitialized(): boolean {
    return this.initialized;
  }

  isConnected(): boolean {
    return Boolean(this.account.address);
  }

  getAccount(): IProviderAccount | null {
    return this.account;
  }

  setAccount(account: IProviderAccount): void {
    this.account = account;
  }

  sendPostMessage = async <T extends WindowProviderRequestEnums>(
    message: PostMessageParamsType<T>
  ): Promise<PostMessageReturnType<T>> => {
    const safeWindow = window as any;

    if (safeWindow) {
      if (safeWindow.ReactNativeWebView) {
        safeWindow.ReactNativeWebView.postMessage(JSON.stringify(message));
      } else if (safeWindow.webkit) {
        safeWindow.webkit.messageHandlers?.jsHandler?.postMessage(
          JSON.stringify(message),
          getTargetOrigin()
        );
      } else if (safeWindow.parent) {
        safeWindow.parent.postMessage(message, getTargetOrigin());
      }
    }

    return await this.waitingForResponse(responseTypeMap[message.type]);
  };

  private waitingForResponse = async <T extends WindowProviderResponseEnums>(
    action: T
  ): Promise<{
    type: T;
    payload: ReplyWithPostMessagePayloadType<T>;
  }> => {
    return await new Promise((resolve) => {
      if (typeof window !== 'undefined') {
        window.addEventListener?.(
          'message',
          webviewProviderEventHandler(action, resolve)
        );
      }
    });
  };
}
