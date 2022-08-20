import { Transaction } from '@elrondnetwork/erdjs/out/transaction';
import { ApiNetworkProvider, InitOptions } from './network-provider';
import { DappProvider, LoginMethodsEnum, LoginOptions } from './types';
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
