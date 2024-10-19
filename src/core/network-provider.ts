// Based on Multiversx sdk-core with modifications

import { TransactionStatus } from '../core/transaction-status';
import { networkConfig, defaultChainTypeConfig } from '../utils/constants';
import { InitOptions } from '../types';
import { bytesFromBase64, stringToHex } from './utils';
import { Transaction } from './transaction';
import { TransactionsConverter } from './transaction-converter';

export interface SmartContractQueryArgs {
  address: string;
  func: string;
  // TODO: this won't be only string, to rethink, maybe serializers from SDK will be needed
  args?: string[];
  value?: number;
  caller?: string;
}

export interface SmartContractQueryResponse {
  returnData: string;
  returnCode: string;
  returnMessage: string;
}

export type NetworkProviderOptions = Pick<
  InitOptions,
  'apiUrl' | 'chainType' | 'apiTimeout'
>;

export interface AccountOnNetwork {
  address: string;
  nonce: number;
  balance: bigint;
  code: string;
  userName: string;
}

export interface Guardian {
  activationEpoch: number;
  address: string;
  serviceUID: string;
}

export interface GuardianData {
  guarded: boolean;
  activeGuardian?: Guardian;
  pendingGuardian?: Guardian;
}

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

  async sendTransaction(tx: Transaction): Promise<string> {
    const sendableTx = TransactionsConverter.transactionToPlainObject(tx);
    const response = await this.apiPost('transactions', sendableTx);
    return response.txHash;
  }

  async getAccount(address: string) {
    const responsePayload = await this.apiGet(`accounts/${address}`);

    const account = {
      address: responsePayload?.address || '',
      nonce: Number(responsePayload?.nonce || 0),
      balance: responsePayload?.balance,
      code: responsePayload?.code || '',
      userName: responsePayload?.username || '',
    };

    return account;
  }

  async getGuardianData(address: string): Promise<GuardianData> {
    const response = await this.apiGet(`address/${address}/guardian-data`);

    const accountGuardian = {
      guarded: response?.data?.guardianData?.guarded || false,
      activeGuardian: response?.data?.guardianData?.activeGuardian,
      pendingGuardian: response?.data?.guardianData?.pendingGuardian,
    };

    return accountGuardian;
  }

  async getTransaction(txHash: string) {
    const payload = await this.apiGet(`transactions/${txHash}`);

    const status = new TransactionStatus(payload.status);

    // TODO: review, data types, what is really needed etc.
    const transaction = {
      hash: txHash,
      type: payload.type || '',
      nonce: payload.nonce || 0,
      round: payload.round,
      epoch: payload.epoch || 0,
      value: (payload.value || 0).toString(),
      sender: payload.sender,
      receiver: payload.receiver,
      gasPrice: payload.gasPrice || 0,
      gasLimit: payload.gasLimit || 0,
      data: bytesFromBase64(payload.data || ''),
      status,
      timestamp: payload.timestamp || 0,
      blockNonce: payload.blockNonce || 0,
      hyperblockNonce: payload.hyperblockNonce || 0,
      hyperblockHash: payload.hyperblockHash || '',
      receipt: payload.receipt,
      logs: payload.logs,
      contractResults: payload.results || [],
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
  }: SmartContractQueryArgs) {
    try {
      const request = {
        scAddress: address,
        caller,
        funcName: func,
        value,
        // TODO: it will need to react to different values, probably serializers from SDK are needed
        args: () => args?.map((arg) => stringToHex(arg)),
      };

      const response = await this.apiPost('query', request);

      return {
        returnData: response.returnData,
        returnCode: response.returnCode,
        returnMessage: response.returnMessage,
      };
    } catch (e) {
      this.handleApiError(e, 'query');
    }
  }
}
