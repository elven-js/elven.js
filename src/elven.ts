import { TokenPayment } from '@elrondnetwork/erdjs/out/tokenPayment';
import { Address } from '@elrondnetwork/erdjs/out/address';
import { Account } from '@elrondnetwork/erdjs/out/account';
import { Transaction } from '@elrondnetwork/erdjs/out/transaction';
import { TransactionPayload } from '@elrondnetwork/erdjs/out/transactionPayload';
import { TransactionWatcher } from '@elrondnetwork/erdjs/out/transactionWatcher';
import { BytesValue } from '@elrondnetwork/erdjs/out/smartcontracts/typesystem/bytes';
import {
  BigUIntValue,
  U32Value,
} from '@elrondnetwork/erdjs/out/smartcontracts/typesystem/numerical';
import { BooleanValue } from '@elrondnetwork/erdjs/out/smartcontracts/typesystem/boolean';
import { ContractCallPayloadBuilder } from '@elrondnetwork/erdjs/out/smartcontracts/transactionPayloadBuilders';
import { ContractFunction } from '@elrondnetwork/erdjs/out/smartcontracts/function';
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

declare global {
  interface Window {
    ElvenJS: any;
  }
}

class ElvenJS {
  private static initOptions: InitOptions;
  static dappProvider: DappProvider;
  static networkProvider: ApiNetworkProvider;

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
        this.dappProvider = await initMaiarMobileProvider();
      }

      await accountSync();

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
        const dappProvider = await loginWithExtension(options?.token);
        this.dappProvider = dappProvider;
      }

      // Login with Maiar mobile app
      if (!this.dappProvider && loginMethod === LoginMethodsEnum.maiarMobile) {
        const dappProvider = await loginWithMobile(
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
    const isLoggedOut = await logout();
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
      throw new Error(`Error: Transaction signing failed! ${e?.message}`);
    }

    return transaction;
  }

  /**
   * Main storage exposed
   */
  static storage = ls;

  /**
   * erdjs most usefull exports
   */
  static TokenPayment = TokenPayment;
  static Address = Address;
  static Account = Account;
  static Transaction = Transaction;
  static TransactionPayload = TransactionPayload;
  static TransactionWatcher = TransactionWatcher;
  static BytesValue = BytesValue;
  static BigUIntValue = BigUIntValue;
  static U32Value = U32Value;
  static BooleanValue = BooleanValue;
  static ContractCallPayloadBuilder = ContractCallPayloadBuilder;
  static ContractFunction = ContractFunction;
}

/**
 * The ElvenJS is exposed as a global, in the future it can relay only on ES6 modules
 */
window.ElvenJS = ElvenJS;
