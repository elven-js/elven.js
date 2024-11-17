import { Transaction } from './core/transaction';
import { initExtensionProvider } from './auth/init-extension-provider';
import { ExtensionProvider } from './core/browser-extension-signing';
import { WalletProvider } from './core/web-wallet-signing';
import { NativeAuthClient } from './core/native-auth-client';
import { WebviewProvider } from './core/webview-signing';
import { Message } from './core/message';
import { initWebWalletProvider } from './auth/init-web-wallet-provider';
import { ls } from './utils/ls-helpers';
import {
  ApiNetworkProvider,
  SmartContractQueryArgs,
} from './core/network-provider';
import {
  LoginMethodsEnum,
  LoginOptions,
  InitOptions,
  EventStoreEvents,
  MobileSigningProviderDeps,
} from './types';
import { logout as logoutHelper } from './auth/logout';
import { loginWithExtension } from './auth/login-with-extension';
import { loginWithWebWallet } from './auth/login-with-web-wallet';
import { accountSync } from './auth/account-sync';
import { errorParse } from './utils/error-parse';
import { getNewLoginExpiresTimestamp, isLoginExpired } from './auth/expires-at';
import * as EventsStore from './events-store';
import {
  networkConfig,
  defaultApiEndpoint,
  defaultChainTypeConfig,
} from './utils/constants';
import { getParamFromUrl } from './utils/get-param-from-url';
import { postSendTx } from './interaction/post-send-tx';
import { webWalletTxFinalize } from './interaction/web-wallet-tx-finalize';
import {
  checkNeedsGuardianSigning,
  guardianPreSignTxOperations,
  sendTxToGuardian,
} from './interaction/guardian-operations';
import { preSendTx } from './interaction/pre-send-tx';
import { webWalletSignMessageFinalize } from './interaction/web-wallet-sign-message-finalize';
import { loginWithNativeAuthToken } from './auth/login-with-native-auth-token';
import { initializeEventsStore } from './initialize-events-store';
import { withLoginEvents } from './utils/with-login-events';
import { bytesToHex, stringToBytes } from './core/utils';
import { TransactionsConverter } from './core/transaction-converter';
import { config, resetConfig } from './config';

/**
 * Initialization of the Elven.js
 */
