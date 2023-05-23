import { WalletConnectV2Provider } from '@multiversx/sdk-wallet-connect-provider/out/walletConnectV2Provider';
import { NativeAuthClient } from '@multiversx/sdk-native-auth-client/lib/src/native.auth.client';
export declare const loginWithMobile: (elven: any, loginToken: string, nativeAuthClient: NativeAuthClient, qrCodeContainer?: string | HTMLElement) => Promise<WalletConnectV2Provider | undefined>;
