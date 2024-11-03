// Based on Multiversx sdk WalletConnect signing provider with modifications

import { Message } from './message';
import { Transaction } from './transaction';
import Client from '@walletconnect/sign-client';
import {
  EngineTypes,
  PairingTypes,
  SessionTypes,
  SignClientTypes,
} from '@walletconnect/types';
import { getSdkError, isValidArray } from '@walletconnect/utils';
import {
  WALLETCONNECT_MULTIVERSX_NAMESPACE,
  WALLETCONNECT_SIGN_LOGIN_DELAY,
} from './constants';
import { WalletConnectV2ProviderErrorMessagesEnum } from './types';
import {
  applyTransactionSignature,
  addressIsValid,
  getCurrentSession,
  getCurrentTopic,
  getAddressFromSession,
  getConnectionParams,
  getMetadata,
  ConnectParamsTypes,
  TransactionResponse,
  sleep,
} from './walletconnect-utils';
import { TransactionsConverter } from './transaction-converter';

enum Operation {
  SIGN_TRANSACTION = 'mvx_signTransaction',
  SIGN_TRANSACTIONS = 'mvx_signTransactions',
  SIGN_MESSAGE = 'mvx_signMessage',
}

enum OptionalOperation {
  SIGN_LOGIN_TOKEN = 'mvx_signLoginToken',
  SIGN_NATIVE_AUTH_TOKEN = 'mvx_signNativeAuthToken',
  CANCEL_ACTION = 'mvx_cancelAction',
}

interface SessionEventTypes {
  event: {
    name: string;
    data: any;
  };
  chainId: string;
}

interface IClientConnect {
  onClientLogin: () => void;
  onClientLogout(): void;
  onClientEvent: (event: SessionEventTypes['event']) => void;
}

export {
  PairingTypes,
  SessionTypes,
  SessionEventTypes,
  ConnectParamsTypes,
  EngineTypes,
  WalletConnectV2ProviderErrorMessagesEnum,
  Operation,
  OptionalOperation,
};

export interface IProviderAccount {
  address: string;
  signature?: string;
}

export class WalletConnectV2Provider {
  walletConnectV2Relay: string;
  walletConnectV2ProjectId: string;
  chainId: string = '';
  isInitializing: boolean = false;
  walletConnector: Client | undefined;
  session: SessionTypes.Struct | undefined;
  pairings: PairingTypes.Struct[] | undefined;
  processingTopic: string = '';
  options: SignClientTypes.Options | undefined = {};

  private onClientConnect: IClientConnect;
  private account: IProviderAccount = { address: '' };

  constructor(
    onClientConnect: IClientConnect,
    chainId: string,
    walletConnectV2Relay: string,
    walletConnectV2ProjectId: string,
    options?: SignClientTypes.Options
  ) {
    this.onClientConnect = onClientConnect;
    this.chainId = chainId;
    this.walletConnectV2Relay = walletConnectV2Relay;
    this.walletConnectV2ProjectId = walletConnectV2ProjectId;
    this.options = options;
  }

  private disconnect() {
    this.account = { address: '', signature: '' };
    this.walletConnector = undefined;
    this.session = undefined;
    this.pairings = undefined;
  }

  /**
   * Initiates WalletConnect client.
   */
  async init(): Promise<boolean> {
    if (this.isInitialized()) {
      return this.isInitialized();
    } else {
      try {
        if (!this.isInitializing) {
          this.isInitializing = true;
          this.disconnect();
          const metadata = this.options?.metadata
            ? {
                metadata: getMetadata(this.options?.metadata),
              }
            : {};

          const client = await Client.init({
            ...this.options,
            relayUrl: this.walletConnectV2Relay,
            projectId: this.walletConnectV2ProjectId,
            ...metadata,
          });

          this.walletConnector = client;
          this.isInitializing = false;

          await this.subscribeToEvents(client);
          await this.checkPersistedState(client);
        }
      } catch {
        throw new Error(WalletConnectV2ProviderErrorMessagesEnum.unableToInit);
      } finally {
        this.isInitializing = false;
        // eslint-disable-next-line no-unsafe-finally
        return this.isInitialized();
      }
    }
  }

  /**
   * Returns true if init() was previously called successfully
   */
  isInitialized(): boolean {
    return !!this.walletConnector && !this.isInitializing;
  }

  /**
   * Returns true if provider is initialized and a valid session is set
   */
  isConnected(): boolean {
    return Boolean(this.isInitialized() && typeof this.session !== 'undefined');
  }

  /**
   * Returns the current account
   */
  getAccount(): IProviderAccount | null {
    return this.account;
  }

