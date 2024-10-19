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
  relayer: string;
  innerTransactions: ITransaction[];
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
