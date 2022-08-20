import { Account } from '@elrondnetwork/erdjs/out/account';
import { TransactionWatcher } from '@elrondnetwork/erdjs/out/transactionWatcher';
import { Transaction } from '@elrondnetwork/erdjs/out/transaction';
import { initExtensionProvider } from './auth/init-extension-provider';
import { ExtensionProvider } from '@elrondnetwork/erdjs-extension-provider';
import { WalletConnectProvider } from '@elrondnetwork/erdjs-wallet-connect-provider';
import { initMaiarMobileProvider } from './auth/init-maiar-mobile-provider';
import { ls } from './utils/ls-helpers';
import { ApiNetworkProvider, InitOptions } from './network-provider';
import { DappProvider, LoginMethodsEnum, LoginOptions } from './types';
import { logout } from './auth/logout';
import { loginWithExtension } from './auth/login-with-extension';
import { loginWithMobile } from './auth/login-with-mobile';
import { accountSync } from './auth/account-sync';
import { errorParse } from './utils/errorParse';
import { isLoginExpired } from './auth/expires-at';

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

    this.initOptions = options;

    this.networkProvider = new ApiNetworkProvider(this.initOptions);

    if (state?.address && state?.loginMethod) {
      if (state.loginMethod === LoginMethodsEnum.maiarBrowserExtension) {
        this.dappProvider = await initExtensionProvider();
      }
      if (state.loginMethod === LoginMethodsEnum.maiarMobile) {
        this.dappProvider = await initMaiarMobileProvider(this);
      }

      await accountSync(this);

      return true;
    }
    return false;
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
      if (
        !this.dappProvider &&
        loginMethod === LoginMethodsEnum.maiarBrowserExtension
      ) {
        const dappProvider = await loginWithExtension(this, options?.token);
        this.dappProvider = dappProvider;
      }

      // Login with Maiar mobile app
      if (!this.dappProvider && loginMethod === LoginMethodsEnum.maiarMobile) {
        const dappProvider = await loginWithMobile(
          this,
          options?.onWalletConnectLogin,
          options?.onWalletConnectLogout,
          options?.qrCodeContainerId,
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
      const currentNonce = ls.get('nonce');
      transaction.setNonce(currentNonce);

      if (this.dappProvider instanceof ExtensionProvider) {
        await this.dappProvider.signTransaction(transaction);
      }
      if (this.dappProvider instanceof WalletConnectProvider) {
        await this.dappProvider.signTransaction(transaction);
      }

      await this.networkProvider.sendTransaction(transaction);

      const transactionWatcher = new TransactionWatcher(this.networkProvider);
      await transactionWatcher.awaitCompleted(transaction);
      const sender = transaction.getSender();
      const senderAccount = new Account(sender);
      const userAccountOnNetwork = await this.networkProvider.getAccount(
        sender
      );
      senderAccount.update(userAccountOnNetwork);
      ls.set('address', senderAccount.address.bech32());
      ls.set('nonce', senderAccount.getNonceThenIncrement().valueOf());
      ls.set('balance', senderAccount.balance.toString());
    } catch (e) {
      const err = errorParse(e);
      throw new Error(`Error: Transaction signing failed! ${err}`);
    }

    return transaction;
  }

  /**
   * Main storage exposed
   */
  static storage = ls;

  /**
   * Destroy and cleanup if needed
   */
  static destroy = () => {
    this.networkProvider = undefined;
    this.dappProvider = undefined;
    this.initOptions = undefined;
  };
}