import { NativeAuthClient } from '@multiversx/sdk-native-auth-client/lib/src/native.auth.client';
export declare const loginWithExtension: (elven: any, loginToken: string, nativeAuthClient: NativeAuthClient, callbackRoute?: string) => Promise<import("@multiversx/sdk-extension-provider/out/extensionProvider").ExtensionProvider | undefined>;
