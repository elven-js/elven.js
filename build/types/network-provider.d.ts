/// <reference types="node" />
import BigNumber from 'bignumber.js';
import { Address } from '@multiversx/sdk-core/out/address';
import { TransactionStatus } from '@multiversx/sdk-network-providers/out/transactionStatus';
import { TransactionReceipt } from '@multiversx/sdk-network-providers/out/transactionReceipt';
import { TransactionLogs } from '@multiversx/sdk-network-providers/out/transactionLogs';
import { ContractResults } from '@multiversx/sdk-network-providers/out/contractResults';
import { ContractQueryResponse } from '@multiversx/sdk-network-providers/out/contractQueryResponse';
import { QueryArguments } from '@multiversx/sdk-core/out/smartcontracts/interface';
import { InitOptions } from './types';
export interface IAddress {
    bech32: () => string;
}
export interface SmartContractQueryArgs extends QueryArguments {
    address: IAddress;
}
export type NetworkProviderOptions = Pick<InitOptions, 'apiUrl' | 'chainType' | 'apiTimeout'>;
export interface AccountOnNetwork {
    address: IAddress;
    nonce: number;
    balance: BigNumber;
    code: string;
    userName: string;
}
export interface Guardian {
    activationEpoch: number;
    address: IAddress;
    serviceUID: string;
}
export interface GuardianData {
    guarded: boolean;
    activeGuardian?: Guardian;
    pendingGuardian?: Guardian;
}
export interface ITransaction {
    toSendable(): any;
}
export declare class ApiNetworkProvider {
    private apiUrl;
    private chainType;
    private apiTimeout;
    constructor({ apiUrl, chainType, apiTimeout }: NetworkProviderOptions);
    private apiGet;
    private apiPost;
    private handleApiError;
    sendTransaction(tx: ITransaction): Promise<string>;
    getAccount(address: IAddress): Promise<AccountOnNetwork>;
    getGuardianData(address: IAddress): Promise<GuardianData>;
    getTransaction(txHash: string): Promise<{
        hash: string;
        type: any;
        nonce: any;
        round: any;
        epoch: any;
        value: any;
        sender: Address;
        receiver: Address;
        gasPrice: any;
        gasLimit: any;
        data: Buffer;
        status: TransactionStatus;
        timestamp: any;
        blockNonce: any;
        hyperblockNonce: any;
        hyperblockHash: any;
        receipt: TransactionReceipt;
        logs: TransactionLogs;
        contractResults: ContractResults;
        isCompleted: boolean;
    }>;
    queryContract({ address, func, args, value, caller, }: SmartContractQueryArgs): Promise<ContractQueryResponse | undefined>;
}
