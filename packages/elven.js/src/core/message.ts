// Based on Multiversx sdk-core with modifications

import {
  DEFAULT_MESSAGE_VERSION,
  MESSAGE_PREFIX,
  SDK_JS_SIGNER,
  UNKNOWN_SIGNER,
} from './constants';
import { keccak256 } from './keccak256';
import { bytesToHex, combineBytes, hexToBytes, stringToBytes } from './utils';

export class Message {
  /**
   * Actual message being signed.
   */
  public data: Uint8Array;
  /**
   * The message signature.
   */
  public signature?: Uint8Array;
  /**
   * Address of the wallet that performed the signing operation.
   */
  public address?: string;
  /**
   * Number representing the message version.
   */
  public version: number;
  /**
   * The library or tool that was used to sign the message.
   */
  public signer: string;

  constructor(options: {
    data: Uint8Array;
    signature?: Uint8Array;
    address?: string;
    version?: number;
    signer?: string;
  }) {
    this.data = options.data;
    this.signature = options.signature;
    this.address = options.address;
    this.version = options.version || DEFAULT_MESSAGE_VERSION;
    this.signer = options.signer || SDK_JS_SIGNER;
  }
}

export class MessageComputer {
  constructor() {}

  computeBytesForSigning(message: Message): Uint8Array {
    const messageSize = stringToBytes(message.data.length.toString());
    const signableMessage = combineBytes([messageSize, message.data]);
    const bytes = combineBytes([
      stringToBytes(MESSAGE_PREFIX),
      signableMessage,
    ]);

    return keccak256(bytes);
  }

  computeBytesForVerifying(message: Message): Uint8Array {
    return this.computeBytesForSigning(message);
  }

  packMessage(message: Message): {
    message: string;
    signature: string;
    address: string;
    version: number;
    signer: string;
  } {
    return {
      message: bytesToHex(message.data),
      signature: message.signature ? bytesToHex(message.signature) : '',
      address: message.address || '',
      version: message.version,
      signer: message.signer,
    };
  }

  unpackMessage(packedMessage: {
    message: string;
    signature?: string;
    address?: string;
    version?: number;
    signer?: string;
  }): Message {
    const dataHex = this.trimHexPrefix(packedMessage.message);
    const data = hexToBytes(dataHex);

    const signatureHex = this.trimHexPrefix(packedMessage.signature || '');
    const signature = hexToBytes(signatureHex);

    let address: string | undefined = undefined;
    if (packedMessage.address) {
      address = packedMessage.address;
    }

    const version = packedMessage.version || DEFAULT_MESSAGE_VERSION;
    const signer = packedMessage.signer || UNKNOWN_SIGNER;

    return new Message({
      data: data,
      signature: signature,
      address: address,
      version: version,
      signer: signer,
    });
  }

  private trimHexPrefix(data: string): string {
    if (data.startsWith('0x') || data.startsWith('0X')) {
      return data.slice(2);
    }
    return data;
  }
}
