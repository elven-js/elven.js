/**
 * Required for xPortal Hub integration
 * Based on sdk-dapp webview provider implementation
 * It will probably be replaced with separate library in the future
 */
import { DecodedLoginTokenType } from './decode-login-token';
interface DecodedNativeAuthTokenType extends DecodedLoginTokenType {
    address: string;
    body: string;
    signature: string;
}
export declare const decodeNativeAuthToken: (accessToken?: string) => DecodedNativeAuthTokenType | null;
export {};
