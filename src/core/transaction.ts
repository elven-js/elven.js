// Based on Multiversx sdk-core with modifications

import {
  TRANSACTION_MIN_GAS_PRICE,
  TRANSACTION_OPTIONS_DEFAULT,
  TRANSACTION_VERSION_DEFAULT,
} from './constants';
import { ITransaction } from './types';

/**
 * An abstraction for creating and signing transactions.
 */
export class Transaction {
  /**
   * The nonce of the transaction (the account sequence number of the sender).
   */
  public nonce: bigint;

  /**
   * The value to transfer.
   */
  public value: bigint;

  /**
   * The address of the sender, in bech32 format.
   */
  public sender: string;

  /**
   * The address of the receiver, in bech32 format.
   */
  public receiver: string;

  /**
   * The username of the sender.
   */
  public senderUsername: string;

  /**
   * The username of the receiver.
   */
  public receiverUsername: string;

  /**
   * The gas price to be used.
   */
  public gasPrice: bigint;

  /**
   * The maximum amount of gas to be consumed when processing the transaction.
   */
  public gasLimit: bigint;

  /**
   * The payload of the transaction.
   */
  public data: Uint8Array;

  /**
   * The chain ID of the Network (e.g. "1" for Mainnet).
   */
  public chainID: string;

  /**
   * The version, required by the Network in order to correctly interpret the contents of the transaction.
   */
  public version: number;

  /**
   * The options field, useful for describing different settings available for transactions.
   */
  public options: number;

  /**
   * The address of the guardian, in bech32 format.
   */
  public guardian: string;

  /**
   * The signature.
   */
  public signature: Uint8Array;

  /**
   * The signature of the guardian.
   */
  public guardianSignature: Uint8Array;

  /**
   * The relayer in case it is a relayedV3 Transaction.
   */
  public relayer: string;

  /**
   * The inner transactions in case it is a relayedV3 Transaction.
   */
  public innerTransactions: ITransaction[];

  /**
   * Creates a new Transaction object.
   */
  public constructor(options: {
    nonce?: bigint;
    value?: bigint;
    sender: string;
    receiver: string;
    senderUsername?: string;
    receiverUsername?: string;
    gasPrice?: bigint;
    gasLimit: bigint;
    data?: Uint8Array;
    chainID: string;
    version?: number;
    options?: number;
    guardian?: string;
    signature?: Uint8Array;
    guardianSignature?: Uint8Array;
    relayer?: string;
    innerTransactions?: ITransaction[];
  }) {
    this.nonce = BigInt(options.nonce?.valueOf() || 0n);
    this.value = options.value ?? 0n;
    this.sender = this.addressAsBech32(options.sender);
    this.receiver = this.addressAsBech32(options.receiver);
    this.senderUsername = options.senderUsername || '';
    this.receiverUsername = options.receiverUsername || '';
    this.gasPrice = BigInt(
      options.gasPrice?.valueOf() || TRANSACTION_MIN_GAS_PRICE
    );
    this.gasLimit = BigInt(options.gasLimit.valueOf());
    this.data = options.data?.valueOf() || new Uint8Array();
    this.chainID = options.chainID.valueOf();
    this.version = Number(
      options.version?.valueOf() || TRANSACTION_VERSION_DEFAULT
    );
    this.options = Number(
      options.options?.valueOf() || TRANSACTION_OPTIONS_DEFAULT
    );
    this.guardian = options.guardian
      ? this.addressAsBech32(options.guardian)
      : '';

    this.signature = options.signature || new Uint8Array([]);
    this.guardianSignature = options.guardianSignature || new Uint8Array([]);

    this.relayer = options.relayer || '';
    this.innerTransactions = options.innerTransactions || [];
  }

  private addressAsBech32(address: string): string {
    return address;
  }

  /**
   * Checks the integrity of the guarded transaction
   */
  isGuardedTransaction(): boolean {
    const hasGuardian = this.guardian.length > 0;
    const hasGuardianSignature = this.guardianSignature.length > 0;
    return hasGuardian && hasGuardianSignature;
  }
}
