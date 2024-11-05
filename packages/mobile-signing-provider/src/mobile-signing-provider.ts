import {
  SessionEventTypes,
  WalletConnectV2Provider,
} from './components/walletconnect-signing';
import {
  Context,
  NetworkConfig,
  NativeAuthClient,
  LocalStorage,
  EventsStore,
  EventStoreEvents,
  DappCoreWCV2CustomMethodsEnum,
  LoginMethodsEnum,
} from './components/types';

import { errorParse, getRandomAddressFromNetwork } from './components/utils';
import { qrCodeAndPairingsBuilder } from './components/qr-code-and-pairings-builder';

export class MobileSigningProvider {
  private walletConnectV2ProjectId: string;
  private walletConnectV2RelayAddresses: string[];
  private qrCodeContainer: string | HTMLElement;
  private networkConfig: NetworkConfig;
  private Message: new (...args: any[]) => unknown;
  private Transaction: new (...args: any[]) => unknown;
  private TransactionsConverter: new (...args: any[]) => unknown;
  private ls: LocalStorage;
  private logout: (context: Context) => Promise<void>;
  private getNewLoginExpiresTimestamp: () => number;
  private accountSync: (context: Context) => Promise<void>;
  private EventsStore: EventsStore;

  WalletConnectV2Provider = WalletConnectV2Provider;

  constructor(
    {
      walletConnectV2ProjectId,
      walletConnectV2RelayAddresses,
      qrCodeContainer,
    }: {
      walletConnectV2ProjectId: string;
      walletConnectV2RelayAddresses: string[];
      qrCodeContainer: string | HTMLElement;
    },
    deps: {
      networkConfig: NetworkConfig;
      Message: new (...args: any[]) => unknown;
      Transaction: new (...args: any[]) => unknown;
      TransactionsConverter: new (...args: any[]) => unknown;
      ls: LocalStorage;
      logout: (context: Context) => Promise<void>;
      getNewLoginExpiresTimestamp: () => number;
      accountSync: (context: Context) => Promise<void>;
      EventsStore: EventsStore;
    }
  ) {
    this.walletConnectV2ProjectId = walletConnectV2ProjectId;
    this.walletConnectV2RelayAddresses = walletConnectV2RelayAddresses;
    this.qrCodeContainer = qrCodeContainer;
    this.networkConfig = deps.networkConfig;
    this.Message = deps.Message;
    this.Transaction = deps.Transaction;
    this.TransactionsConverter = deps.TransactionsConverter;
    this.ls = deps.ls;
    this.logout = deps.logout;
    this.getNewLoginExpiresTimestamp = deps.getNewLoginExpiresTimestamp;
    this.accountSync = deps.accountSync;
    this.EventsStore = deps.EventsStore;
  }

  initMobileProvider = async (context: Context) => {
    if (!this.walletConnectV2ProjectId || !context.initOptions.chainType) {
      return undefined;
    }

    const providerHandlers = {
      onClientLogin: () => {},
      onClientLogout: () => this.logout(context),
      onClientEvent: (event: SessionEventTypes['event']) => {
        console.log('wc2 session event: ', event);
      },
    };

    const relayAddress = getRandomAddressFromNetwork(
      this.walletConnectV2RelayAddresses
    );

    const dappProviderInstance = new WalletConnectV2Provider(
      providerHandlers,
      this.networkConfig[context.initOptions.chainType].shortId,
      relayAddress,
      this.walletConnectV2ProjectId,
      this.Message,
      this.Transaction,
      this.TransactionsConverter
    );

    try {
      await dappProviderInstance.init();
      return dappProviderInstance;
    } catch {
      console.warn("Can't initialize the Dapp Provider!");
      return undefined;
    }
  };

  loginWithMobile = async (
    context: Context,
    loginToken: string,
    nativeAuthClient: NativeAuthClient
  ) => {
    if (!this.qrCodeContainer) {
      throw new Error(
        "You haven't provided the QR code container DOM element id"
      );
    }

    const relayAddress = getRandomAddressFromNetwork(
      this.walletConnectV2RelayAddresses
    );

    if (!relayAddress || !context.networkProvider) {
      throw new Error(
        "Something wen't wrong with the initialization (ApiNetworkProvider or Wallet Connect Bridge address), plese try to refresh the page!"
      );
    }

    if (!this.walletConnectV2ProjectId) {
      throw new Error(
        'Please provide your WalletConnect project id. You can get it here: https://cloud.walletconnect.com)'
      );
    }

    if (!context.initOptions.chainType) {
      throw new Error(
        'Please provide the chain type in ElvenJS.init function!'
      );
    }

    let qrCodeElement: HTMLElement | null;

    const providerHandlers = {
      onClientLogin: async () => {
        if (context.dappProvider instanceof WalletConnectV2Provider) {
          const address = context.dappProvider.getAddress();
          const signature = context.dappProvider.getSignature();

          this.ls.set('address', address);
          this.ls.set('loginMethod', LoginMethodsEnum.mobile);
          this.ls.set('expires', this.getNewLoginExpiresTimestamp());

          await this.accountSync(context);

          if (signature) {
            this.ls.set('signature', signature);
            this.ls.set('loginToken', loginToken);

            const accessToken = nativeAuthClient.getToken(
              address,
              loginToken,
              signature
            );

            this.ls.set('accessToken', accessToken);

            this.EventsStore.run(EventStoreEvents.onLoginSuccess);
            qrCodeElement?.replaceChildren();
          }
        }
      },
      onClientLogout: async () => {
        if (context.dappProvider instanceof WalletConnectV2Provider) {
          await this.logout(context);
        }
      },
      onClientEvent: (event: SessionEventTypes['event']) => {
        console.log('wc2 session event: ', event);
      },
    };

    const dappProvider = new WalletConnectV2Provider(
      providerHandlers,
      this.networkConfig[context.initOptions.chainType].shortId,
      relayAddress,
      this.walletConnectV2ProjectId,
      this.Message,
      this.Transaction,
      this.TransactionsConverter
    );

    try {
      if (dappProvider) {
        context.dappProvider = dappProvider;

        this.EventsStore.run(EventStoreEvents.onQrPending);

        await dappProvider.init();

        const { uri: walletConnectUri, approval } = await dappProvider.connect({
          methods: [
            DappCoreWCV2CustomMethodsEnum.mvx_cancelAction,
            DappCoreWCV2CustomMethodsEnum.mvx_signNativeAuthToken,
          ],
        });

        const wCUri = loginToken
          ? `${walletConnectUri}&token=${loginToken}`
          : walletConnectUri;

        if (this.qrCodeContainer && wCUri) {
          qrCodeElement = await qrCodeAndPairingsBuilder(
            this.qrCodeContainer,
            wCUri,
            dappProvider,
            loginToken
          );

          this.EventsStore.run(EventStoreEvents.onQrLoaded);
        }

        await dappProvider.login({
          approval,
          token: loginToken,
        });

        return dappProvider;
      }
    } catch (e) {
      const err = errorParse(e);
      console.warn(`Something went wrong trying to login the user: ${err}`);
      this.EventsStore.run(EventStoreEvents.onLoginFailure, err);
    }
  };
}
