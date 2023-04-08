import BigNumber from 'bignumber.js';
import { Address } from '@multiversx/sdk-core/out/address';
import { TransactionStatus } from '@multiversx/sdk-network-providers/out/transactionStatus';
import { TransactionReceipt } from '@multiversx/sdk-network-providers/out/transactionReceipt';
import { TransactionLogs } from '@multiversx/sdk-network-providers/out/transactionLogs';
import { ContractResults } from '@multiversx/sdk-network-providers/out/contractResults';
import { ContractQueryResponse } from '@multiversx/sdk-network-providers/out/contractQueryResponse';
import { ContractQueryRequest } from '@multiversx/sdk-network-providers/out/contractQueryRequest';
import { Query } from '@multiversx/sdk-core/out/smartcontracts/query';
import { QueryArguments } from '@multiversx/sdk-core/out/smartcontracts/interface';
import { networkConfig, defaultChainTypeConfig } from './utils/constants';
import { InitOptions } from './types';

export interface IAddress {
  bech32: () => string;
}

export interface SmartContractQueryArgs extends QueryArguments {
  address: IAddress;
}

export type NetworkProviderOptions = Pick<
  InitOptions,
  'apiUrl' | 'chainType' | 'apiTimeout'
>;

export interface AccountOnNetwork {
  address: IAddress;
  nonce: number;
  balance: BigNumber;
  code: string;
  userName: string;
}

export interface ITransaction {
  toSendable(): any;
}

// This is a simplified version of ApiNetworkProvider,
// basic helpers, all other stuff isn't required for now

export class ApiNetworkProvider {
  private apiUrl: string;
  private chainType: string;
  private apiTimeout: number;

  constructor({ apiUrl, chainType, apiTimeout }: NetworkProviderOptions) {
    this.chainType = chainType || defaultChainTypeConfig;
    this.apiUrl = apiUrl || networkConfig[this.chainType]?.apiAddress;
    this.apiTimeout = apiTimeout || networkConfig[this.chainType]?.apiTimeout;
  }

  private async apiGet(endpoint: string, options?: Record<string, unknown>) {
    if (typeof fetch !== 'undefined') {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.apiTimeout);

      const defaultOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        signal: controller.signal,
      };

      try {
        const response = await fetch(
          this.apiUrl + '/' + endpoint,
          Object.assign(defaultOptions, options || {})
        );

        const result = await response.json();

        if (!response.ok) {
          const error = result?.error || response.status;
          clearTimeout(timeoutId);
          return Promise.reject(error);
        }

        clearTimeout(timeoutId);
        return result;
      } catch (e) {
        this.handleApiError(e, endpoint);
      }
    }
  }

  private async apiPost(
    endpoint: string,
    payload: Record<string, unknown>,
    options?: Record<string, unknown>
  ) {
    if (typeof fetch !== 'undefined') {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.apiTimeout);

      const defaultOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload || {}),
        signal: controller.signal,
      };

      try {
        const response = await fetch(
          this.apiUrl + '/' + endpoint,
          Object.assign(defaultOptions, options || {})
        );

        const result = await response.json();

        if (!response.ok) {
          const error = result?.error || response.status;
          clearTimeout(timeoutId);
          return Promise.reject(error);
        }

        clearTimeout(timeoutId);
        return result;
      } catch (e) {
        this.handleApiError(e, endpoint);
      }
    }
  }

  private handleApiError(error: any, resourceUrl: string) {
    if (!error.response) {
      throw new Error(
        `Request error on url [${resourceUrl}]: [${error.toString()}]`
      );
    }

    const errorData = error.response.data;
    const originalErrorMessage =
      errorData.error || errorData.message || JSON.stringify(errorData);
    throw new Error(originalErrorMessage);
  }

  async sendTransaction(tx: ITransaction): Promise<string> {
    const response = await this.apiPost('transactions', tx.toSendable());
    return response.txHash;
  }

  async getAccount(address: IAddress): Promise<AccountOnNetwork> {
    const responsePayload = await this.apiGet(`accounts/${address.bech32()}`);

    const account = {
      address: new Address(responsePayload?.address || ''),
      nonce: Number(responsePayload?.nonce || 0),
      balance: new BigNumber(responsePayload?.balance || 0),
      code: responsePayload?.code || '',
      userName: responsePayload?.username || '',
    };

    return account;
  }

  async getTransaction(txHash: string) {
    const payload = await this.apiGet(`transactions/${txHash}`);

    const status = new TransactionStatus(payload.status);

    const transaction = {
      hash: txHash,
      type: payload.type || '',
      nonce: payload.nonce || 0,
      round: payload.round,
      epoch: payload.epoch || 0,
      value: (payload.value || 0).toString(),
      sender: new Address(payload.sender),
      receiver: new Address(payload.receiver),
      gasPrice: payload.gasPrice || 0,
      gasLimit: payload.gasLimit || 0,
      data: Buffer.from(payload.data || '', 'base64'),
      status,
      timestamp: payload.timestamp || 0,

      blockNonce: payload.blockNonce || 0,
      hyperblockNonce: payload.hyperblockNonce || 0,
      hyperblockHash: payload.hyperblockHash || '',

      receipt: TransactionReceipt.fromHttpResponse(payload.receipt || {}),
      logs: TransactionLogs.fromHttpResponse(payload.logs || {}),

      contractResults: ContractResults.fromApiHttpResponse(
        payload.results || []
      ),
      isCompleted: !status.isPending(),
    };

    return transaction;
  }

  async queryContract({
    address,
    func,
    args,
    value,
    caller,
  }: SmartContractQueryArgs): Promise<ContractQueryResponse | undefined> {
    try {
      const query = new Query({
        address,
        func,
        args,
        value,
        caller,
      });
      const request = new ContractQueryRequest(query).toHttpRequest();
      const response = await this.apiPost('query', request);
      return ContractQueryResponse.fromHttpResponse(response);
    } catch (e) {
      this.handleApiError(e, 'query');
    }
  }
}
