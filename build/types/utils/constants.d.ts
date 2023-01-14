interface NetworkType {
    id: string;
    shortId: string;
    name: string;
    egldLabel: string;
    egldDenomination: string;
    decimals: string;
    gasPerDataByte: string;
    walletAddress: string;
    apiAddress: string;
    explorerAddress: string;
    apiTimeout: number;
}
export declare const LOCAL_STORAGE_KEY = "elvenjs_state";
export declare const defaultApiEndpoint = "https://devnet-api.multiversx.com";
export declare const DEFAULT_MIN_GAS_LIMIT = 50000;
export declare const DAPP_CONFIG_ENDPOINT = "/dapp/config";
export declare const DAPP_INIT_ROUTE = "/dapp/init";
export declare const defaultChainTypeConfig = "devnet";
export declare const walletConnectDeepLink = "https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://xportal.com/";
export declare const defaultWalletConnectV2RelayAddresses: string[];
export declare const networkConfig: Record<string, NetworkType>;
export {};