  /**
   * Sets the current account
   * @param account
   */
  setAccount(account: IProviderAccount): void {
    this.account = account;
  }

  async connect(options?: ConnectParamsTypes): Promise<{
    uri?: string;
    approval: () => Promise<SessionTypes.Struct>;
  }> {
    if (typeof this.walletConnector === 'undefined') {
      throw new Error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
    }

    const connectParams = getConnectionParams(this.chainId, options);

    try {
      const response = await this.walletConnector.connect({
        pairingTopic: options?.topic,
        ...connectParams,
      });

      return response;
    } catch {
      if (options?.topic) {
        try {
          this.walletConnector.core?.expirer?.set(options.topic, 0);
        } catch {
          console.error(
            WalletConnectV2ProviderErrorMessagesEnum.unableToHandleCleanup
          );
        }
      }

      this.disconnect();
      console.error(
        options?.topic
          ? WalletConnectV2ProviderErrorMessagesEnum.unableToConnectExisting
          : WalletConnectV2ProviderErrorMessagesEnum.unableToConnect
      );

      throw new Error(
        options?.topic
          ? WalletConnectV2ProviderErrorMessagesEnum.unableToConnectExisting
          : WalletConnectV2ProviderErrorMessagesEnum.unableToConnect
      );
    }
  }

  async login(options?: {
    approval?: () => Promise<SessionTypes.Struct>;
    token?: string;
  }): Promise<IProviderAccount | null> {
    this.isInitializing = true;
    if (typeof this.walletConnector === 'undefined') {
      await this.connect();
    }

    if (typeof this.walletConnector === 'undefined') {
      throw new Error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
    }

    if (typeof this.session !== 'undefined') {
      await this.logout({ topic: this.session?.topic });
    }

    try {
      if (options && options.approval) {
        const session = await options.approval();

        if (options.token) {
          await sleep(WALLETCONNECT_SIGN_LOGIN_DELAY); // Delay the sign login token action to allow the UI to update properly
          const address = getAddressFromSession(session);

          const selectedNamespace =
            session.namespaces[WALLETCONNECT_MULTIVERSX_NAMESPACE];
          const method = selectedNamespace.methods.includes(
            OptionalOperation.SIGN_NATIVE_AUTH_TOKEN
          )
            ? OptionalOperation.SIGN_NATIVE_AUTH_TOKEN
            : OptionalOperation.SIGN_LOGIN_TOKEN;

          const { signature }: { signature: string } =
            await this.walletConnector.request({
              chainId: `${WALLETCONNECT_MULTIVERSX_NAMESPACE}:${this.chainId}`,
              topic: session.topic,
              request: {
                method,
                params: {
                  token: options.token,
                  address,
                },
              },
            });

          if (!signature) {
            console.error(
              WalletConnectV2ProviderErrorMessagesEnum.unableToSignLoginToken
            );
            throw new Error(
              WalletConnectV2ProviderErrorMessagesEnum.unableToSignLoginToken
            );
          }

          return await this.onSessionConnected({
            session,
            signature,
          });
        }

        return await this.onSessionConnected({
          session,
          signature: '',
        });
      }
    } catch {
      this.disconnect();
      console.error(WalletConnectV2ProviderErrorMessagesEnum.unableToLogin);
      throw new Error(WalletConnectV2ProviderErrorMessagesEnum.unableToLogin);
    } finally {
      this.isInitializing = false;
    }

    return null;
  }

  /**
   * Mocks a logout request by returning true
   */
  async logout(options?: { topic?: string }): Promise<boolean> {
    if (typeof this.walletConnector === 'undefined') {
      console.error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
    }

    try {
      if (
        this.processingTopic ===
        (options?.topic || getCurrentTopic(this.chainId, this.walletConnector))
      ) {
        return true;
      }

      if (options?.topic) {
        this.processingTopic = options.topic;
        await this.walletConnector.disconnect({
          topic: options.topic,
          reason: getSdkError('USER_DISCONNECTED'),
        });
      } else {
        const currentSessionTopic = getCurrentTopic(
          this.chainId,
          this.walletConnector
        );
        this.processingTopic = currentSessionTopic;
        await this.walletConnector.disconnect({
          topic: currentSessionTopic,
          reason: getSdkError('USER_DISCONNECTED'),
        });

        this.disconnect();

        await this.cleanupPendingPairings({ deletePairings: true });
      }
    } catch {
      console.error(WalletConnectV2ProviderErrorMessagesEnum.alreadyLoggedOut);
    } finally {
      this.processingTopic = '';
    }

    return true;
  }

