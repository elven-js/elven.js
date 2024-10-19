import { Transaction } from './core/transaction';
import { initExtensionProvider } from './auth/init-extension-provider';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider/out/extensionProvider';
import { WalletConnectV2Provider } from '@multiversx/sdk-wallet-connect-provider/out/walletConnectV2Provider';
import { WalletProvider } from '@multiversx/sdk-web-wallet-provider/out/walletProvider';
import { NativeAuthClient } from '@multiversx/sdk-native-auth-client/lib/src/native.auth.client';
import { Message } from './core/message';
import { initMobileProvider } from './auth/init-mobile-provider';
import { ls } from './utils/ls-helpers';
import {
  ApiNetworkProvider,
  SmartContractQueryArgs,
} from './core/network-provider';
import {
  DappProvider,
  LoginMethodsEnum,
  LoginOptions,
  InitOptions,
  EventStoreEvents,
} from './types';
import { logout } from './auth/logout';
import { loginWithExtension } from './auth/login-with-extension';
import { loginWithMobile } from './auth/login-with-mobile';
import { loginWithWebWallet } from './auth/login-with-web-wallet';
import { accountSync } from './auth/account-sync';
import { errorParse } from './utils/error-parse';
import { isLoginExpired } from './auth/expires-at';
import { EventsStore } from './events-store';
import {
  networkConfig,
  defaultApiEndpoint,
  defaultChainTypeConfig,
  defaultWalletConnectV2RelayAddresses,
} from './utils/constants';
import { getParamFromUrl } from './utils/get-param-from-url';
import { initWebWalletProvider } from './auth/init-web-wallet-provider';
import { postSendTx } from './interaction/post-send-tx';
import { webWalletTxFinalize } from './interaction/web-wallet-tx-finalize';
import {
  checkNeedsGuardianSigning,
  guardianPreSignTxOperations,
  sendTxToGuardian,
} from './interaction/guardian-operations';
import { preSendTx } from './interaction/pre-send-tx';
import { webWalletSignMessageFinalize } from './interaction/web-wallet-sign-message-finalize';
import { WebviewProvider } from '@multiversx/sdk-webview-provider';
import { loginWithNativeAuthToken } from './auth/login-with-native-auth-token';
import { initializeEventsStore } from './initialize-events-store';
import { withLoginEvents } from './utils/with-login-events';
import { stringToBytes } from './core/utils';

export class ElvenJS {
  private static initOptions: InitOptions | undefined;
  static dappProvider: DappProvider;
  static networkProvider: ApiNetworkProvider | undefined;

  /**
   * Initialization of the Elven.js
   */
  static async init(options: InitOptions) {
    const state = ls.get();

    if (state.expires && isLoginExpired(state.expires)) {
      ls.clear();
      this.dappProvider = undefined;
      return;
    }

    this.initOptions = {
      chainType: defaultChainTypeConfig,
      apiUrl: defaultApiEndpoint,
      apiTimeout: 10000,
      walletConnectV2ProjectId: '',
      walletConnectV2RelayAddresses: defaultWalletConnectV2RelayAddresses,
      ...options,
    };

    this.networkProvider = new ApiNetworkProvider(this.initOptions);

    initializeEventsStore(this.initOptions);

    // Catch the nativeAuthToken and login with it (for example within xPortal Hub)
    const nativeAuthTokenFromUrl = getParamFromUrl('accessToken');
    if (nativeAuthTokenFromUrl) {
      await withLoginEvents(async (onLoginSuccess) => {
        loginWithNativeAuthToken(nativeAuthTokenFromUrl, this);
        await accountSync(this);
        onLoginSuccess();
      });
    }

    const isAddress =
      state?.address ||
      ((state.loginMethod === LoginMethodsEnum.webWallet ||
        state.loginMethod === LoginMethodsEnum.xAlias) &&
        getParamFromUrl('address'));

    if (isAddress && state?.loginMethod) {
      await withLoginEvents(async (onLoginSuccess) => {
        if (state.loginMethod === LoginMethodsEnum.browserExtension) {
          this.dappProvider = await initExtensionProvider();
        }
        if (state.loginMethod === LoginMethodsEnum.mobile) {
          this.dappProvider = await initMobileProvider(this);
        }
        if (state.loginMethod === LoginMethodsEnum.xPortalHub) {
          this.dappProvider = new WebviewProvider();
        }
        if (
          state.loginMethod === LoginMethodsEnum.webWallet &&
          this.initOptions?.chainType
        ) {
          this.dappProvider = await initWebWalletProvider(
            networkConfig[this.initOptions.chainType].walletAddress,
            this.initOptions.apiUrl
          );
        }
        if (
          state.loginMethod === LoginMethodsEnum.xAlias &&
          this.initOptions?.chainType
        ) {
          this.dappProvider = await initWebWalletProvider(
            networkConfig[this.initOptions.chainType].xAliasAddress,
            this.initOptions.apiUrl
          );
        }
        await accountSync(this);
        onLoginSuccess();
      });

      // After successful web wallet transaction (or guarded transaction that use web wallet 2FA hook) we will land back on our website
      if (this.initOptions?.chainType) {
        // We need to get params from callback url and finalize the transaction
        // It will only trigger when there is a WALLET_PROVIDER_CALLBACK_PARAM_TX_SIGNED in url params
        await webWalletTxFinalize(
          this.dappProvider,
          this.networkProvider,
          networkConfig[this.initOptions.chainType][
            state.loginMethod === LoginMethodsEnum.xAlias
              ? 'xAliasAddress'
              : 'walletAddress'
          ],
          state.nonce
        );

        // We need to get the signature in case of signing a message with web wallet or guardians 2FA hook
        webWalletSignMessageFinalize();
      }
    }
  }

