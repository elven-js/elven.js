import { DappProvider } from '../types';
export declare const qrCodeAndPairingsBuilder: (qrCodeContainer: string | HTMLElement, walletConnectUri: string, dappProvider: DappProvider, token?: string) => Promise<HTMLElement | null>;
