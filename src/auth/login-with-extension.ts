import { Address } from '@elrondnetwork/erdjs/out/address';
import { Account } from '@elrondnetwork/erdjs/out/account';
import { DappProvider } from '../types';
import { ls } from '../utils/ls-helpers';
import { initExtensionProvider } from './init-extension-provider';
import { errorParse } from '../utils/errorParse';
import { ApiNetworkProvider } from '../network-provider';
import { LoginMethodsEnum } from '../types';
import { getNewLoginExpiresTimestamp } from './expires-at';

export const loginWithExtension = async (
  dappProvider: DappProvider,
  networkProvider: ApiNetworkProvider,
  token?: string
) => {
  dappProvider = await initExtensionProvider();

  try {
    if (dappProvider) await dappProvider.login();
  } catch (e) {
    const err = errorParse(e);
    console.warn(`Something went wrong trying to login the user: ${err}`);
  }

  if (!dappProvider) {
    throw new Error(
      'Error: There were problems with auth provider initialization!'
    );
  }

  const { signature } = dappProvider.account;

  if (token) {
    ls.set('loginToken', token);
  }

  if (signature) {
    ls.set('signature', signature);
  }

  if (networkProvider) {
    try {
      const address = await dappProvider.getAddress();

      const userAddressInstance = new Address(address);
      const userAccountInstance = new Account(userAddressInstance);

      const userAccountOnNetwork = await networkProvider.getAccount(
        userAddressInstance
      );

      userAccountInstance.update(userAccountOnNetwork);

      const addressBech = userAccountInstance.address.bech32();
      const nonce = userAccountInstance.nonce.valueOf();
      const balance = userAccountInstance.balance.toString();

      addressBech && ls.set('address', addressBech);
      nonce && ls.set('nonce', nonce);
      balance && ls.set('balance', userAccountInstance.balance.toString());

      ls.set('loginMethod', LoginMethodsEnum.maiarBrowserExtension);
      ls.set('expires', getNewLoginExpiresTimestamp().toString());

      return {
        dappProvider,
        address,
      };
    } catch (e: any) {
      console.warn(
        `Something went wrong trying to synchronize the user account: ${e?.message}`
      );
    }
  }
};