  /**
   * Login function
   */
  static async login(loginMethod: LoginMethodsEnum, options?: LoginOptions) {
    const isProperLoginMethod =
      Object.values(LoginMethodsEnum).includes(loginMethod);
    if (!isProperLoginMethod) {
      const error = 'Wrong login method!';
      EventsStore.run(EventStoreEvents.onLoginFailure, error);
      throw new Error(error);
    }

    if (!this.networkProvider) {
      const error = 'Login failed: Use ElvenJs.init() first!';
      EventsStore.run(EventStoreEvents.onLoginFailure, error);
      throw new Error(error);
    }

    await withLoginEvents(async () => {
      // Native auth login token initialization
      const nativeAuthClient = new NativeAuthClient({
        apiUrl: this.initOptions?.apiUrl,
        origin: window.location.origin,
      });
      const loginToken = await nativeAuthClient.initialize();

      // Login with browser extension
      if (loginMethod === LoginMethodsEnum.browserExtension) {
        const dappProvider = await loginWithExtension(
          this,
          loginToken,
          nativeAuthClient,
          options?.callbackRoute
        );
        this.dappProvider = dappProvider;
      }

      // Login with mobile app
      if (loginMethod === LoginMethodsEnum.mobile) {
        const dappProvider = await loginWithMobile(
          this,
          loginToken,
          nativeAuthClient,
          options?.qrCodeContainer
        );
        this.dappProvider = dappProvider;
      }

      // Login with Web Wallet
      if (
        loginMethod === LoginMethodsEnum.webWallet &&
        this.initOptions?.chainType
      ) {
        const dappProvider = await loginWithWebWallet(
          networkConfig[this.initOptions.chainType].walletAddress,
          loginToken,
          this.initOptions?.chainType,
          options?.callbackRoute
        );
        this.dappProvider = dappProvider;
      }

      // Login with xAlias
      if (
        loginMethod === LoginMethodsEnum.xAlias &&
        this.initOptions?.chainType
      ) {
        // Login with xAlias is almost the same as with the web wallet, only endpoints are different
        const dappProvider = await loginWithWebWallet(
          networkConfig[this.initOptions.chainType].xAliasAddress,
          loginToken,
          this.initOptions?.chainType,
          options?.callbackRoute
        );
        this.dappProvider = dappProvider;
      }
    });
  }

  /**
   * Logout function
   */
  static async logout() {
    try {
      const isLoggedOut = await logout(this);
      this.dappProvider = undefined;
      return isLoggedOut;
    } catch (e) {
      const err = errorParse(e);
      console.warn('Something went wrong when logging out: ', err);
    }
  }

  /**
   * Sign and send function
   */
  static async signAndSendTransaction(transaction: Transaction) {
    if (!this.dappProvider) {
      const error = 'Transaction signing failed: There is no active session!';
      EventsStore.run(EventStoreEvents.onTxFailure, transaction, error);
      throw new Error(error);
    }
    if (!this.networkProvider) {
      const error =
        'Transaction signing failed: There is no active network provider!';
      EventsStore.run(EventStoreEvents.onTxFailure, transaction, error);
      throw new Error(error);
    }

    let signedTx = guardianPreSignTxOperations(transaction);

    try {
      EventsStore.run(EventStoreEvents.onTxStart, transaction);

      const currentState = ls.get();

      transaction.nonce = currentState.nonce;

      if (this.dappProvider instanceof ExtensionProvider) {
        signedTx = await this.dappProvider.signTransaction(transaction);
      }
      if (this.dappProvider instanceof WalletConnectV2Provider) {
        signedTx = await this.dappProvider.signTransaction(transaction);
      }
      if (this.dappProvider instanceof WebviewProvider) {
        signedTx = (await this.dappProvider.signTransaction(
          transaction
        )) as Transaction;
      }
      if (this.dappProvider instanceof WalletProvider) {
        await this.dappProvider.signTransaction(transaction);
      }

      if (
        currentState.loginMethod !== LoginMethodsEnum.webWallet &&
        currentState.loginMethod !== LoginMethodsEnum.xAlias
      ) {
        const needsGuardianSign = checkNeedsGuardianSigning(signedTx);

        if (!needsGuardianSign) {
          preSendTx(signedTx);
        }

        if (needsGuardianSign && this.initOptions?.chainType) {
          await sendTxToGuardian(
            signedTx,
            networkConfig[this.initOptions.chainType].walletAddress
          );

          return;
        }

        const txHash = await this.networkProvider.sendTransaction(signedTx);
        await postSendTx(signedTx, txHash, this.networkProvider);
      }
    } catch (e) {
      const err = errorParse(e);
      EventsStore.run(
        EventStoreEvents.onTxFailure,
        signedTx,
        `Getting transaction information failed! ${err}`
      );
      throw new Error(`Getting transaction information failed! ${err}`);
    }

    return signedTx;
  }

