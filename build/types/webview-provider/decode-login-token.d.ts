/**
 * Required for xPortal Hub integration
 * Based on sdk-dapp webview provider implementation
 * It will probably be replaced with separate library in the future
 */
export interface DecodedLoginTokenType {
    blockHash: string;
    extraInfo?: {
        timestamp: number;
    };
    origin: string;
    ttl: number;
}
export declare const decodeLoginToken: (loginToken: string) => DecodedLoginTokenType | null;
