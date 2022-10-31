import { Transaction } from '@elrondnetwork/erdjs/out/transaction';
import { initExtensionProvider } from './auth/init-extension-provider';
import { ExtensionProvider } from '@elrondnetwork/erdjs-extension-provider';
import { WalletConnectProvider } from '@elrondnetwork/erdjs-wallet-connect-provider';
import { initMaiarMobileProvider } from './auth/init-maiar-mobile-provider';
import { ls } from './utils/ls-helpers';
import { ApiNetworkProvider, SmartContractQueryArgs } from './network-provider';
import {
  DappProvider,
  LoginMethodsEnum,
  LoginOptions,
  InitOptions,
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
  defaultWalletConnectBridgeAddresses,
} from './utils/constants';
import { getParamFromUrl } from './utils/get-param-from-url';
import { initWebWalletProvider } from './auth/init-web-wallet-provider';
import { postSendTx } from './interaction/post-send-tx';
import { webWalletTxFinalize } from './interaction/web-wallet-tx-finalize';
import { WalletProvider } from '@elrondnetwork/erdjs-web-wallet-provider/out';

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
      walletConnectBridgeAddresses: defaultWalletConnectBridgeAddresses,
      ...options,
    };

    this.networkProvider = new ApiNetworkProvider(this.initOptions);

    if (this.initOptions.onLoginPending) {
      EventsStore.set('onLoginPending', this.initOptions.onLoginPending);
    }
    if (this.initOptions.onLoggedIn) {
      EventsStore.set('onLoggedIn', this.initOptions.onLoggedIn);
    }
    if (this.initOptions.onLogout) {
      EventsStore.set('onLogout', this.initOptions.onLogout);
    }
    if (this.initOptions.onTxStarted) {
      EventsStore.set('onTxStarted', this.initOptions.onTxStarted);
    }
    if (this.initOptions.onTxFinalized) {
      EventsStore.set('onTxFinalized', this.initOptions.onTxFinalized);
    }

    const isAddress =
      state?.address ||
      (state.loginMethod === LoginMethodsEnum.webWallet &&
        getParamFromUrl('address'));

    if (isAddress && state?.loginMethod) {
      EventsStore.run('onLoginPending');

      if (state.loginMethod === LoginMethodsEnum.maiarBrowserExtension) {
        this.dappProvider = await initExtensionProvider();
      }
      if (state.loginMethod === LoginMethodsEnum.maiarMobile) {
        this.dappProvider = await initMaiarMobileProvider(this);
      }
      if (
        state.loginMethod === LoginMethodsEnum.webWallet &&
        this.initOptions.chainType
      ) {
        this.dappProvider = await initWebWalletProvider(
          networkConfig[this.initOptions.chainType].walletAddress
        );
      }

      await accountSync(this);

      EventsStore.run('onLoggedIn');

      if (state.loginMethod === LoginMethodsEnum.webWallet) {
        // After successful web wallet transaction we will land back on our website
        // We need to get params from callback url and finalize the transaction
        // It will only trigger when there is a WALLET_PROVIDER_CALLBACK_PARAM_TX_SIGNED in url params
        await webWalletTxFinalize(
          this.dappProvider,
          this.networkProvider,
          state.nonce
        );
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
      throw new Error('Error: Wrong login method!');
    }

    if (!this.networkProvider) {
      throw new Error('Error: Login failed: Use ElvenJs.init() first!');
    }

    try {
      // Login with Maiar browser extension
      if (loginMethod === LoginMethodsEnum.maiarBrowserExtension) {
        const dappProvider = await loginWithExtension(this, options?.token);
        this.dappProvider = dappProvider;
      }

      // Login with Maiar mobile app
      if (loginMethod === LoginMethodsEnum.maiarMobile) {
        const dappProvider = await loginWithMobile(
          this,
          options?.qrCodeContainer,
          options?.token
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
          options?.callbackRoute,
          options?.token
        );
        this.dappProvider = dappProvider;
      }
    } catch (e) {
      const err = errorParse(e);
      throw new Error(`Error: ${err}`);
    }
  }

  /**
   * Logout function
   */
  static async logout() {
    const isLoggedOut = await logout(this);
    this.dappProvider = undefined;
    return isLoggedOut;
  }

  /**
   * Sign and send function
   */
  static async signAndSendTransaction(transaction: Transaction) {
    if (!this.dappProvider) {
      throw new Error(
        'Error: Transaction signing failed: There is no active session!'
      );
    }
    if (!this.networkProvider) {
      throw new Error(
        'Error: Transaction signing failed: There is no active network provider!'
      );
    }

    try {
      EventsStore.run('onTxStarted', transaction);

      const currentState = ls.get();

      transaction.setNonce(currentState.nonce);

      if (this.dappProvider instanceof ExtensionProvider) {
        await this.dappProvider.signTransaction(transaction);
      }
      if (this.dappProvider instanceof WalletConnectProvider) {
        await this.dappProvider.signTransaction(transaction);
      }
      if (this.dappProvider instanceof WalletProvider) {
        await this.dappProvider.signTransaction(transaction);
      }

      if (currentState.loginMethod !== LoginMethodsEnum.webWallet) {
        await this.networkProvider.sendTransaction(transaction);
        await postSendTx(transaction, this.networkProvider);
      }
    } catch (e) {
      const err = errorParse(e);
      EventsStore.run('onTxFinalized', transaction);
      throw new Error(`Error: Transaction signing failed! ${err}`);
    }

    return transaction;
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
      throw new Error(
        'Error: Query failed: There is no active network provider!'
      );
    }

    if (!address || !func) {
      throw new Error(
        'Error: Query failed: The Query arguments are not valid! Address and func required'
      );
    }

    try {
      return await this.networkProvider.queryContract({
        address,
        func,
        args,
        value,
        caller,
      });
    } catch (e) {
      const err = errorParse(e);
      throw new Error(`Error: Smart contract query failed! ${err}`);
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