  /**
   * Fetches the WalletConnect address
   */
  getAddress(): string {
    if (typeof this.walletConnector === 'undefined') {
      console.error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
    }

    return this.account.address;
  }

  /**
   * Fetches the WalletConnect signature
   */
  getSignature(): string | undefined {
    if (typeof this.walletConnector === 'undefined') {
      console.error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
    }

    return this.account.signature;
  }

  /**
   * Fetches the WalletConnect pairings
   */
  async getPairings(): Promise<PairingTypes.Struct[] | undefined> {
    if (typeof this.walletConnector === 'undefined') {
      console.error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
    }

    return (
      this.walletConnector?.core?.pairing?.pairings?.getAll({ active: true }) ??
      []
    );
  }

  /**
   * Signs a message and returns it signed
   * @param message
   */
  async signMessage(messageToSign: Message): Promise<Message> {
    const message = new Message({
      data: Buffer.from(messageToSign.data),
      address: messageToSign.address ?? this.account.address,
      signer: 'wallet-connect-v2',
      version: messageToSign.version,
    });

    if (typeof this.walletConnector === 'undefined') {
      console.error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
    }

    if (typeof this.session === 'undefined') {
      console.error(
        WalletConnectV2ProviderErrorMessagesEnum.sessionNotConnected
      );
      this.onClientConnect.onClientLogout();
      throw new Error(
        WalletConnectV2ProviderErrorMessagesEnum.sessionNotConnected
      );
    }

    try {
      const address = this.getAddress();
      const { signature }: { signature: string } =
        await this.walletConnector.request({
          chainId: `${WALLETCONNECT_MULTIVERSX_NAMESPACE}:${this.chainId}`,
          topic: getCurrentTopic(this.chainId, this.walletConnector),
          request: {
            method: Operation.SIGN_MESSAGE,
            params: {
              address,
              message: message.data.toString(),
            },
          },
        });

      if (!signature) {
        console.error(
          WalletConnectV2ProviderErrorMessagesEnum.invalidMessageResponse
        );
        throw new Error(
          WalletConnectV2ProviderErrorMessagesEnum.invalidMessageResponse
        );
      }

      try {
        message.signature = Buffer.from(signature, 'hex');
      } catch {
        console.error(
          WalletConnectV2ProviderErrorMessagesEnum.invalidMessageSignature
        );
        throw new Error(
          WalletConnectV2ProviderErrorMessagesEnum.invalidMessageSignature
        );
      }
    } catch {
      throw new Error(WalletConnectV2ProviderErrorMessagesEnum.unableToSign);
    }

    return message;
  }

  /**
   * Signs a transaction and returns it signed
   * @param transaction
   */
  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (typeof this.walletConnector === 'undefined') {
      console.error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
    }

    if (typeof this.session === 'undefined') {
      console.error(
        WalletConnectV2ProviderErrorMessagesEnum.sessionNotConnected
      );
      this.onClientConnect.onClientLogout();
      throw new Error(
        WalletConnectV2ProviderErrorMessagesEnum.sessionNotConnected
      );
    }

    const plainTransaction =
      TransactionsConverter.transactionToPlainObject(transaction);

    if (this.chainId !== transaction.chainID) {
      console.error(
        WalletConnectV2ProviderErrorMessagesEnum.requestDifferentChain
      );
      throw new Error(
        WalletConnectV2ProviderErrorMessagesEnum.requestDifferentChain
      );
    }

