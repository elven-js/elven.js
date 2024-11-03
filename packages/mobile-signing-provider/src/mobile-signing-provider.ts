import { WalletConnectV2Provider } from './components/walletconnect-signing';

export class MobileSigningProvider {
  private walletConnectV2ProjectId: string;
  private walletConnectV2RelayAddresses: string[];
  private qrCodeContainer: string | HTMLElement;
  WalletConnectV2Provider = WalletConnectV2Provider;

  constructor({
    walletConnectV2ProjectId,
    walletConnectV2RelayAddresses,
    qrCodeContainer,
  }: {
    walletConnectV2ProjectId: string;
    walletConnectV2RelayAddresses: string[];
    qrCodeContainer: string | HTMLElement;
  }) {
    this.walletConnectV2ProjectId = walletConnectV2ProjectId;
    this.walletConnectV2RelayAddresses = walletConnectV2RelayAddresses;
    this.qrCodeContainer = qrCodeContainer;
  }
  // TODO: think how to handle types
  initMobileProvider = async (
    context: any,
    logout: any,
    networkConfig: any,
    Message: any,
    Transaction: any,
    TransactionsConverter: any
  ) => {
    const { initMobileProvider } = await import(
      './components/init-mobile-provider'
    );
    return initMobileProvider(
      context,
      logout,
      networkConfig,
      Message,
      Transaction,
      TransactionsConverter,
      this.walletConnectV2ProjectId,
      this.walletConnectV2RelayAddresses
    );
  };

  // TODO: think how to handle types
  loginWithMobile = async (
    context: any,
    loginToken: string,
    nativeAuthClient: any,
    ls: any,
    logout: any,
    getNewLoginExpiresTimestamp: any,
    accountSync: any,
    EventsStore: any,
    networkConfig: any,
    Message: any,
    Transaction: any,
    TransactionsConverter: any
  ) => {
    const { loginWithMobile } = await import('./components/login-with-mobile');
    return loginWithMobile(
      context,
      loginToken,
      nativeAuthClient,
      ls,
      logout,
      getNewLoginExpiresTimestamp,
      accountSync,
      EventsStore,
      networkConfig,
      Message,
      Transaction,
      TransactionsConverter,
      this.walletConnectV2ProjectId,
      this.walletConnectV2RelayAddresses,
      this.qrCodeContainer
    );
  };
}
