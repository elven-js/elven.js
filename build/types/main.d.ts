import { Transaction } from '@elrondnetwork/erdjs/out/transaction';
import { ApiNetworkProvider, SmartContractQueryArgs } from './network-provider';
import { DappProvider, LoginMethodsEnum, LoginOptions, InitOptions } from './types';
export declare class ElvenJS {
    private static initOptions;
    static dappProvider: DappProvider;
    static networkProvider: ApiNetworkProvider | undefined;
    /**
     * Initialization of the Elven.js
     */
    static init(options: InitOptions): Promise<boolean | undefined>;
    /**
     * Login function
     */
    static login(loginMethod: LoginMethodsEnum, options?: LoginOptions): Promise<void>;
    /**
     * Logout function
     */
    static logout(): Promise<any>;
    /**
     * Sign and send function
     */
    static signAndSendTransaction(transaction: Transaction): Promise<Transaction>;
    /**
     * Query Smart Contracts
     */
    static queryContract({ address, func, args, value, caller, }: SmartContractQueryArgs): Promise<import("@elrondnetwork/erdjs-network-providers/out/contractQueryResponse").ContractQueryResponse | undefined>;
    /**
     * Main storage exposed
     */
    static storage: {
        get(key?: string | undefined): any;
        set(key: string, value: string | number): void;
        clear(): void;
    };
    /**
     * Destroy and cleanup if needed
     */
    static destroy: () => void;
}
