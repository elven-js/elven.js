import { bytesToHex, hexToBytes, isValidHex } from './utils';

/**
 * An abstraction representing an account (user or Smart Contract) on the Network.
 */
export class Account {
  /**
   * The address of the account.
   */
  readonly address = new Uint8Array([]);

  /**
   * The nonce of the account (the account sequence number).
   */
  nonce = 0;

  /**
   * The balance of the account.
   */
  balance = '0';

  constructor(address: string) {
    if (isValidHex(address)) {
      this.address = hexToBytes(address);
    }
  }

  /**
   * Updates account properties (such as nonce, balance).
   */
  update(obj: { nonce: number; balance: string }) {
    this.nonce = obj.nonce;
    this.balance = obj.balance;
  }

  /**
   * Increments (locally) the nonce (the account sequence number).
   */
  incrementNonce() {
    this.nonce = this.nonce + 1;
  }

  /**
   * Gets then increments (locally) the nonce (the account sequence number).
   */
  getNonceThenIncrement() {
    const nonce = this.nonce;
    this.nonce = this.nonce + 1;
    return nonce;
  }

  /**
   * Converts the account to a pretty, plain JavaScript object.
   */
  toJSON() {
    return {
      address: bytesToHex(this.address),
      nonce: this.nonce,
      balance: this.balance,
    };
  }

  bech32() {
    return bytesToHex(this.address);
  }
}
