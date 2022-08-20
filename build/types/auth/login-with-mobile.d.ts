import { WalletConnectProvider } from '@elrondnetwork/erdjs-wallet-connect-provider';
export declare const loginWithMobile: (elven: any, onWalletConnectLogin?: () => void, onWalletConnectLogout?: () => void, qrCodeContainerId?: string, token?: string) => Promise<WalletConnectProvider | undefined>;
