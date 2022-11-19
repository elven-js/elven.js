/// <reference types="node" />
import BigNumber from 'big.js';
import { Address } from '@elrondnetwork/erdjs/out/address';
import { TransactionStatus } from '@elrondnetwork/erdjs-network-providers/out/transactionStatus';
import { TransactionReceipt } from '@elrondnetwork/erdjs-network-providers/out/transactionReceipt';
import { TransactionLogs } from '@elrondnetwork/erdjs-network-providers/out/transactionLogs';
import { ContractResults } from '@elrondnetwork/erdjs-network-providers/out/contractResults';
import { ContractQueryResponse } from '@elrondnetwork/erdjs-network-providers/out/contractQueryResponse';
import { QueryArguments } from '@elrondnetwork/erdjs/out/smartcontracts/interface';
import { Buffer } from 'buffer';
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
