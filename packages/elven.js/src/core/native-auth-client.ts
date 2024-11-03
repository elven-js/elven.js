// Based on Multiversx sdk-core with modifications

import { stringToHex } from './utils';

// TODO: review what is really needed regarding the gateway and api fallbacks

class NativeAuthClientConfig {
  origin: string =
    typeof window !== 'undefined' && typeof window.location !== 'undefined'
      ? window.location.hostname
      : '';
  apiUrl: string = 'https://api.multiversx.com';
  expirySeconds: number = 60 * 60 * 24;
  blockHashShard?: number;
  gatewayUrl?: string;
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
    if (this.config.gatewayUrl) {
      return await this.getCurrentBlockHashWithGateway();
    }
    return await this.getCurrentBlockHashWithApi();
  }

  private async getCurrentBlockHashWithGateway(): Promise<string> {
    const round = await this.getCurrentRound();
    const url = `${this.config.gatewayUrl}/blocks/by-round/${round}`;
    const response = await this.get(url);
    const blocks = response.data.data.blocks;
    const block = blocks.filter(
      (block: { shard: number }) => block.shard === this.config.blockHashShard
    )[0];
    return block.hash;
  }

  private async getCurrentRound(): Promise<number> {
    if (!this.config.gatewayUrl) {
      throw new Error('Gateway URL not set');
    }
    if (!this.config.blockHashShard) {
      throw new Error('Blockhash shard not set');
    }

    const url = `${this.config.gatewayUrl}/network/status/${this.config.blockHashShard}`;
    const response = await this.get(url);
    const status = response.data.data.status;
    return status.erd_current_round;
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
    return this.escape(stringToHex(str));
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
