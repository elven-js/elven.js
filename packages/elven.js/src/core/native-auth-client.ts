// Based on Multiversx sdk-core with modifications

import { toBase64FromStringOrBytes } from './utils';

class NativeAuthClientConfig {
  origin: string =
    typeof window !== 'undefined' && typeof window.location !== 'undefined'
      ? window.location.hostname
      : '';
  apiUrl: string = 'https://api.multiversx.com';
  expirySeconds: number = 60 * 60 * 2;
  blockHashShard?: number;
  extraRequestHeaders?: { [key: string]: string };
}

export class NativeAuthClient {
  private readonly config: NativeAuthClientConfig;

  constructor(config?: Partial<NativeAuthClientConfig>) {
    this.config = Object.assign(new NativeAuthClientConfig(), config);
  }

  getToken(address: string, token: string, signature: string): string {
    const encodedAddress = this.encodeValue(address);
    const encodedToken = this.encodeValue(token);

    const accessToken = `${encodedAddress}.${encodedToken}.${signature}`;
    return accessToken;
  }

  async initialize(extraInfo: any = {}): Promise<string> {
    const blockHash = await this.getCurrentBlockHash();
    const encodedExtraInfo = this.encodeValue(JSON.stringify(extraInfo));
    const origin = this.encodeValue(this.config.origin);

    return `${origin}.${blockHash}.${this.config.expirySeconds}.${encodedExtraInfo}`;
  }

  async getCurrentBlockHash(): Promise<string> {
    return await this.getCurrentBlockHashWithApi();
  }

  private async getCurrentBlockHashWithApi(): Promise<string> {
    const url = `${this.config.apiUrl}/blocks/latest?ttl=${this.config.expirySeconds}&fields=hash`;
    const response = await this.get(url);
    if (response.hash !== undefined) {
      return response.hash;
    }
    return this.getCurrentBlockHashWithApiFallback();
  }

  private async getCurrentBlockHashWithApiFallback(): Promise<string> {
    let url = `${this.config.apiUrl}/blocks?size=1&fields=hash`;
    if (this.config.blockHashShard !== undefined) {
      url += `&shard=${this.config.blockHashShard}`;
    }

    const response = await this.get(url);
    return response.hash;
  }

  encodeValue(str: string) {
    return this.escape(toBase64FromStringOrBytes(str));
  }

  private escape(str: string) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  private async get(url: string): Promise<any> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.config.extraRequestHeaders,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      throw error; // Rethrow the error for external handling if needed
    }
  }
}
