/**
 * Required for xPortal Hub integration
 * Based on sdk-dapp webview provider implementation
 * It will probably be replaced with separate library in the future
 */
export type CustomRequestPayloadType = {
    request: {
        method: string;
        params: any;
    };
};
export declare const requestMethods: {
    signTransactions: {
        ios: (transactions: any) => any;
        reactNative: (message: any) => any;
        web: (message: any) => any;
    };
    signMessage: {
        ios: (message: string) => any;
        reactNative: (message: any) => any;
        web: (message: any) => any;
    };
    logout: {
        ios: () => any;
        reactNative: () => any;
        web: () => any;
    };
};