    try {
      const response: TransactionResponse = await this.walletConnector.request({
        chainId: `${WALLETCONNECT_MULTIVERSX_NAMESPACE}:${this.chainId}`,
        topic: getCurrentTopic(this.chainId, this.walletConnector),
        request: {
          method: Operation.SIGN_TRANSACTION,
          params: {
            transaction: plainTransaction,
          },
        },
      });

      return applyTransactionSignature({ transaction, response });
    } catch {
      throw new Error(
        WalletConnectV2ProviderErrorMessagesEnum.transactionError
      );
    }
  }

  /**
   * Signs an array of transactions and returns it signed
   * @param transactions
   */
  async signTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    if (typeof this.walletConnector === 'undefined') {
      console.error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
    }

    if (typeof this.session === 'undefined') {
      console.error(
        WalletConnectV2ProviderErrorMessagesEnum.sessionNotConnected
      );
      this.onClientConnect.onClientLogout();
      throw new Error(
        WalletConnectV2ProviderErrorMessagesEnum.sessionNotConnected
      );
    }

    const plainTransactions = transactions.map((transaction) => {
      if (this.chainId !== transaction.chainID) {
        console.error(
          WalletConnectV2ProviderErrorMessagesEnum.requestDifferentChain
        );
        throw new Error(
          WalletConnectV2ProviderErrorMessagesEnum.requestDifferentChain
        );
      }
      return TransactionsConverter.transactionToPlainObject(transaction);
    });

    try {
      const { signatures }: { signatures: TransactionResponse[] } =
        await this.walletConnector.request({
          chainId: `${WALLETCONNECT_MULTIVERSX_NAMESPACE}:${this.chainId}`,
          topic: getCurrentTopic(this.chainId, this.walletConnector),
          request: {
            method: Operation.SIGN_TRANSACTIONS,
            params: {
              transactions: plainTransactions,
            },
          },
        });

      if (!signatures) {
        console.error(
          WalletConnectV2ProviderErrorMessagesEnum.invalidTransactionResponse
        );
        throw new Error(
          WalletConnectV2ProviderErrorMessagesEnum.invalidTransactionResponse
        );
      }

      if (
        !Array.isArray(signatures) ||
        transactions.length !== signatures.length
      ) {
        throw new Error(
          WalletConnectV2ProviderErrorMessagesEnum.invalidTransactionResponse
        );
      }

      for (const [index, transaction] of transactions.entries()) {
        const response = signatures[index];
        applyTransactionSignature({ transaction, response });
      }

      return transactions;
    } catch {
      throw new Error(
        WalletConnectV2ProviderErrorMessagesEnum.transactionError
      );
    }
  }

  /**
   * Sends a custom request
   * @param request
   */

  async sendCustomRequest(options?: {
    request: EngineTypes.RequestParams['request'];
  }): Promise<any> {
    if (typeof this.walletConnector === 'undefined') {
      console.error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
    }

    if (typeof this.session === 'undefined') {
      console.error(
        WalletConnectV2ProviderErrorMessagesEnum.sessionNotConnected
      );
      this.onClientConnect.onClientLogout();
      throw new Error(
        WalletConnectV2ProviderErrorMessagesEnum.sessionNotConnected
      );
    }

    if (options?.request?.method) {
      try {
        const request = { ...options.request };
        const { method } = request;

        const { response }: { response: any } =
          await this.walletConnector.request({
            chainId: `${WALLETCONNECT_MULTIVERSX_NAMESPACE}:${this.chainId}`,
            topic: getCurrentTopic(this.chainId, this.walletConnector),
            request: { ...request, method },
          });

        if (!response) {
          console.error(
            WalletConnectV2ProviderErrorMessagesEnum.invalidCustomRequestResponse
          );
        }
      } catch {
        console.error(
          WalletConnectV2ProviderErrorMessagesEnum.invalidCustomRequestResponse
        );
      }

      return;
    }
  }

  /**
   * Ping helper
   */

  async ping(): Promise<boolean> {
    if (typeof this.walletConnector === 'undefined') {
      console.error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
    }

    if (typeof this.session === 'undefined') {
      console.error(
        WalletConnectV2ProviderErrorMessagesEnum.sessionNotConnected
      );
    }

    try {
      const topic = getCurrentTopic(this.chainId, this.walletConnector);
      await this.walletConnector.ping({
        topic,
      });
      return true;
    } catch {
      console.error(WalletConnectV2ProviderErrorMessagesEnum.pingFailed);
      return false;
    }
  }

  private async loginAccount(options?: {
    address: string;
    signature?: string;
  }): Promise<string> {
    if (!options) {
      return '';
    }

    if (addressIsValid(options.address)) {
      this.account.address = options.address;
      if (options.signature) {
        this.account.signature = options.signature;
      }
      this.onClientConnect.onClientLogin();

      return this.account.address;
    }

    console.error(
      `${WalletConnectV2ProviderErrorMessagesEnum.invalidAddress} ${options.address}`
    );
    if (this.walletConnector) {
      await this.logout();
    }

    return '';
  }

  private async onSessionConnected(options?: {
    session: SessionTypes.Struct;
    signature?: string;
  }): Promise<IProviderAccount | null> {
    if (!options) {
      return null;
    }

    this.session = options.session;
    this.account.signature = options.signature || '';

    const address = getAddressFromSession(options.session);

    if (address) {
      await this.loginAccount({ address, signature: options.signature });
      this.account.address = address;

      return this.account;
    }

    return null;
  }

  private async handleTopicUpdateEvent({
    topic,
  }: {
    topic: string;
  }): Promise<void> {
    if (typeof this.walletConnector === 'undefined') {
      console.error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
      return;
    }

    try {
      const existingPairings = await this.getPairings();

      if (this.account.address && !this.isInitializing && existingPairings) {
        if (existingPairings?.length === 0) {
          this.onClientConnect.onClientLogout();
        } else {
          const lastActivePairing =
            existingPairings[existingPairings.length - 1];

          if (lastActivePairing?.topic === topic) {
            this.onClientConnect.onClientLogout();
          }
        }
      }
    } catch {
      console.error(
        WalletConnectV2ProviderErrorMessagesEnum.unableToHandleTopic
      );
    } finally {
      this.pairings = await this.getPairings();
    }
  }

  private async handleSessionEvents({
    topic,
    params,
  }: {
    topic: string;
    params: SessionEventTypes;
  }): Promise<void> {
    if (typeof this.walletConnector === 'undefined') {
      throw new Error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
    }
    if (this.session && this.session?.topic !== topic) {
      return;
    }

    const { event } = params;
    if (
      event?.name &&
      getCurrentTopic(this.chainId, this.walletConnector) === topic
    ) {
      const eventData = event.data;

      this.onClientConnect.onClientEvent(eventData);
    }
  }

  private async subscribeToEvents(client: Client): Promise<void> {
    if (typeof client === 'undefined') {
      throw new Error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
    }

    try {
      // Session Events
      client.on('session_update', ({ topic, params }) => {
        if (!this.session || this.session?.topic !== topic) {
          return;
        }

        const { namespaces } = params;
        const _session = client.session.get(topic);
        const updatedSession = { ..._session, namespaces };
        this.onSessionConnected({ session: updatedSession });
      });

      client.on('session_event', this.handleSessionEvents.bind(this));

      client.on('session_delete', async ({ topic }) => {
        if (this.isInitializing) {
          this.onClientConnect.onClientLogout();
          this.disconnect();
        }

        if (!this.session || this.session?.topic !== topic) {
          return;
        }

        console.error(WalletConnectV2ProviderErrorMessagesEnum.sessionDeleted);

        this.onClientConnect.onClientLogout();

        this.disconnect();
        await this.cleanupPendingPairings({ deletePairings: true });
      });

      client.on('session_expire', async ({ topic }) => {
        if (!this.session || this.session?.topic !== topic) {
          return;
        }

        console.error(WalletConnectV2ProviderErrorMessagesEnum.sessionExpired);
        this.onClientConnect.onClientLogout();

        this.disconnect();
        await this.cleanupPendingPairings({ deletePairings: true });
      });

      // Pairing Events
      client.core?.pairing?.events.on(
        'pairing_delete',
        this.handleTopicUpdateEvent.bind(this)
      );

      client.core?.pairing?.events.on(
        'pairing_expire',
        this.handleTopicUpdateEvent.bind(this)
      );
    } catch {
      console.error(
        WalletConnectV2ProviderErrorMessagesEnum.unableToHandleEvent
      );
    }
  }

  private async checkPersistedState(
    client: Client
  ): Promise<SessionTypes.Struct | undefined> {
    if (typeof client === 'undefined') {
      throw new Error(WalletConnectV2ProviderErrorMessagesEnum.notInitialized);
    }

    this.pairings = await this.getPairings();

    if (typeof this.session !== 'undefined') {
      return;
    }

    // Populates existing session to state (assume only the top one)
    if (
      client.session.length &&
      !this.account.address &&
      !this.isInitializing
    ) {
      const session = getCurrentSession(this.chainId, client);
      if (session) {
        await this.onSessionConnected({ session });

        return session;
      }
    }

    return;
  }

  private async cleanupPendingPairings(
    options: { deletePairings?: boolean } = {}
  ): Promise<void> {
    if (typeof this.walletConnector === 'undefined') {
      return;
    }

    try {
      const inactivePairings =
        this.walletConnector.core?.pairing?.pairings?.getAll({ active: false });

      if (!isValidArray(inactivePairings)) {
        return;
      }

      for (const pairing of inactivePairings) {
        if (options.deletePairings) {
          this.walletConnector.core?.expirer?.set(pairing.topic, 0);
        } else {
          try {
            await this.walletConnector.core?.relayer?.subscriber?.unsubscribe(
              pairing.topic
            );
          } catch {
            console.error(
              WalletConnectV2ProviderErrorMessagesEnum.unableToHandleCleanup
            );
          }
        }
      }
    } catch {
      console.error(
        WalletConnectV2ProviderErrorMessagesEnum.unableToHandleCleanup
      );
    }
  }
}