  /**
   * Sign a single message
   */
  static async signMessage(
    message: string,
    options?: { callbackUrl?: string }
  ) {
    if (!this.dappProvider) {
      const error = 'Message signing failed: There is no active session!';
      EventsStore.run(EventStoreEvents.onSignMsgFailure, message, error);
      throw new Error(error);
    }
    if (!this.networkProvider) {
      const error =
        'Message signing failed: There is no active network provider!';
      EventsStore.run(EventStoreEvents.onSignMsgFailure, message, error);
      throw new Error(error);
    }

    let messageSignature = '';

    try {
      EventsStore.run(EventStoreEvents.onSignMsgStart, message);

      if (this.dappProvider instanceof ExtensionProvider) {
        const signedMessage = await this.dappProvider.signMessage(
          new Message({ data: stringToBytes(message) })
        );

        messageSignature = Buffer.from(signedMessage?.signature || '').toString(
          'hex'
        );
      }
      if (this.dappProvider instanceof WalletConnectV2Provider) {
        const signedMessage = await this.dappProvider.signMessage(
          new Message({ data: stringToBytes(message) })
        );

        messageSignature = Buffer.from(signedMessage?.signature || '').toString(
          'hex'
        );
      }
      if (this.dappProvider instanceof WebviewProvider) {
        const signedMessage = await this.dappProvider.signMessage(
          new Message({ data: stringToBytes(message) })
        );

        messageSignature = Buffer.from(signedMessage?.signature || '').toString(
          'hex'
        );
      }
      if (this.dappProvider instanceof WalletProvider) {
        const encodeRFC3986URIComponent = (str: string) => {
          return encodeURIComponent(str).replace(
            /[!'()*]/g,
            (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
          );
        };

        const url = options?.callbackUrl || window.location.origin;
        await this.dappProvider.signMessage(
          new Message({ data: stringToBytes(message) }),
          {
            callbackUrl: encodeURIComponent(
              `${url}${
                url.includes('?') ? '&' : '?'
              }message=${encodeRFC3986URIComponent(message)}`
            ),
          }
        );
      }

      const currentState = ls.get();

      if (
        currentState.loginMethod !== LoginMethodsEnum.webWallet &&
        currentState.loginMethod !== LoginMethodsEnum.xAlias
      ) {
        EventsStore.run(
          EventStoreEvents.onSignMsgFinalized,
          message,
          messageSignature
        );
      }

      return { message, messageSignature };
    } catch (e) {
      const err = errorParse(e);
      EventsStore.run(EventStoreEvents.onSignMsgFailure, message, err);
      throw new Error(`Message signing failed! ${err}`);
    }
  }

  /**
   * Query Smart Contracts
   */
  static async queryContract({
    address,
    func,
    args = [],
    value = 0,
    caller,
  }: SmartContractQueryArgs) {
    if (!this.networkProvider) {
      throw new Error('Query failed: There is no active network provider!');
    }

    if (!address || !func) {
      throw new Error(
        'Query failed: The Query arguments are not valid! Address and func required'
      );
    }

    const queryArgs = {
      address,
      func,
      args,
      value,
      caller,
    };

    try {
      EventsStore.run(EventStoreEvents.onQueryStart, queryArgs);
      const response = await this.networkProvider.queryContract(queryArgs);
      EventsStore.run(EventStoreEvents.onQueryFinalized, response);
      return response;
    } catch (e) {
      const err = errorParse(e);
      EventsStore.run(EventStoreEvents.onQueryFinalized, queryArgs, err);
      throw new Error(`Smart contract query failed! ${err}`);
    }
  }

  /**
   * Main storage
   */
  static storage = ls;

  /**
   * Destroy and cleanup if needed
   */
  static destroy = () => {
    this.networkProvider = undefined;
    this.dappProvider = undefined;
    this.initOptions = undefined;
    EventsStore.clear();
  };
}
