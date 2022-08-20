interface BaseNetworkType {
    id: string;
    shortId: string;
    name: string;
    egldLabel: string;
    egldDenomination: string;
    decimals: string;
    gasPerDataByte: string;
    walletConnectDeepLink: string;
    walletAddress: string;
    apiAddress: string;
    explorerAddress: string;
    apiTimeout: number;
}
interface NetworkType extends BaseNetworkType {
    walletConnectBridgeAddresses: string[];
}
export declare const LOCAL_STORAGE_KEY = "elvenjs_state";
export declare const defaultApiEndpoint = "https://devnet-api.elrond.com";
export declare const DEFAULT_MIN_GAS_LIMIT = 50000;
export declare const DAPP_CONFIG_ENDPOINT = "/dapp/config";
export declare const DAPP_INIT_ROUTE = "/dapp/init";
export declare const chainTypeConfig = "devnet";
export declare const networkConfig: Record<string, NetworkType>;
export {};