export const init = async (options: InitOptions) => {
  const state = ls.get();

  if (state.expires && isLoginExpired(state.expires)) {
    ls.clear();
    config.dappProvider = undefined;
    return;
  }

  config.initOptions = {
    chainType: defaultChainTypeConfig,
    apiUrl: defaultApiEndpoint,
    apiTimeout: 10000,
    ...options,
  };

  config.networkProvider = new ApiNetworkProvider(config.initOptions);

  initializeEventsStore(config.initOptions);

  // Initialize the optional mobile provider
  const MobileProvider =
    config.initOptions?.externalSigningProviders?.mobile?.provider;
  if (MobileProvider) {
    const deps: MobileSigningProviderDeps = {
      networkConfig,
      Message,
      Transaction,
      TransactionsConverter,
      ls,
      logout: logoutHelper,
      getNewLoginExpiresTimestamp,
      accountSync,
      EventsStore,
    };
    const mobileProviderConfig =
      config.initOptions?.externalSigningProviders?.mobile?.config;
    if (mobileProviderConfig) {
      config.mobileProvider = new MobileProvider(mobileProviderConfig, deps);
    } else {
      throw new Error('Mobile provider config is required!');
    }
  }

  // Catch the nativeAuthToken and login with it (for example within xPortal Hub)
  const nativeAuthTokenFromUrl = getParamFromUrl('accessToken');
  if (nativeAuthTokenFromUrl) {
    await withLoginEvents(async (onLoginSuccess) => {
      loginWithNativeAuthToken(nativeAuthTokenFromUrl, config);
      await accountSync(config);
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
        config.dappProvider = await initExtensionProvider();
      }
      if (
        state.loginMethod === LoginMethodsEnum.mobile &&
        config.mobileProvider
      ) {
        config.dappProvider =
          await config.mobileProvider?.initMobileProvider(config);
      }
      if (state.loginMethod === LoginMethodsEnum.webview) {
        config.dappProvider = new WebviewProvider();
      }
      if (
        state.loginMethod === LoginMethodsEnum.webWallet &&
        config.initOptions?.chainType
      ) {
        config.dappProvider = await initWebWalletProvider(
          networkConfig[config.initOptions.chainType].walletAddress,
          config.initOptions.apiUrl
        );
      }
      if (
        state.loginMethod === LoginMethodsEnum.xAlias &&
        config.initOptions?.chainType
      ) {
        config.dappProvider = await initWebWalletProvider(
          networkConfig[config.initOptions.chainType].xAliasAddress,
          config.initOptions.apiUrl
        );
      }
      await accountSync(config);
      onLoginSuccess();
    });

    // After successful web wallet transaction (or guarded transaction that use web wallet 2FA hook) we will land back on our website
    if (config.initOptions?.chainType) {
      // We need to get params from callback url and finalize the transaction
      // It will only trigger when there is a WALLET_PROVIDER_CALLBACK_PARAM_TX_SIGNED in url params
      await webWalletTxFinalize(
        config.dappProvider,
        config.networkProvider,
        networkConfig[config.initOptions.chainType][
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
};

/**
 * Login function
 */
export const login = async (
  loginMethod: LoginMethodsEnum,
  options?: LoginOptions
) => {
  const isProperLoginMethod =
    Object.values(LoginMethodsEnum).includes(loginMethod);
  if (!isProperLoginMethod) {
    const error = 'Wrong login method!';
    EventsStore.run(EventStoreEvents.onLoginFailure, error);
    throw new Error(error);
  }

  if (!config.networkProvider) {
    const error = 'Login failed: Use ElvenJs.init() first!';
    EventsStore.run(EventStoreEvents.onLoginFailure, error);
    throw new Error(error);
  }

  await withLoginEvents(async () => {
    // Native auth login token initialization
    const nativeAuthClient = new NativeAuthClient({
      apiUrl: config.initOptions?.apiUrl,
      origin: window.location.origin,
    });

    const loginToken = await nativeAuthClient.initialize({
      timestamp: `${Math.floor(Date.now() / 1000)}`,
    });

    // Login with browser extension
    if (loginMethod === LoginMethodsEnum.browserExtension) {
      const dp = await loginWithExtension(
        config,
        loginToken,
        nativeAuthClient,
        options?.callbackRoute
      );
      config.dappProvider = dp;
    }

    // Login with optional mobile provider
    if (loginMethod === LoginMethodsEnum.mobile && config.mobileProvider) {
      const dp = await config.mobileProvider?.loginWithMobile(
        config,
        loginToken,
        nativeAuthClient
      );
      config.dappProvider = dp;
    }

    // Login with Web Wallet
    if (
      loginMethod === LoginMethodsEnum.webWallet &&
      config.initOptions?.chainType
    ) {
      const dp = await loginWithWebWallet(
        networkConfig[config.initOptions.chainType].walletAddress,
        loginToken,
        config.initOptions?.chainType,
        options?.callbackRoute
      );
      config.dappProvider = dp;
    }

    // Login with xAlias
    if (
      loginMethod === LoginMethodsEnum.xAlias &&
      config.initOptions?.chainType
    ) {
      // Login with xAlias is almost the same as with the web wallet, only endpoints are different
      const dp = await loginWithWebWallet(
        networkConfig[config.initOptions.chainType].xAliasAddress,
        loginToken,
        config.initOptions?.chainType,
        options?.callbackRoute
      );
      config.dappProvider = dp;
    }
  });
};

/**
 * Logout function
 */
export const logout = async () => {
  try {
    const isLoggedOut = await logoutHelper(config);
    config.dappProvider = undefined;
    return isLoggedOut;
  } catch (e) {
    const err = errorParse(e);
    console.warn('Something went wrong when logging out: ', err);
  }
};

/**
 * Sign and send function
 */
export const signAndSendTransaction = async (transaction: Transaction) => {
  if (!config.dappProvider) {
    const error = 'Transaction signing failed: There is no active session!';
    EventsStore.run(EventStoreEvents.onTxFailure, transaction, error);
    throw new Error(error);
  }
  if (!config.networkProvider) {
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

    if (config.dappProvider instanceof ExtensionProvider) {
      signedTx = await config.dappProvider.signTransaction(transaction);
    }
    if (
      config.mobileProvider &&
      config.dappProvider instanceof
        config.mobileProvider.WalletConnectV2Provider
    ) {
      signedTx = await config.dappProvider.signTransaction(transaction);
    }
    if (config.dappProvider instanceof WebviewProvider) {
      signedTx = await config.dappProvider.signTransaction(transaction);
    }
    if (config.dappProvider instanceof WalletProvider) {
      await config.dappProvider.signTransaction(transaction);
    }

    if (
      currentState.loginMethod !== LoginMethodsEnum.webWallet &&
      currentState.loginMethod !== LoginMethodsEnum.xAlias
    ) {
      const needsGuardianSign = checkNeedsGuardianSigning(signedTx);

      if (!needsGuardianSign) {
        preSendTx(signedTx);
      }

      if (needsGuardianSign && config.initOptions?.chainType) {
        await sendTxToGuardian(
          signedTx,
          networkConfig[config.initOptions.chainType].walletAddress
        );

        return;
      }

      const response = await config.networkProvider.sendTransaction(signedTx);
      await postSendTx(response, config.networkProvider);
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
};

/**
 * Sign a single message
 */
export const signMessage = async (
  message: string,
  options?: { callbackUrl?: string }
) => {
  if (!config.dappProvider) {
    const error = 'Message signing failed: There is no active session!';
    EventsStore.run(EventStoreEvents.onSignMsgFailure, message, error);
    throw new Error(error);
  }
  if (!config.networkProvider) {
    const error =
      'Message signing failed: There is no active network provider!';
    EventsStore.run(EventStoreEvents.onSignMsgFailure, message, error);
    throw new Error(error);
  }

  let messageSignature = '';

  try {
    EventsStore.run(EventStoreEvents.onSignMsgStart, message);

    if (config.dappProvider instanceof ExtensionProvider) {
      const signedMessage = await config.dappProvider.signMessage(
        new Message({ data: stringToBytes(message) })
      );

      if (typeof signedMessage !== 'string' && signedMessage?.signature) {
        messageSignature = bytesToHex(signedMessage.signature);
      }
    }

    if (
      config.mobileProvider &&
      config.dappProvider instanceof
        config.mobileProvider.WalletConnectV2Provider
    ) {
      const signedMessage = await config.dappProvider.signMessage(
        new Message({ data: stringToBytes(message) })
      );

      if (typeof signedMessage !== 'string' && signedMessage?.signature) {
        messageSignature = bytesToHex(signedMessage.signature);
      }
    }

    if (config.dappProvider instanceof WebviewProvider) {
      const signedMessage = await config.dappProvider.signMessage(
        new Message({ data: stringToBytes(message) })
      );

      if (typeof signedMessage !== 'string' && signedMessage?.signature) {
        messageSignature = bytesToHex(signedMessage.signature);
      }
    }
    if (config.dappProvider instanceof WalletProvider) {
      const encodeRFC3986URIComponent = (str: string) => {
        return encodeURIComponent(str).replace(
          /[!'()*]/g,
          (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
        );
      };

      const url = options?.callbackUrl || window.location.origin;
      await config.dappProvider.signMessage(
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
};

/**
 * Query Smart Contracts
 */
export const queryContract = async ({
  address,
  func,
  args = [],
  value = 0,
  caller,
}: SmartContractQueryArgs) => {
  if (!config.networkProvider) {
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
    const response = await config.networkProvider.queryContract(queryArgs);
    EventsStore.run(EventStoreEvents.onQueryFinalized, response);
    return response;
  } catch (e) {
    const err = errorParse(e);
    EventsStore.run(EventStoreEvents.onQueryFinalized, queryArgs, err);
    throw new Error(`Smart contract query failed! ${err}`);
  }
};

/**
 * Main storage
 */
export const storage = ls;

/**
 * Destroy and cleanup if needed
 */
export const destroy = () => {
  resetConfig();
  EventsStore.clear();
};
