export interface ITransaction {
  sender: string;
  receiver: string;
  gasLimit: bigint;
  chainID: string;
  nonce: bigint;
  value: bigint;
  senderUsername: string;
  receiverUsername: string;
  gasPrice: bigint;
  data: Uint8Array;
  version: number;
  options: number;
  guardian: string;
  signature: Uint8Array;
  guardianSignature: Uint8Array;
}

export interface ISentTransactionResponse {
  txHash: string;
  receiver: string;
  sender: string;
  receiverShard: number;
  senderShard: number;
  status: string;
}

export interface ITransactionStatus {
  isPending(): boolean;
  isFailed(): boolean;
  isInvalid(): boolean;
  isExecuted(): boolean;
  isSuccessful(): boolean;
  valueOf(): string;
}

export interface ITransactionReceipt {
  data: string;
}

export interface ITransactionEventTopic {
  toString(): string;
  hex(): string;
}

export interface ITransactionEvent {
  readonly address: string;
  readonly identifier: string;
  readonly topics: ITransactionEventTopic[];
  readonly data: string;
  readonly dataPayload?: { valueOf(): Uint8Array };
  readonly additionalData?: { valueOf(): Uint8Array }[];

  findFirstOrNoneTopic(
    predicate: (topic: ITransactionEventTopic) => boolean
  ): ITransactionEventTopic | undefined;
  getLastTopic(): ITransactionEventTopic;
}

export interface ITransactionLogs {
  address: string;
  events: ITransactionEvent[];

  findSingleOrNoneEvent(
    identifier: string,
    predicate?: (event: ITransactionEvent) => boolean
  ): ITransactionEvent | undefined;
}

export interface IContractResultItem {
  hash: string;
  nonce: number;
  receiver: string;
  sender: string;
  data: string;
  returnMessage: string;
  logs: ITransactionLogs;
  previousHash?: string;
}

export interface IContractResults {
  items: IContractResultItem[];
}

export interface ITransactionOnNetwork {
  isCompleted?: boolean;
  hash: string;
  type: string;
  value: string;
  receiver: string;
  sender: string;
  function?: string;
  data: Uint8Array;
  status: ITransactionStatus;
  receipt: ITransactionReceipt;
  contractResults: IContractResults;
  logs: ITransactionLogs;
}

export interface ITransactionFetcher {
  /**
   * Fetches the state of a {@link Transaction}.
   */
  getTransaction(txHash: string): Promise<ITransactionOnNetwork>;
}

export interface IPlainTransactionObject extends Record<string, unknown> {
  nonce: number;
  value: string;
  receiver: string;
  sender: string;
  receiverUsername?: string;
  senderUsername?: string;
  guardian?: string;
  gasPrice: number;
  gasLimit: number;
  data?: string;
  chainID: string;
  version: number;
  options?: number;
  signature?: string;
  guardianSignature?: string;
  relayer?: string;
  innerTransactions?: IPlainTransactionObject[];
}

// Webview related types
export enum SignMessageStatusEnum {
  pending = 'pending',
  failed = 'failed',
  signed = 'signed',
  cancelled = 'cancelled',
}

export enum WindowProviderRequestEnums {
  signTransactionsRequest = 'SIGN_TRANSACTIONS_REQUEST',
  guardTransactionsRequest = 'GUARD_TRANSACTIONS_REQUEST',
  signMessageRequest = 'SIGN_MESSAGE_REQUEST',
  loginRequest = 'LOGIN_REQUEST',
  logoutRequest = 'LOGOUT_REQUEST',
  cancelAction = 'CANCEL_ACTION_REQUEST',
  finalizeHandshakeRequest = 'FINALIZE_HANDSHAKE_REQUEST',
  finalizeResetStateRequest = 'FINALIZE_RESET_STATE_REQUEST',
}

