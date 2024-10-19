// Based on Multiversx sdk-core with modifications

import {
  DEFAULT_MESSAGE_VERSION,
  MESSAGE_PREFIX,
  SDK_JS_SIGNER,
  UNKNOWN_SIGNER,
} from './constants';

import { keccak_256 } from 'js-sha3';

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
    const messageSize = Buffer.from(message.data.length.toString());
    const signableMessage = Buffer.concat([messageSize, message.data]);
    const bytesToHash = Buffer.concat([
      Buffer.from(MESSAGE_PREFIX),
      signableMessage,
    ]);

    return new Uint8Array(keccak_256.update(bytesToHash).digest());
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
      message: Buffer.from(message.data).toString('hex'),
      signature: message.signature
        ? Buffer.from(message.signature).toString('hex')
        : '',
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
    const data = Buffer.from(dataHex, 'hex');

    const signatureHex = this.trimHexPrefix(packedMessage.signature || '');
    const signature = Buffer.from(signatureHex, 'hex');

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