export enum WindowProviderResponseEnums {
  handshakeResponse = 'HANDSHAKE_RESPONSE',
  guardTransactionsResponse = 'GUARD_TRANSACTIONS_RESPONSE',
  loginResponse = 'LOGIN_RESPONSE',
  disconnectResponse = 'DISCONNECT_RESPONSE',
  cancelResponse = 'CANCEL_RESPONSE',
  signTransactionsResponse = 'SIGN_TRANSACTIONS_RESPONSE',
  signMessageResponse = 'SIGN_MESSAGE_RESPONSE',
  noneResponse = 'NONE_RESPONSE',
  resetStateResponse = 'RESET_STATE_RESPONSE',
}

export type ReplyWithPostMessageObjectType = {
  [WindowProviderResponseEnums.handshakeResponse]: boolean;
  [WindowProviderResponseEnums.loginResponse]: {
    address: string;
    signature: string;
    accessToken?: string;
    /**
     * contract address for alternate multisig login
     * */
    multisig?: string;
    /**
     * custom address for alternate login
     * */
    impersonate?: string;
  };
  [WindowProviderResponseEnums.disconnectResponse]: boolean;
  [WindowProviderResponseEnums.cancelResponse]: {
    address: string;
  };
  [WindowProviderResponseEnums.signTransactionsResponse]: IPlainTransactionObject[];
  [WindowProviderResponseEnums.guardTransactionsResponse]: IPlainTransactionObject[];
  [WindowProviderResponseEnums.signMessageResponse]: {
    signature?: string;
    status: SignMessageStatusEnum;
  };
  [WindowProviderResponseEnums.noneResponse]: null;
  [WindowProviderResponseEnums.resetStateResponse]: boolean;
};

export type RequestPayloadType = {
  [WindowProviderRequestEnums.loginRequest]: {
    token: string | undefined;
  };
  [WindowProviderRequestEnums.logoutRequest]: undefined;
  [WindowProviderRequestEnums.signTransactionsRequest]: IPlainTransactionObject[];
  [WindowProviderRequestEnums.guardTransactionsRequest]: IPlainTransactionObject[];
  [WindowProviderRequestEnums.signMessageRequest]: {
    message: string;
  };
  [WindowProviderRequestEnums.cancelAction]: undefined;
  [WindowProviderRequestEnums.finalizeHandshakeRequest]: undefined;
  [WindowProviderRequestEnums.finalizeResetStateRequest]: undefined;
};

export type ResponseTypeMap = {
  [WindowProviderRequestEnums.signTransactionsRequest]: WindowProviderResponseEnums.signTransactionsResponse;
  [WindowProviderRequestEnums.signMessageRequest]: WindowProviderResponseEnums.signMessageResponse;
  [WindowProviderRequestEnums.loginRequest]: WindowProviderResponseEnums.loginResponse;
  [WindowProviderRequestEnums.logoutRequest]: WindowProviderResponseEnums.disconnectResponse;
  [WindowProviderRequestEnums.guardTransactionsRequest]: WindowProviderResponseEnums.guardTransactionsResponse;
  [WindowProviderRequestEnums.cancelAction]: WindowProviderResponseEnums.cancelResponse;
  [WindowProviderRequestEnums.finalizeHandshakeRequest]: WindowProviderResponseEnums.noneResponse;
  [WindowProviderRequestEnums.finalizeResetStateRequest]: WindowProviderResponseEnums.resetStateResponse;
};

export type ReplyWithPostMessagePayloadType<
  K extends keyof ReplyWithPostMessageObjectType,
> = {
  data?: ReplyWithPostMessageObjectType[K];
  error?: string;
};

export interface PostMessageParamsType<T extends WindowProviderRequestEnums> {
  type: T;
  payload: RequestPayloadType[keyof RequestPayloadType];
}

export interface PostMessageReturnType<T extends WindowProviderRequestEnums> {
  type: ResponseTypeMap[T] | WindowProviderResponseEnums.cancelResponse;
  payload: ReplyWithPostMessagePayloadType<ResponseTypeMap[T]>;
}
